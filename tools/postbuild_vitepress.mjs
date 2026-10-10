import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { catalog, root } from './site-map.mjs';

const docs = join(root, 'docs');
const pages = catalog();
function writeAfterBuild(file, content) {
  for (let attempt = 0; attempt < 12; attempt++) {
    try { writeFileSync(file, content); return; }
    catch (error) {
      if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(error.code) || attempt === 11) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
}
const allRoutes = ['index.html', ...pages.map(page => page.route.replace(/\.md$/, '.html'))];
if (!existsSync(join(docs, 'figures.css'))) throw new Error('缺少图示样式 figures.css');
// figures.css 链接必须带 prepare 生成的内容哈希版本号，防止旧样式缓存拖住新图（file:// 下 query 被忽略，离线不受影响）
const figuresVersion = readFileSync(join(root, 'site-src', 'figures-version.txt'), 'utf8').trim();
if (!/^[0-9a-f]{10}$/.test(figuresVersion)) throw new Error('figures-version.txt 缺失或格式异常');
for (const route of allRoutes) {
  const file = join(docs, route);
  if (!existsSync(file)) throw new Error(`缺少页面：${file}`);
  const depth = route.split('/').length - 1;
  const prefix = depth ? '../'.repeat(depth) : './';
  let html = readFileSync(file, 'utf8');
  html = html.replace(/\b(href|src)="\/ruankao\//g, `$1="${prefix}`);
  if (!html.includes(`href="${prefix}figures.css?v=${figuresVersion}"`)) throw new Error(`图示样式引用路径或版本号错误：${route}`);
  // 对 HTML 中的资源和链接使用相对地址，兼容 GitHub Pages 子路径及离线静态阅读。
  // 交互仍由 VitePress 的 /ruankao/ base 在 HTTP 预览和线上站点中加载。
  html = html.replace('</head>', `<script>document.addEventListener('click',function(e){const a=e.target.closest('a[href]');if(!a)return;const raw=a.getAttribute('href');if(!raw||raw.startsWith('#')||/^(?:https?:|mailto:|javascript:)/i.test(raw))return;const url=new URL(raw,location.href);if(url.protocol===location.protocol&&(url.pathname.endsWith('/')||url.pathname.endsWith('.html'))){e.preventDefault();location.assign(url.href)}},true)</script></head>`);
  html = html.replace(/[ \t]+(?=\r?$)/gm, '');
  writeAfterBuild(file, html);
}
for (const page of pages.filter(page => page.kind === 'course')) {
  const target = `${page.course}/index.html`;
  const legacy = join(docs, `${page.course}.html`);
  writeAfterBuild(legacy, `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0; url=${target}"><title>正在前往课程首页</title></head><body><p>课程已移至<a href="${target}">课程首页</a>。</p></body></html>\n`);
}
if (!existsSync(join(docs, 'index.html')) || !existsSync(join(docs, '.nojekyll'))) throw new Error('缺少目录页或 .nojekyll');
const broken = [];
for (const route of allRoutes) {
  const file = join(docs, route);
  const html = readFileSync(file, 'utf8');
  for (const [, url] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (/^(?:#|https?:|mailto:|data:|javascript:)/i.test(url)) continue;
    const path = decodeURIComponent(url.split(/[?#]/)[0]);
    if (!path) continue;
    const target = path.startsWith('/') ? join(docs, path.slice(1)) : resolve(dirname(file), path);
    if (!existsSync(target) || !resolve(target).startsWith(resolve(docs) + sep) && resolve(target) !== resolve(docs)) broken.push(`${route}: ${url}`);
  }
}
if (broken.length) throw new Error(`站内资源或链接失效：\n${broken.slice(0, 40).join('\n')}${broken.length > 40 ? `\n另有 ${broken.length - 40} 处` : ''}`);
console.log(`验收：${pages.length + 1} 个正文页面，${pages.filter(page => page.kind === 'course').length} 个旧入口兼容页`);
