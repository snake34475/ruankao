import { defineConfig } from 'vitepress';
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { catalog, root, routeOf, tiers } from '../tools/site-map.mjs';

const pages = catalog();
const progress = readFileSync(join(root, '软考学习', '00-总览与进度.md'), 'utf8');
const completed = new Set([...progress.matchAll(/^- \[x\] \*\*(\d{2}) /gim)].map(match => match[1]));
const short = page => page.title.replace(/^\d{2}(?:\.\d+)?\s+/, '');
const groups = tiers.map(tier => ({
  text: `${tier.title} ${tier.nums.filter(num => completed.has(num)).length}/${tier.nums.length}`,
  collapsed: false,
  items: tier.nums.map(num => {
    const course = pages.find(page => page.kind === 'course' && page.num === num);
    if (!course) throw new Error(`缺少课程 ${num}`);
    return {
      text: `${num} ${short(course)}`,
      link: routeOf(course),
      collapsed: true,
      items: pages.filter(page => page.kind === 'chapter' && page.course === course.course)
        .map(page => ({ text: short(page), link: routeOf(page) })),
    };
  }),
}));

function syncSourceMarkdown() {
  return {
    name: 'sync-source-markdown',
    configureServer(server) {
      const files = pages.map(page => resolve(page.source));
      const watched = new Set(files.map(file => file.toLowerCase()));
      server.watcher.add(files);
      let timer;
      let running = false;
      let pending = false;

      function sync() {
        if (running) { pending = true; return; }
        running = true;
        execFile(process.execPath, [join(root, 'tools', 'prepare_vitepress.mjs'), '--incremental'],
          { cwd: root, windowsHide: true }, (error, _stdout, stderr) => {
            running = false;
            if (error) server.config.logger.error(`讲义同步失败：${stderr || error.message}`);
            if (pending) { pending = false; sync(); }
          });
      }

      function onChange(event, file) {
        if (!['add', 'change'].includes(event) || !watched.has(resolve(file).toLowerCase())) return;
        clearTimeout(timer);
        timer = setTimeout(sync, 150);
      }

      server.watcher.on('all', onChange);
      server.httpServer?.once('close', () => {
        clearTimeout(timer);
        server.watcher.off('all', onChange);
      });
    },
  };
}

export default defineConfig({
  lang: 'zh-CN',
  title: '软考软件设计师自学资料库',
  description: '软考中级软件设计师自学讲义、练习与模拟卷',
  srcDir: './site-src',
  outDir: './docs',
  base: '/ruankao/',
  head: [['link', { rel: 'stylesheet', href: '/ruankao/figures.css' }]],
  cleanUrls: false,
  ignoreDeadLinks: false,
  markdown: {
    math: true,
    attrs: { disable: true },
    // 指向 interactive/ 的独立页（如错题本、遍历动画）是 public 静态资产、不是 VitePress 路由，
    // 会被 client router 拦截而 404；router 对带 target 的链接不拦截，故统一补 target。
    // 注意必须【先】跑 VitePress 的 linkPlugin（它会补 base 前缀），再加 target：
    // linkPlugin 遇到已有 target 的 token 会跳过整个 href 处理（含 base）。
    config(md) {
      const original = md.renderer.rules.link_open ??
        ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
      md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const rendered = original(tokens, idx, options, env, self);
        const href = tokens[idx].attrGet('href') ?? '';
        if (href.includes('/interactive/')) {
          tokens[idx].attrSet('target', '_blank');
          tokens[idx].attrSet('rel', 'noopener');
          return self.renderToken(tokens, idx, options);
        }
        return rendered;
      };
    },
  },
  vite: { plugins: [syncSourceMarkdown()] },
  themeConfig: {
    siteTitle: '软考 · 软件设计师',
    nav: [
      { text: '首页', link: '/' },
      { text: '学习进度', link: '/00-总览与进度.html' },
      { text: '学习计划', link: '/学习计划.html' },
      { text: '错题本', link: '/interactive/mistake-book/index.html', target: '_blank', rel: 'noopener' },
      { text: '考点大纲', link: '/软件设计师考点大纲.html' },
    ],
    sidebar: [
      { text: '总览', items: [
        { text: '学习总览与进度', link: '/00-总览与进度.html' },
        { text: '学习计划', link: '/学习计划.html' },
        { text: '错题本与知识图谱', link: '/interactive/mistake-book/index.html', target: '_blank', rel: 'noopener' },
        { text: '考点大纲', link: '/软件设计师考点大纲.html' },
      ] },
      ...groups,
    ],
    outline: { level: [2, 3], label: '本页大纲' },
    docFooter: { prev: '上一页', next: '下一页' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '切换深浅色',
    search: { provider: 'local' },
  },
});
