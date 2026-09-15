#!/usr/bin/env node
// Markdown 讲义 → 静态 HTML 构建脚本
// 用法：npm run build（在仓库根目录执行）
// 输入：软件设计师考点大纲.md + 软考学习/*.md（README.md / AGENTS.md 不转换）
// 输出：docs/*.html（平级目录）+ docs/style.css + docs/app.js
//
// v2：阅读版 UI
//   · 每页生成「顶栏 + 左栏总纲梯队目录 + 正文 + 右栏本页大纲」骨架，
//     样式见 tools/style.css，交互（主题切换、滚动高亮、大纲归位、
//     抽屉目录、复制代码）见 tools/app.js；
//   · ★ 星级渲染成琥珀色徽标；页首引用块升级为导语卡；
//   · 「答案与解析」整段折叠进 <details>，做题时不会误瞄答案；
//   · 索引页从 00-总览与进度.md 读取勾选状态与分值注解，生成分梯队卡片。
import { marked } from 'marked';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { basename, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'docs');
const OUTLINE = '软件设计师考点大纲.md';
const STUDY_DIR = '软考学习';
const PROGRESS_MD = join(root, STUDY_DIR, '00-总览与进度.md');

// 转换顺序即页面先后顺序（用于生成上一课/下一课导航）
const pageSources = [
  { rel: OUTLINE, src: join(root, OUTLINE) },
  ...readdirSync(join(root, STUDY_DIR))
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => ({ rel: `${STUDY_DIR}/${f}`, src: join(root, STUDY_DIR, f) })),
];

/* ------------------------------------------------------------------ 小工具 */
function decodeSafe(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function extractTitle(md, fallback) {
  return md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback;
}

// 仅重写指向仓库内 .md 的相对链接；docs/ 为平级目录，统一取目标文件名。
// 指向尚未生成课程的链接（如 03-xxx.md）照常重写，页面暂 404 属正常。
function rewriteMdLinks(html) {
  return html.replace(/href="([^":#]+?\.md)(#[^"]*)?"/g, (m, path, anchor) => {
    if (/^https?:/i.test(path)) return m;
    // marked 会对非 ASCII 路径做百分号编码，先解码统一为裸 UTF-8 文件名
    const target = basename(decodeSafe(path)).replace(/\.md$/, '.html');
    return `href="${target}${anchor ?? ''}"`;
  });
}

// 链接文字若是纯路径（如 `../软件设计师考点大纲.md`），同步改为目标 html 文件名
function rewriteLinkText(html) {
  return html.replace(/<a href="([^"]+)">([^<>]+)<\/a>/g, (m, href, text) => {
    if (/^[.~\dA-Za-z\u4e00-\u9fff\-_./]+\.md$/.test(text.trim())) {
      return `<a href="${href}">${basename(text.trim()).replace(/\.md$/, '.html')}</a>`;
    }
    return m;
  });
}

// 为标题补顺序 id，供侧边大纲与锚点跳转使用
function addHeadingIds(html) {
  let i = 0;
  return html.replace(/<h([1-6])>/g, (_, lvl) => `<h${lvl} id="h-${++i}">`);
}

// 表格包一层滚动容器，窄屏横向滚动时圆角边框不散架
function wrapTables(html) {
  return html.replace(/<table>[\s\S]*?<\/table>/g, m => `<div class="table-wrap">\n${m}\n</div>`);
}

// ★ 星级：只在标签之外的文本里替换，渲染成琥珀色徽标
function markStars(html) {
  return html
    .split(/(<[^>]*>)/)
    .map(part => (part.startsWith('<') ? part : part.replace(/([★☆]+)/g, '<span class="stars">$1</span>')))
    .join('');
}

