/* ==========================================================================
   软考讲义阅读版交互
   源码：tools/app.js —— 构建时原样拷贝为 docs/app.js，请勿手改 docs/
   --------------------------------------------------------------------------
   零依赖、无网络请求、约 6KB。负责六件事：
     1. 深浅色主题切换（记忆到 localStorage，跟随系统首选项）
     2. 由正文标题自动生成本页大纲 + 滚动高亮当前小节
     3. 本页大纲的归位（宽屏挂右栏 / 窄屏回到左侧抽屉）+ 窄屏左侧抽屉目录
     4. 顶部阅读进度条 + 回到顶部
     5. 代码块一键复制
     6. 学习状态标记（页面/章节两级：未开始/进行中/已理解/稍后学习，
        存 localStorage 单一 JSON 文档，支持导出/导入，便于后期接 WebDAV 同步）
   所有模块都先检测目标元素是否存在，目录页等无侧栏页面可安全复用。
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const main = document.querySelector('main');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sidebar = document.querySelector('.sidebar');
  const rail = document.querySelector('.rail');
  const scrim = document.querySelector('.scrim');
  const tocBtn = document.querySelector('[data-action="toc"]');
  const tocBlock = document.querySelector('[data-toc-block]');

  /* ---------------------------------------------------------------- 主题 */
  const THEME_KEY = 'ruankao-theme';
  const themeBtn = document.querySelector('[data-action="theme"]');

  function paintThemeBtn() {
    const dark = root.dataset.theme === 'dark';
    if (!themeBtn) return;
    themeBtn.textContent = dark ? '浅色' : '深色';
    themeBtn.setAttribute('aria-label', dark ? '切换到浅色主题' : '切换到深色主题');
    themeBtn.setAttribute('aria-pressed', String(dark));
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem(THEME_KEY, next); } catch { /* 隐私模式忽略 */ }
      paintThemeBtn();
    });
    paintThemeBtn();
  }

  /* ------------------------------------------------------------ 本页大纲 */
  const tocBox = document.querySelector('[data-toc-nav]');

  if (tocBox && main) {
    // 标题 + 「答案与解析」折叠块；折叠块内部的 h3 不单独列出
    const nodes = [...main.querySelectorAll('h2, h3, [data-toc]')].filter(
      el => el.tagName === 'DETAILS' || !el.closest('details'),
    );

    const links = [];
    nodes.forEach((el, i) => {
      if (!el.id) el.id = `toc-${i + 1}`;
      const raw = (el.dataset.toc || el.textContent || '').trim().replace(/\s+/g, ' ');
      if (!raw) return;

      // 星级从标题文字里摘出来，单独着色
      const m = raw.match(/^(.*?)\s*([★☆]+)\s*$/);
      const label = m ? m[1] : raw;
      const stars = m ? m[2] : '';

      const a = document.createElement('a');
      a.href = `#${el.id}`;
      if (el.tagName === 'H3') a.className = 'lv3';
      a.append(label);
      if (/[★☆]/.test(raw)) a.insertAdjacentHTML('beforeend', `<span class="s">${stars || '★'}</span>`);
      // 大纲条目也带学习状态点：有 data-status-key 的标题同步显示，点击可切换
      if (el.dataset.statusKey) {
        const dot = document.createElement('i');
        dot.className = 'sb-dot';
        dot.dataset.statusKeyDot = el.dataset.statusKey;
        a.prepend(dot);
      }

      if (el.tagName === 'DETAILS') {
        a.addEventListener('click', () => { el.open = true; });
      }

      tocBox.append(a);
      links.push({ el, a });
    });

    // 标题右侧补条目数：长文先知道「这一页有多少节」
    const tocTitle = tocBlock && tocBlock.querySelector('.side-title');
    if (tocTitle && links.length) {
      tocTitle.insertAdjacentHTML('beforeend', `<span class="cnt">${links.length}</span>`);
    }

    // 滚动高亮：取「已滚过顶栏的最后一个小节」
    if (links.length) {
      let ticking = false;
      const sync = () => {
        ticking = false;
        const line = (parseInt(getComputedStyle(root).getPropertyValue('--topbar-h'), 10) || 54) + 24;
        let current = links[0];
        for (const item of links) {
          if (item.el.getBoundingClientRect().top <= line) current = item;
          else break;
        }
        for (const item of links) item.a.classList.toggle('active', item === current);
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(sync);
      };
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll, { passive: true });
      sync();
    }
  }

  /* ------------------------------------------- 本页大纲：宽屏挂正文右侧 */
  // 同一份大纲块，宽屏（≥1200px）放右栏、窄屏移回左侧总纲下方，
  // 避免为「本页大纲」再多开一个入口；宽度切换时只搬一次 DOM。
  if (tocBlock && sidebar && rail) {
    const wide = window.matchMedia('(min-width: 1200px)');
    const place = () => {
      const home = wide.matches ? rail : sidebar;
      if (tocBlock.parentElement !== home) home.append(tocBlock);
    };
    place();
    wide.addEventListener('change', place);
  }

  /* -------------------------------------------------------- 抽屉目录 */
  if (sidebar && tocBtn) {
    const setOpen = open => {
      sidebar.classList.toggle('open', open);
      if (scrim) scrim.classList.toggle('show', open);
      tocBtn.setAttribute('aria-expanded', String(open));
    };

    tocBtn.addEventListener('click', () => setOpen(!sidebar.classList.contains('open')));
    if (scrim) scrim.addEventListener('click', () => setOpen(false));
    sidebar.addEventListener('click', e => {
      if (e.target.closest('a') && sidebar.classList.contains('open')) setOpen(false);
    });
    addEventListener('keydown', e => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* -------------------------------------------------- 进度条 / 回到顶部 */
  const bar = document.querySelector('.progress i');
  const toTop = document.querySelector('.to-top');

  if (bar || toTop) {
    let ticking = false;
    const sync = () => {
      ticking = false;
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
      if (bar) bar.style.transform = `scaleX(${ratio})`;
      if (toTop) toTop.classList.toggle('show', scrolled > 640);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sync);
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    sync();
  }

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------ 代码复制 */
  if (main) {
    main.querySelectorAll('pre').forEach(pre => {
      const code = pre.querySelector('code');
      if (!code) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = '复制';
      btn.addEventListener('click', async () => {
        const text = code.innerText;
        let ok = true;
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // file:// 或权限受限时的兜底
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.append(ta);
          ta.select();
          ok = document.execCommand('copy');
          ta.remove();
        }
        btn.textContent = ok ? '已复制' : '复制失败';
        setTimeout(() => { btn.textContent = '复制'; }, 1600);
      });
      pre.append(btn);
    });
  }

  /* ------------------------------------------------------------ 学习状态 */
  // 单一 JSON 文档存 localStorage（对后期 WebDAV 同步友好：整个 items 可直接上传/合并）。
  // key 约定：页面级 = 文件名（如 "01-数据结构与算法"）；
  //          章节级 = "文件名#标题文本"（由构建脚本注入 data-status-key）。
  // 状态值：none 未开始 / doing 进行中 / done 已理解 / later 稍后学习。
  const STATUS_KEY = 'ruankao-study-status';
  const STATUSES = [
    { v: 'none', t: '未开始' },
    { v: 'doing', t: '进行中' },
    { v: 'done', t: '已理解' },
    { v: 'later', t: '稍后学习' },
  ];
  const emptyStore = () => ({ version: 1, updatedAt: '', items: {} });

  let statusStore = (() => {
    try {
      const s = JSON.parse(localStorage.getItem(STATUS_KEY));
      if (s && s.items && typeof s.items === 'object') return s;
    } catch { /* 存储损坏或隐私模式，当空处理 */ }
    return emptyStore();
  })();

  function saveStore() {
    statusStore.updatedAt = new Date().toISOString();
    try { localStorage.setItem(STATUS_KEY, JSON.stringify(statusStore, null, 2)); } catch { /* 忽略 */ }
  }

  const statusOf = key => STATUSES.some(s => s.v === statusStore.items[key]) ? statusStore.items[key] : 'none';
  const statusText = v => (STATUSES.find(s => s.v === v) || STATUSES[0]).t;
  const nextStatus = v => STATUSES[(STATUSES.findIndex(s => s.v === v) + 1) % STATUSES.length].v;

  // 把存储刷到所有挂点上：data-status 属性驱动 CSS 变量着色
  function applyStatus() {
    document.querySelectorAll('[data-status-page]').forEach(el => {
      const v = statusOf(el.dataset.statusPage);
      const cur = el.querySelector('.sb-current');
      if (cur) {
        cur.dataset.status = v;
        const t = cur.querySelector('.sb-text');
        if (t) t.textContent = statusText(v);
      }
      el.querySelectorAll('.sb-menu button[data-set]').forEach(b => {
        b.classList.toggle('is-current', b.dataset.set === v);
      });
    });
    document.querySelectorAll('[data-status-page-dot]').forEach(el => {
      el.dataset.status = statusOf(el.dataset.statusPageDot);
    });
    document.querySelectorAll('[data-status-key]').forEach(el => {
      el.dataset.status = statusOf(el.dataset.statusKey);
    });
    document.querySelectorAll('[data-status-key-dot]').forEach(el => {
      el.dataset.status = statusOf(el.dataset.statusKeyDot);
    });
  }

  function setStatus(key, v) {
    if (!key) return;
    statusStore.items[key] = v;
    saveStore();
    applyStatus();
  }

  // 章节圆点（正文标题旁 + 大纲条目里）：点击循环 未开始→进行中→已理解→稍后学习
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-status-key], [data-status-key-dot]');
    if (!el) return;
    const key = el.dataset.statusKey || el.dataset.statusKeyDot;
    setStatus(key, nextStatus(statusOf(key)));
  });

  // 底部状态条：弹出四选项菜单
  document.querySelectorAll('[data-status-page]').forEach(bar => {
    const key = bar.dataset.statusPage;
    const cur = bar.querySelector('.sb-current');
    const menu = bar.querySelector('.sb-menu');
    if (!cur || !menu) return;
    const close = () => { menu.hidden = true; cur.setAttribute('aria-expanded', 'false'); };
    cur.addEventListener('click', () => {
      const open = menu.hidden;
      document.querySelectorAll('.sb-menu:not([hidden])').forEach(m => { m.hidden = true; });
      document.querySelectorAll('.sb-current[aria-expanded="true"]').forEach(c => c.setAttribute('aria-expanded', 'false'));
      menu.hidden = !open;
      cur.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', e => {
      const opt = e.target.closest('[data-set]');
      if (!opt) return;
      setStatus(key, opt.dataset.set);
      close();
    });
  });

  // 点空白处 / Esc 收起所有状态菜单
  document.addEventListener('click', e => {
    if (e.target.closest('.sb-picker')) return;
    document.querySelectorAll('.sb-menu:not([hidden])').forEach(m => { m.hidden = true; });
    document.querySelectorAll('.sb-current[aria-expanded="true"]').forEach(c => c.setAttribute('aria-expanded', 'false'));
  });
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.sb-menu:not([hidden])').forEach(m => { m.hidden = true; });
    document.querySelectorAll('.sb-current[aria-expanded="true"]').forEach(c => c.setAttribute('aria-expanded', 'false'));
  });

  // 导出 / 导入：WebDAV 同步落地前的过渡方案
  document.querySelectorAll('[data-action="status-export"]').forEach(btn => {
    btn.addEventListener('click', () => {
      saveStore();
      const blob = new Blob([JSON.stringify(statusStore, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `study-status-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      const old = btn.textContent;
      btn.textContent = '已导出';
      setTimeout(() => { btn.textContent = old; }, 1600);
    });
  });

  document.querySelectorAll('[data-action="status-import"]').forEach(btn => {
    const input = btn.parentElement.querySelector('[data-status-file]');
    if (!input) return;
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        let ok = false;
        try {
          const s = JSON.parse(reader.result);
          if (s && s.items && typeof s.items === 'object') {
            const clean = {};
            for (const [k, v] of Object.entries(s.items)) {
              if (typeof k === 'string' && STATUSES.some(x => x.v === v)) clean[k] = v;
            }
            statusStore = { version: s.version || 1, updatedAt: s.updatedAt || '', items: clean };
            saveStore();
            applyStatus();
            ok = true;
          }
        } catch { /* 非法 JSON，按导入失败处理 */ }
        const old = btn.textContent;
        btn.textContent = ok ? '导入成功' : '导入失败';
        setTimeout(() => { btn.textContent = old; }, 1600);
      };
      reader.readAsText(file);
    });
  });

  applyStatus();
})();
