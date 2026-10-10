import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { catalog, root, routeOf, tiers } from './site-map.mjs';

const stage = resolve(root, 'site-src');
if (dirname(stage) !== resolve(root) || !stage.endsWith(`${sep}site-src`)) throw new Error('拒绝清理意外目录');
const incremental = process.argv.includes('--incremental');
if (!incremental) rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });

function writeGenerated(target, content) {
  if (incremental && existsSync(target) && readFileSync(target, 'utf8') === content) return;
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

const pages = catalog();
const bySource = new Map(pages.map(page => [resolve(page.source).toLowerCase(), page]));
const byCourse = new Map(pages.filter(page => page.kind === 'course').map(page => [page.course, page]));
const misses = [];
const figureStyles = [];
let figureId = 0;

function extractSvgStyles(content, source) {
  return content.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, svg => {
    const styles = [...svg.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
    if (!styles.length) return svg;
    const id = `figure-${++figureId}`;
    for (const style of styles) {
      const css = style[1];
      const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
      if (!rules.length || css.replace(/([^{}]+)\{([^{}]*)\}/g, '').trim()) {
        throw new Error(`无法提取 SVG 样式：${source}`);
      }
      for (const [, selectors, declarations] of rules) {
        const scoped = selectors.split(',').map(selector => `svg[data-figure-id="${id}"] ${selector.trim()}`).join(', ');
        figureStyles.push(`${scoped} {${declarations}}`);
      }
    }
    return svg.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<svg\b/i, `<svg data-figure-id="${id}"`);
  });
}

function targetOf(source, raw) {
  const decoded = decodeURIComponent(raw);
  const resolved = resolve(dirname(source), decoded);
  let page = bySource.get(resolved.toLowerCase());
  if (!page) {
    const name = decoded.replaceAll('\\', '/').split('/').at(-1);
    if (name?.endsWith('.md')) page = byCourse.get(name.slice(0, -3));
    if (!page && name) page = pages.find(item => (item.kind === 'outline' || item.kind === 'general') && item.route === name);
  }
  return page;
}

function rewriteLink(source, fromRoute, raw) {
  if (/^(?:https?:|mailto:|data:|#)/i.test(raw)) return raw;
  const [path, fragment = ''] = raw.split('#', 2);
  if (path.endsWith('.md')) {
    const page = targetOf(source, path);
    if (!page) { misses.push(`${source}: ${raw}`); return raw; }
    return routeOf(page) + (fragment ? `#${fragment}` : '');
  }
  if (path.includes('interactive/')) {
    const absolute = resolve(dirname(source), decodeURIComponent(path));
    const rel = relative(root, absolute).replaceAll('\\', '/');
    if (rel.startsWith('interactive/')) return `/${rel}${fragment ? `#${fragment}` : ''}`;
  }
  return raw;
}

for (const page of pages) {
  let content = readFileSync(page.source, 'utf8');
  content = content.replace(/(!?\[[^\]]*\]\()([^\s)]+)(\))/g, (all, start, target, end) => `${start}${rewriteLink(page.source, page.route, target)}${end}`);
  content = content.replace(/((?:href|src)=")([^"]+)(")/g, (all, start, target, end) => `${start}${rewriteLink(page.source, page.route, target)}${end}`);
  content = extractSvgStyles(content, page.source);
  if (/<style\b/i.test(content)) throw new Error(`Markdown 中仍有 Vue 不支持的 <style>：${page.source}`);
  const target = join(stage, page.route);
  writeGenerated(target, content);
}

const progress = readFileSync(join(root, '软考学习', '00-总览与进度.md'), 'utf8');
const done = new Set([...progress.matchAll(/^- \[x\] \*\*(\d{2}) /gim)].map(match => match[1]));
const sections = tiers.map(tier => {
  const rows = tier.nums.map(num => {
    const page = pages.find(item => item.kind === 'course' && item.num === num);
    if (!page) throw new Error(`缺少课程 ${num}`);
    const short = page.title.replace(/^\d{2}(?:\.\d+)?\s+/, '');
    return `- [${done.has(num) ? '已完成' : '未完成'}] [${num} ${short}](${page.route})`;
  });
  return `## ${tier.title}\n\n${rows.join('\n')}`;
});
writeGenerated(join(stage, 'index.md'), `# 软考软件设计师自学资料库\n\n不看视频，以本资料库为唯一学习材料。按梯队顺序逐考点推进。\n\n[学习总览与进度](./00-总览与进度.md) · [学习计划](./学习计划.md) · [考点大纲](./软件设计师考点大纲.md)\n\n${sections.join('\n\n')}\n`);

const interactive = join(root, 'interactive');
if (!incremental && existsSync(interactive)) cpSync(interactive, join(stage, 'public', 'interactive'), { recursive: true });
mkdirSync(join(stage, 'public'), { recursive: true });
const theme = readFileSync(join(root, '.vitepress', 'theme', 'style.css'), 'utf8');
const light = theme.match(/:root\s*\{([^}]*)\}/)?.[1] ?? '';
const dark = theme.match(/\.dark\s*\{([^}]*)\}/)?.[1] ?? '';
const used = new Set([...figureStyles.join('\n').matchAll(/var\((--[\w-]+)/g)].map(match => match[1]));
const missing = [...used].filter(name => !light.includes(`${name}:`) || !dark.includes(`${name}:`));
if (missing.length) throw new Error(`SVG 主题变量未同时定义亮色和暗色值：${missing.join(', ')}`);
writeGenerated(join(stage, 'public', 'figures.css'), `${figureStyles.join('\n')}\n`);
// 内容哈希版本号：figures.css 文件名固定，浏览器会长期缓存旧版；新增图后旧样式若不失效，
// SVG 回退到默认字号直接溢出画布（2026-10-10 档位三验收实测踩坑，检测因此被误导一轮）。
writeGenerated(join(stage, 'figures-version.txt'), createHash('sha256').update(figureStyles.join('\n')).digest('hex').slice(0, 10));
writeGenerated(join(stage, 'public', '.nojekyll'), '');
if (misses.length) throw new Error(`未解析的 Markdown 链接：\n${misses.join('\n')}`);
console.log(`VitePress 输入已准备：${pages.length + 1} 个正文页面`);