// 页首引用块升级为「导语卡」，并把「分值地位 / 学习目标」等标签渲染成色块
const LEAD_KEYS = ['分值地位', '学习目标', '用途', '作答建议', '配套自学讲义'];
function markLead(html) {
  const m = html.match(/<blockquote>[\s\S]*?<\/blockquote>/);
  if (!m) return html;
  let bq = m[0];
  for (const key of LEAD_KEYS) {
    bq = bq.replaceAll(`<strong>${key}</strong>`, `<strong class="k">${key}</strong>`);
  }
  bq = bq.replace('<blockquote>', '<blockquote class="lead">');
  return html.slice(0, m.index) + bq + html.slice(m.index + m[0].length);
}

// 拆出正文里的 <h1>，由页面骨架放进 .page-head 渲染
function splitTitle(html) {
  const m = html.match(/<h1 id="[^"]*">([\s\S]*?)<\/h1>/);
  if (!m) return { head: '', content: html };
  return {
    head: `<h1 id="h-1">${m[1]}</h1>`,
    content: (html.slice(0, m.index) + html.slice(m.index + m[0].length)).trim(),
  };
}

// 「答案与解析」整段折叠：默认收起，做题时不会误瞄到答案。
// 答案区之后的内容（如「下一课」提示、模拟卷的「成绩诊断」）留在折叠区之外。
const KEEP_OUT = /<(?:hr>\s*<p><strong>下一课<\/strong>|<h2 id="[^"]*">成绩诊断<\/h2>)[\s\S]*$/;
function foldTail(html) {
  const m = html.match(/<h2 id="[^"]*">([^<]*答案[^<]*)<\/h2>/);
  if (!m) return { body: html, folded: false };

  const head = html.slice(0, m.index);
  let tail = html.slice(m.index + m[0].length);
  let epilogue = '';
  const keep = tail.match(KEEP_OUT);
  if (keep) {
    epilogue = keep[0];
    tail = tail.slice(0, keep.index);
  }

  const label = m[1].trim();
  const body = `${head}<details class="answers" id="answers" data-toc="${label}">
  <summary>
    <span class="chev" aria-hidden="true"></span>
    <span>${label}</span>
    <span class="hint">做完题再展开</span>
  </summary>
  <div class="answers-body">
${tail}</div>
</details>
${epilogue}`;
  return { body, folded: true };
}

/* ------------------------------------------------------- 学习状态（TODO） */
// 章节级状态按钮：给每个 h2/h3 尾部注入圆点按钮，key = 标题纯文本。
// 必须放在 foldTail 之后跑：含「答案」的 h2 要跳过（答案区已折叠成
// <details>，summary 里不能再塞按钮，且答案区本身不需要标状态）。
const STATUS_BAR = base => `
  <footer class="status-bar" data-status-page="${base}">
    <span class="sb-label">本页学习状态</span>
    <div class="sb-picker">
      <button type="button" class="sb-current" data-action="status-menu" aria-haspopup="true" aria-expanded="false">
        <i class="sb-dot" data-status="none" aria-hidden="true"></i><span class="sb-text">未开始</span><span class="sb-chev" aria-hidden="true">▾</span>
      </button>
      <div class="sb-menu" hidden>
        <button type="button" data-set="none"><i class="sb-dot" data-status="none" aria-hidden="true"></i>未开始</button>
        <button type="button" data-set="doing"><i class="sb-dot" data-status="doing" aria-hidden="true"></i>进行中</button>
        <button type="button" data-set="done"><i class="sb-dot" data-status="done" aria-hidden="true"></i>已理解</button>
        <button type="button" data-set="later"><i class="sb-dot" data-status="later" aria-hidden="true"></i>稍后学习</button>
      </div>
    </div>
    <button type="button" class="sb-io" data-action="status-export" title="导出学习状态为 JSON 文件（后期可接入 WebDAV 同步）">导出状态</button>
    <button type="button" class="sb-io" data-action="status-import" title="从 JSON 文件导入学习状态">导入状态</button>
    <input type="file" accept=".json,application/json" data-status-file hidden>
  </footer>`;

