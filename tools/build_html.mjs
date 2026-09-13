#!/usr/bin/env node
// Markdown 讲义 → 静态 HTML 构建脚本
// 用法：npm run build（在仓库根目录执行）
// 输入：软件设计师考点大纲.md + 软考学习/*.md（README.md / AGENTS.md 不转换）
// 输出：docs/*.html（平级目录）+ docs/style.css
import { marked } from 'marked';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { basename, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'docs');
const OUTLINE = '软件设计师考点大纲.md';
const STUDY_DIR = '软考学习';

// 转换顺序即页面先后顺序（用于生成上一课/下一课导航）
const pageSources = [
  { rel: OUTLINE, src: join(root, OUTLINE) },
  ...readdirSync(join(root, STUDY_DIR))
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => ({ rel: `${STUDY_DIR}/${f}`, src: join(root, STUDY_DIR, f) })),
];

// 仅重写指向仓库内 .md 的相对链接；docs/ 为平级目录，统一取目标文件名。
// 指向尚未生成课程的链接（如 03-xxx.md）照常重写，页面暂 404 属正常。
function rewriteMdLinks(html) {
  return html.replace(/href="([^":#]+?\.md)(#[^"]*)?"/g, (m, path, anchor) => {
    if (/^https?:/i.test(path)) return m;
    // marked 会对非 ASCII 路径做百分号编码，先解码统一为裸 UTF-8 文件名
    const decoded = decodeSafe(path);
    const target = basename(decoded).replace(/\.md$/, '.html');
    return `href="${target}${anchor ?? ''}"`;
  });
}

function decodeSafe(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

// 链接文字若是纯路径（如 `../软件设计师考点大纲.md`、`02-数据库系统.md`），同步改为目标 html 文件名，
// 避免页面显示「指向 md」的文字却跳到 html
function rewriteLinkText(html) {
  return html.replace(/<a href="([^"]+)">([^<>]+)<\/a>/g, (m, href, text) => {
    if (/^[.~\dA-Za-z\u4e00-\u9fff\-_./]+\.md$/.test(text.trim())) {
      return `<a href="${href}">${basename(text.trim()).replace(/\.md$/, '.html')}</a>`;
    }
    return m;
  });
}

// 为标题补顺序 id，给未来的文内目录/侧边栏导航预留锚点
function addHeadingIds(html) {
  let i = 0;
  return html.replace(/<h([1-6])>/g, (_, lvl) => `<h${lvl} id="h-${++i}">`);
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function extractTitle(md, fallback) {
  return md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback;
}

function pageHtml({ title, body, prev, next }) {
  const footerNav = [
    prev ? `<a href="${prev}">← 上一页</a>` : '<span></span>',
    '<a href="index.html">返回目录</a>',
    next ? `<a href="${next}">下一页 →</a>` : '<span></span>',
  ].join('\n    ');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<main>
${body}
</main>
<footer class="page-nav">
    ${footerNav}
</footer>
</body>
</html>
`;
}

mkdirSync(docsDir, { recursive: true });

// 各页元信息：标题 + 正文 HTML
const pages = pageSources.map(({ rel, src }) => {
  const md = readFileSync(src, 'utf8');
  const title = extractTitle(md, basename(rel, '.md'));
  const body = rewriteLinkText(rewriteMdLinks(addHeadingIds(marked.parse(md))));
  return { rel, title, body };
});

pages.forEach((page, i) => {
  const outName = basename(page.rel).replace(/\.md$/, '.html');
  const linkOf = j => basename(pages[j].rel).replace(/\.md$/, '.html');
  const html = pageHtml({
    title: page.title,
    body: page.body,
    prev: i > 0 ? linkOf(i - 1) : null,
    next: i < pages.length - 1 ? linkOf(i + 1) : null,
  });
  writeFileSync(join(docsDir, outName), html);
  console.log(`✔ ${page.rel} → docs/${outName}（${page.title}）`);
});

// 目录页：大纲 / 总览进度 / 各课，逐课列出标题链接
const entries = pages
  .map(p => {
    const outName = basename(p.rel).replace(/\.md$/, '.html');
    return `  <li><a href="${outName}">${escapeHtml(p.title)}</a></li>`;
  })
  .join('\n');

writeFileSync(
  join(docsDir, 'index.html'),
  `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>软考软件设计师自学资料库 · 目录</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<main>
<h1>软考软件设计师自学资料库</h1>
<p>2026 年 10 月 24—27 日考试，两科均 ≥45 分。以本资料库为唯一学习材料。</p>
<h2>课程目录</h2>
<ol class="toc">
${entries}
</ol>
</main>
</body>
</html>
`,
);
console.log('✔ index → docs/index.html');

// docs/ 完全由构建生成：样式源码在 tools/style.css，每次构建覆盖拷贝
copyFileSync(join(root, 'tools', 'style.css'), join(docsDir, 'style.css'));
console.log('✔ docs/style.css 已更新');
console.log(`\n完成：${pages.length + 1} 个页面 → docs/`);
