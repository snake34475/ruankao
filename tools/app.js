/* ==========================================================================
   软考讲义阅读版交互
   源码：tools/app.js —— 构建时原样拷贝为 docs/app.js，请勿手改 docs/
   --------------------------------------------------------------------------
   零依赖、无网络请求、约 5KB。负责五件事：
     1. 深浅色主题切换（记忆到 localStorage，跟随系统首选项）
     2. 由正文标题自动生成本页大纲 + 滚动高亮当前小节
     3. 本页大纲的归位（宽屏挂右栏 / 窄屏回到左侧抽屉）+ 窄屏左侧抽屉目录
     4. 顶部阅读进度条 + 回到顶部
     5. 代码块一键复制
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
})();
