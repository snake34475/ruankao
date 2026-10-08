import { readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';

export const root = join(import.meta.dirname, '..');
export const studyDir = join(root, '软考学习');
export const tiers = [
  { title: '第一梯队', nums: ['01', '02', '03', '04'] },
  { title: '第二梯队', nums: ['05', '06', '07', '08', '09'] },
  { title: '第三梯队', nums: ['10', '11', '12'] },
  { title: '收尾', nums: ['99'] },
];

const titleOf = file => readFileSync(file, 'utf8').match(/^#\s+(.+)$/m)?.[1]?.trim() ?? basename(file, '.md');
const slash = value => value.replaceAll('\\', '/');

export function catalog() {
  const pages = [
    { source: join(root, '软件设计师考点大纲.md'), route: '软件设计师考点大纲.md', title: titleOf(join(root, '软件设计师考点大纲.md')), kind: 'outline' },
  ];
  for (const entry of readdirSync(studyDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const file = join(studyDir, entry.name);
      pages.push({ source: file, route: entry.name, title: titleOf(file), kind: 'general' });
      continue;
    }
    if (!entry.isDirectory() || !/^\d{2}-/.test(entry.name)) continue;
    const num = entry.name.slice(0, 2);
    for (const name of readdirSync(join(studyDir, entry.name)).filter(name => name.endsWith('.md')).sort()) {
      const file = join(studyDir, entry.name, name);
      const isIndex = name.startsWith('00-');
      pages.push({
        source: file,
        route: slash(join(entry.name, isIndex ? 'index.md' : name)),
        title: titleOf(file),
        kind: isIndex ? 'course' : 'chapter',
        course: entry.name,
        num,
      });
    }
  }
  return pages;
}

export function routeOf(page) {
  return `/${page.route.replace(/index\.md$/, '').replace(/\.md$/, '.html')}`;
}

export function coursePages(pages, course) {
  return pages.filter(page => page.course === course);
}
