#!/usr/bin/env node
/* 按考点关键词在题库中定位题目。
   用法：node question-index.mjs <关键词> [关键词2 ...]     全部关键词都要命中
         node question-index.mjs --any <词1> <词2> ...      命中任意一个即可（搜近义词时用）
         node question-index.mjs --course 02 <关键词>       限定某一课
         node question-index.mjs --list <关键词>            只列文件、题号、行号
   输出：每命中一题一行，给出「课 / 文件 / 题型 / 题号 / 行号 / 题干首行」。
   设计约束：只读真源 Markdown，绝不读取答案文件；答案只在批改阶段人工读取。 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/* 脚本在 .agents/skills/topic-quiz/scripts/，往回退四层即仓库根。
   用 fileURLToPath 而非 URL.pathname，避免 Windows 盘符前多出斜杠。 */
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..', '..');
const studyDir = join(root, '软考学习');

/* 题型判定：先看目录是不是模拟卷，再按文件名前缀分类。 */
function kindOf(dir, base) {
  if (dir.startsWith('99-')) return '模拟卷';
  if (/^90-/.test(base)) return '课后题';
  if (/^91-/.test(base)) return '精华与补充题';
  if (/案例题专攻/.test(base)) return '案例题专攻';
  if (/^0[1-6]-/.test(base)) return '讲义内例题';
  return '题目';
}

/* 参与检索的文件：90/91/案例题专攻/讲义小节，以及模拟卷的卷子（01～06 前缀）。
   模拟卷里的 00-使用方法、99-成绩诊断 不是题源，答案文件在过滤阶段另行排除。 */
const isQuestionFile = (dir, base) =>
  /^90-|^91-|案例题专攻|^0[1-6]-/.test(base);

const isLecture = (dir, base) =>
  !dir.startsWith('99-') && (/案例题专攻/.test(base) || (/^0[1-6]-/.test(base) && !/90-|91-/.test(base)));

/* 讲义与「案例题专攻」文件里同时有讲解步骤和题目，编号列表多为步骤。
   故对这类文件只认真正的选择题（含空括号），避免把「1. 每个实体一张表」当成题。 */
function looksLikeStem(line) {
  return /（\s*）|\(\s*\)/.test(line);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name.endsWith('.md')) out.push(p);
  }
  return out;
}

/* 把文件切成题目块：题目以「**1.**」「1.」等标记开头。 */
const QMARK = /^(?:\*\*)?(?:补充\s*)?(?:案例\s*)?([0-9]{1,2})[.、)]\s*(?:\*\*)?\s*|^(?:\*\*)?(?:补充|案例)\s*([0-9]{1,2})[.、)]\s*/;

/* 一趟扫描切出两类块：
   - 题块：以「1.」「**1.**」开头的选择题/简答题；
   - 案例块：以「案例/专项…」标题开头，含【说明】与「问题 N」的整道大题。
   关键约束：进入案例块后，题面里的编号需求列表（「1. 居民提交报修请求…」）不再算新题，
   否则一道案例会被打散成好几道假题。 */
function isCaseTitle(line) {
  const t = line.replace(/^#{1,6}\s+/, '').replace(/\*\*/g, '').replace(/^[一二三四五六七八九十]+、\s*/, '').trim();
  return /^(案例|专项)/.test(t) && t.length <= 30;
}

function partition(file, lecture) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const questions = [];
  const cases = [];
  let heading = '';
  let q = null;
  let c = null;
  const pushQ = () => { if (q) questions.push(q); q = null; };
  const pushC = () => { if (c && c.body.join('\n').trim().length > 40) cases.push(c); c = null; };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h = line.match(/^(#{1,4})\s+(.+)$/);
    if (h && !isCaseTitle(line)) { pushQ(); pushC(); heading = h[2].trim(); continue; }
    if (isCaseTitle(line)) {
      pushQ(); pushC();
      c = { no: '案例', heading: heading || line.replace(/[#*【】]/g, '').trim(), line: i + 1, text: line.replace(/\*\*/g, '').trim(), body: [line], isCase: true };
      continue;
    }
    if (/^\*\*[一二三四五六七八九十]+、/.test(line)) { pushQ(); pushC(); continue; } // 小节标记
    if (c) { c.body.push(line); continue; }                                        // 案例块内一律不再开新题
    const m = line.match(QMARK);
    if (m && (!lecture || looksLikeStem(line))) {
      pushQ();
      q = { no: (m[1] || m[2] || '').trim(), heading, line: i + 1, text: line.trim(), body: [line] };
    } else if (q) {
      q.body.push(line);
    }
  }
  pushQ(); pushC();
  return { questions, cases };
}

function main() {
  const args = process.argv.slice(2);
  let course = null;
  let anyMode = false;
  const listOnly = args.includes('--list');
  const kws = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--course') { course = args[++i]; continue; }
    if (args[i] === '--any') { anyMode = true; continue; }
    if (args[i].startsWith('--')) continue;
    kws.push(args[i]);
  }
  if (!kws.length) {
    console.error('用法：node question-index.mjs [--course 02] [--list] [--any] <关键词...>');
    process.exit(2);
  }
  const norm = s => s.toLowerCase();
  const needles = kws.map(norm);

  const files = walk(studyDir).filter(f => {
    const rel = f.slice(studyDir.length + 1);
    const [dirName, base] = [rel.split('/')[0], rel.split('/').pop()];
    if (/答案|解析|评分点|诊断/.test(base)) return false; // 答案类文件一律排除
    if (!isQuestionFile(dirName, base)) return false;
    if (course && !dirName.startsWith(course)) return false;
    return true;
  });

  let total = 0;
  for (const f of files.sort()) {
    const rel = f.slice(studyDir.length + 1);
    const [dir, baseRaw] = [rel.split('/')[0], rel.split('/').pop()];
    const base = baseRaw.replace(/\.md$/, '');
    const kind = kindOf(dir, baseRaw);
    const lecture = isLecture(dir, baseRaw);
    /* 案例块只从题库文件抽取：讲义里的「案例 A」是带答案的教学示例，不是题目。 */
    const { questions, cases } = partition(f, lecture);
    const blocks = lecture ? questions : [...questions, ...cases];
    for (const b of blocks) {
      /* 用整块正文匹配：案例题的【说明】与小问在题目标题之后若干行，只扫开头会漏。 */
      const hay = norm(b.text + '\n' + b.body.join('\n'));
      const hit = anyMode ? needles.some(n => hay.includes(n)) : needles.every(n => hay.includes(n));
      if (!hit) continue;
      total++;
      if (listOnly) { console.log(`${dir} / ${base}: ${b.no}（行 ${b.line}）`); continue; }
      const head = b.text.replace(/\*\*/g, '').replace(/^\s*[0-9]{1,2}[.、)]\s*/, '').slice(0, 90);
      const tag = b.isCase ? '案例' : `题 ${b.no}`;
      console.log(`[${dir}] ${base} · ${kind} · ${tag} · 行 ${b.line} · 小节「${b.heading}」`);
      console.log(`    ${head}`);
    }
  }
  console.error(`\n—— 命中 ${total} 题（关键词：${kws.join(anyMode ? ' / ' : ' + ')}）`);
}

main();