function injectStatusDots(html) {
  return html.replace(/<h([23]) id="(h-\d+)">([\s\S]*?)<\/h\1>/g, (m, lvl, id, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (lvl === '2' && text.includes('答案')) return m;
    const key = escapeHtml(text);
    return `<h${lvl} id="${id}">${inner}<button type="button" class="sec-status" data-status-key="${key}" title="点击切换学习状态：未开始 → 进行中 → 已理解 → 稍后学习" aria-label="切换「${text}」的学习状态"></button></h${lvl}>`;
  });
}

/* ------------------------------------------- 读取进度表（勾选状态 + 分值注解） */
function readProgress() {
  const map = new Map();
  let md = '';
  try {
    md = readFileSync(PROGRESS_MD, 'utf8');
  } catch {
    return map;
  }
  const re = /^\s*-\s*\[([ xX])\]\s*\*\*(?:(\d{2})\s+)?([^*（(]+)\*\*[（(]([^）)]*)[）)]/gm;
  for (const m of md.matchAll(re)) {
    const [, mark, num, , hint] = m;
    map.set(num ?? '99', { done: mark.toLowerCase() === 'x', hint: hint.trim() });
  }
  return map;
}

const progress = readProgress();

/* ------------------------------------------------------------ 逐页渲染 */
const pages = pageSources.map(({ rel, src }) => {
  const md = readFileSync(src, 'utf8');
  const base = basename(rel, '.md');
  const title = extractTitle(md, base);

  let html = marked.parse(md);
  html = addHeadingIds(html);
  html = wrapTables(html);
  html = markStars(html);
  html = markLead(html);
  html = rewriteLinkText(rewriteMdLinks(html));

  const { head, content } = splitTitle(html);
  const { body, folded } = foldTail(content);
  // 学习状态按钮最后注入：跳过答案 h2，避免干扰上面的折叠逻辑
  const contentWithStatus = injectStatusDots(body);

  const num = base.match(/^(\d{2})/)?.[1] ?? '';
  const isOutline = rel === OUTLINE;
  const kind = isOutline ? 'outline' : base === '学习计划' ? 'plan' : num === '00' ? 'overview' : num === '99' ? 'mock' : 'lesson';
  // 只有带编号的课程在进度表里有条目，大纲页不参与勾选统计
  const info = num ? progress.get(num) ?? {} : {};

  return {
    rel,
    out: `${base}.html`,
    title,
    short: title.replace(/^\d{2}\s+/, '').replace(/^软考软件设计师\s*·\s*/, ''),
    num,
    kind,
    headHtml: head,
    content: contentWithStatus,
    hasAnswers: folded,
    hint: info.hint ?? '',
    done: !!info.done,
  };
});

const lessonCount = pages.filter(p => p.kind === 'lesson').length;

function eyebrowOf(page) {
  const map = {
    outline: ['总纲', '考点范围 · 分值分布 · 优先级'],
    overview: ['学习总览', '进度表 · 学习方法'],
    plan: ['学习计划', '双线并行 · 背诵轮转 · 复盘体系'],
    mock: ['收尾', '全真模拟卷'],
  };
  const parts = map[page.kind] ?? [`第 ${Number(page.num)} 课`, `共 ${lessonCount} 课`];
  return parts.map(t => `<span>${escapeHtml(t)}</span>`).join('\n        <span class="dot"></span>\n        ');
}

// 梯队分组：索引页分组卡片与左侧总纲导航共用同一份定义
const TIERS = [
  { title: '总纲', note: '先看全局，再按梯队推进', kinds: ['outline', 'overview', 'plan'] },
  { title: '第一梯队', note: '分值大头 + 案例直接考，优先学', nums: ['01', '02', '03', '04'] },
  { title: '第二梯队', note: '选择题稳定得分点', nums: ['05', '06', '07', '08', '09'] },
  { title: '第三梯队', note: '背诵即可拿分', nums: ['10', '11', '12'] },
  { title: '收尾', note: '全真模拟，整卷限时训练', nums: ['99'] },
];

