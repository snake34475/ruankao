import { defineConfig } from 'vitepress';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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
  markdown: { math: true, attrs: { disable: true } },
  themeConfig: {
    siteTitle: '软考 · 软件设计师',
    nav: [
      { text: '首页', link: '/' },
      { text: '学习进度', link: '/00-总览与进度.html' },
      { text: '学习计划', link: '/学习计划.html' },
      { text: '考点大纲', link: '/软件设计师考点大纲.html' },
    ],
    sidebar: [
      { text: '总览', items: [
        { text: '学习总览与进度', link: '/00-总览与进度.html' },
        { text: '学习计划', link: '/学习计划.html' },
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