// 左侧总纲导航：总纲 / 各梯队 / 收尾，分组常驻展开（当前页高亮、已完成打勾）
function outlineNavHtml(current) {
  const groups = TIERS.map((t, ti) => {
    const items = pages.filter(p =>
      t.kinds ? t.kinds.includes(p.kind) : t.nums.includes(p.num),
    );
    if (!items.length) return '';
    const done = items.filter(p => p.done).length;
    const list = items
      .map(p => {
        const isOutline = p.kind === 'outline';
        const label = isOutline ? '大纲' : p.kind === 'plan' ? '计划' : p.num;
        // 大纲页标题过长会在窄栏里折三行，导航里换用短名（索引页仍用全称）
        const text = isOutline ? '考点大纲与优先级' : p.short;
        const isCurrent = p.rel === current.rel;
        return `          <li><a href="${p.out}"${isCurrent ? ' class="is-current" aria-current="page"' : ''}><i class="sb-dot" data-status-page-dot="${p.out.replace(/\.html$/, '')}" aria-hidden="true"></i><span class="n">${label}</span><span class="t">${escapeHtml(text)}</span>${p.done ? '<span class="ok" aria-label="已完成">✓</span>' : ''}</a></li>`;
      })
      .join('\n');
    return `      <section class="tier tier-${ti}" title="${escapeHtml(t.note)}">
        <p class="tier-title"><span class="dot" aria-hidden="true"></span>${t.title}<span class="cnt">${done}/${items.length}</span></p>
        <ul>
${list}
        </ul>
      </section>`;
  })
    .filter(Boolean)
    .join('\n');

  return `    <nav class="outline-nav" aria-label="全部课程">
${groups}
    </nav>`;
}

// 「本页大纲」独立成块：宽屏由 app.js 挂到正文右侧的 .rail，窄屏移回左侧总纲下方
const TOC_BLOCK = `    <div class="toc-block" data-toc-block>
      <p class="side-title">本页大纲</p>
      <nav class="toc-nav" data-toc-nav aria-label="本页大纲"></nav>
    </div>`;

// 主题在 <head> 里就定好，避免首屏白闪
const THEME_BOOT = `<script>
  (function () {
    try {
      var t = localStorage.getItem('ruankao-theme');
      if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      // 支持 ?theme=dark|light 覆盖（截图验收 / 分享深浅色链接用）
      var p = new URLSearchParams(location.search).get('theme');
      if (p === 'dark' || p === 'light') t = p;
      document.documentElement.dataset.theme = t;
    } catch (e) {
      document.documentElement.dataset.theme = 'light';
    }
  })();
</script>`;

function shellHtml({ title, bodyClass = '', sidebar = '', rail = '', mainContent }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="style.css">
${THEME_BOOT}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<div class="progress" aria-hidden="true"><i></i></div>
<header class="topbar">
  <a class="brand" href="index.html">软考 · <span>软件设计师</span></a>
  <span class="topbar-spacer"></span>
  <button class="btn" type="button" data-action="theme">深色</button>
  <button class="btn" type="button" data-action="toc" aria-controls="sidebar" aria-expanded="false">目录</button>
</header>
<div class="shell">
${sidebar}
<main>
${mainContent}
</main>
${rail}
</div>
<button class="to-top" type="button" aria-label="回到顶部">↑</button>
<div class="scrim"></div>
<script src="app.js" defer></script>
</body>
</html>
`;
}

function navCard(page, dir) {
  if (!page) return '<span class="nav-card void"></span>';
  const k = dir === 'prev' ? '上一课' : '下一课';
  return `<a class="nav-card ${dir}" href="${page.out}">
      <span class="k">${k}</span>
      <span class="t">${escapeHtml(page.title)}</span>
    </a>`;
}

mkdirSync(docsDir, { recursive: true });

pages.forEach((page, i) => {
  const sidebar = `  <aside class="sidebar" id="sidebar">
${outlineNavHtml(page)}
  </aside>`;

  const rail = `  <aside class="rail" id="rail">
${TOC_BLOCK}
  </aside>`;

  const mainContent = `  <header class="page-head">
    <p class="eyebrow">
      ${eyebrowOf(page)}
    </p>
    ${page.headHtml}
  </header>
  ${page.content}
${STATUS_BAR(page.out.replace(/\.html$/, ''))}
  <footer class="page-nav">
    ${navCard(pages[i - 1], 'prev')}
    <a class="nav-home" href="index.html">返回目录</a>
    ${navCard(pages[i + 1], 'next')}
  </footer>`;

  writeFileSync(
    join(docsDir, page.out),
    shellHtml({ title: page.title, sidebar, rail, mainContent }),
  );
  console.log(`✔ ${page.rel} → docs/${page.out}（${page.title}${page.hasAnswers ? '，答案已折叠' : ''}）`);
});

/* --------------------------------------------------------------- 索引页 */
function cardHtml(page) {
  const label = page.kind === 'outline' ? '大纲' : page.kind === 'plan' ? '计划' : page.num;
  return `      <a class="card${page.done ? ' done' : ''}" href="${page.out}">
        <i class="sb-dot" data-status-page-dot="${page.out.replace(/\.html$/, '')}" aria-hidden="true"></i>
        <span class="n">${label}</span>
        <span class="body">
          <span class="t">${escapeHtml(page.short)}</span>
          ${page.hint ? `<span class="h">${escapeHtml(page.hint)}</span>` : ''}
        </span>
      </a>`;
}

const groups = TIERS.map(tier => {
  const items = pages.filter(p =>
    tier.kinds ? tier.kinds.includes(p.kind) : tier.nums.includes(p.num),
  );
  if (!items.length) return '';
  return `  <section class="group">
    <header>
      <h2>${tier.title}</h2>
      <span class="note">${tier.note}</span>
    </header>
    <div class="cards">
${items.map(cardHtml).join('\n')}
    </div>
  </section>`;
})
  .filter(Boolean)
  .join('\n');

const doneCount = pages.filter(p => p.done).length;

const indexMain = `  <div class="landing">
    <div class="hero">
      <p class="eyebrow"><span>2026 年下半年</span><span class="dot"></span><span>中级 · 软件设计师</span></p>
      <h1>软考软件设计师<br>自学资料库</h1>
      <p>不看视频，以本资料库为唯一学习材料。按梯队顺序逐考点推进，每课含讲义、课后考题、精华题与答案解析。</p>
      <div class="chips">
        <span class="chip">考试时间 <b>10 月 24—27 日</b>·机考</span>
        <span class="chip">两科各 <b>75 分</b>，<b>45 分</b>合格</span>
        <span class="chip gold">进度 <b>${doneCount}/${pages.length}</b> 份</span>
      </div>
    </div>
${groups}
  </div>`;

writeFileSync(
  join(docsDir, 'index.html'),
  shellHtml({ title: '软考软件设计师自学资料库 · 目录', bodyClass: 'is-index', mainContent: indexMain }),
);
console.log('✔ index → docs/index.html');

// docs/ 完全由构建生成：样式与脚本源码在 tools/，每次构建覆盖拷贝
copyFileSync(join(root, 'tools', 'style.css'), join(docsDir, 'style.css'));
copyFileSync(join(root, 'tools', 'app.js'), join(docsDir, 'app.js'));
console.log('✔ docs/style.css、docs/app.js 已更新');

// .nojekyll：部署到 GitHub Pages 时跳过 Jekyll 构建。
// 本项目 docs/ 是纯静态产物、无 Liquid 语法，但仍要这个文件——
// 否则以后讲义里一旦出现 {{ }} / {% %}（如代码示例）或下划线开头的文件，
// Jekyll 会静默改写或忽略它们。它是发布目录的开关，必须随产物一起生成。
writeFileSync(join(docsDir, '.nojekyll'), '');
console.log('✔ docs/.nojekyll 已生成（GitHub Pages 用）');
console.log(`\n完成：${pages.length + 1} 个页面 → docs/`);
