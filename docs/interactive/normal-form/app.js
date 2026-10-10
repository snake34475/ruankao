'use strict';

/* 与讲义《02.4 关系规范化》共用同一组示例数据，改这里请同步讲义图。 */
const BIG_TABLE = {
  name: '选课大表 S',
  cols: ['学号', '姓名', '系', '系主任', '课程号', '成绩'],
  rows: [
    ['S01', '张三', '计算机系', '王主任', 'C01', '86'],
    ['S01', '张三', '计算机系', '王主任', 'C02', '92'],
    ['S02', '李四', '计算机系', '王主任', 'C01', '78'],
    ['S03', '王五', '数学系', '李主任', 'C01', '91'],
  ],
  keys: ['学号 + 课程号'],
  keyCols: ['学号', '课程号'],
  sick: ['姓名', '系', '系主任'],
};

const STEPS = [
  {
    label: '术前',
    title: '第 0 站 · 一张塞了私货的大表',
    desc: '未手术前的学生选课登记：一行里把两门课塞进了同一格。规范化第一步，先让它满足 1NF。',
    fds: ['每格本应只记一门课，登记员图省事写了“C01、C02”'],
    before: [
      { name: '学生选课登记', cols: ['学号', '姓名', '选修课程号'],
        rows: [['S01', '张三', 'C01、C02']], sick: ['选修课程号'] },
    ],
    diagnosis: { disease: '一格两个值：想查“谁选了 C02”或再加一门课都得拆开整格改写，违反 1NF。1NF 不看函数依赖，只看每格是不是单个原子值。', fds: [] },
    result: '一行一课，每格原子值，正式进入 1NF。姓名跟着重复了两行没关系——1NF 不管重复，组合键 (学号, 课程号) 出现了，下一关才查“半个键”问题。',
    after: [
      { name: '选课', cols: ['学号', '姓名', '课程号'], rows: [['S01', '张三', 'C01'], ['S01', '张三', 'C02']],
        keys: ['学号 + 课程号'], keyCols: ['学号', '课程号'], verdict: '满足 1NF ✓' },
    ],
  },
  {
    label: '2NF',
    title: '第 1 站 · 2NF：治“只靠半个键”',
    desc: '把选课信息补齐成六列大表：每名学生只有一个系，每个系只有一位系主任，同一学生选同一门课只记一条成绩。',
    fds: ['学号 → 姓名', '学号 → 系', '系 → 系主任', '(学号, 课程号) → 成绩', '候选键 = (学号, 课程号)'],
    before: [BIG_TABLE],
    diagnosis: {
      disease: '姓名、系、系主任三个非主属性只需要“学号”这半个键就能定——部分依赖病，2NF 不过关。',
      fds: [
        { text: '学号 → 姓名：非主属性只靠半个键（病）', kind: 'bad' },
        { text: '学号 → 系：非主属性只靠半个键（病）', kind: 'bad' },
        { text: '系 → 系主任：传递依赖，留给 3NF 这一关', kind: 'bad' },
        { text: '(学号, 课程号) → 成绩：完全依赖，正常', kind: 'ok' },
      ],
    },
    result: '“学号一个就定下来”的非主属性全部随学号搬进学生表；选课成绩表里剩下的都真正依赖整个候选键。达到 2NF。',
    after: [
      { name: '学生', cols: ['学号', '姓名', '系', '系主任'], keys: ['学号'], keyCols: ['学号'],
        rows: [['S01', '张三', '计算机系', '王主任'], ['S02', '李四', '计算机系', '王主任'], ['S03', '王五', '数学系', '李主任']],
        verdict: '半个键的病好了，“系 → 系主任”还埋在里面' },
      { name: '选课成绩', cols: ['学号', '课程号', '成绩'], keys: ['学号 + 课程号'], keyCols: ['学号', '课程号'],
        rows: [['S01', 'C01', '86'], ['S01', 'C02', '92'], ['S02', 'C01', '78'], ['S03', 'C01', '91']],
        verdict: '满足 2NF ✓' },
    ],
  },
  {
    label: '3NF',
    title: '第 2 站 · 3NF：治“借道中转”',
    desc: '看拆出来的学生表：候选键是单属性学号，不存在半个键问题（2NF 已满足）；但系主任是借道“系”才依赖上学号的。',
    fds: ['学号 → 姓名', '学号 → 系', '系 → 系主任', '候选键 = 学号'],
    before: [
      { name: '学生', cols: ['学号', '姓名', '系', '系主任'], keys: ['学号'], keyCols: ['学号'], sick: ['系主任'],
        rows: [['S01', '张三', '计算机系', '王主任'], ['S02', '李四', '计算机系', '王主任'], ['S03', '王五', '数学系', '李主任']] },
    ],
    diagnosis: {
      disease: '学号 → 系 → 系主任：“系”是非主属性却当了中转站，系主任传递依赖学号——3NF 不过关。',
      fds: [
        { text: '学号 → 姓名：直接依赖候选键，正常', kind: 'ok' },
        { text: '学号 → 系：直接依赖候选键，正常', kind: 'ok' },
        { text: '系 → 系主任：非主属性中转，传递依赖（病）', kind: 'bad' },
      ],
    },
    result: '手术口径：把中转列“系”升格成独立表的主键。系主任从此直接依赖“系”，学生表里没有中转了。达到 3NF。',
    after: [
      { name: '学生', cols: ['学号', '姓名', '系'], keys: ['学号'], keyCols: ['学号'],
        rows: [['S01', '张三', '计算机系'], ['S02', '李四', '计算机系'], ['S03', '王五', '数学系']],
        verdict: '非主属性一步到位依赖键' },
      { name: '系', cols: ['系', '系主任'], keys: ['系'], keyCols: ['系'],
        rows: [['计算机系', '王主任'], ['数学系', '李主任']],
        verdict: '满足 3NF ✓' },
    ],
  },
  {
    label: 'BCNF',
    title: '第 3 站 · BCNF：决定因素必须是超键',
    desc: '换新病例“排课”：每生每课配一名教师；每位教师只带一门课（一门课可有多名教师）。三列全是主属性，3NF 无从检查，照样有病。',
    fds: ['(学号, 课程号) → 教师', '教师 → 课程号', '候选键 = (学号, 课程号) 与 (学号, 教师)'],
    before: [
      { name: '排课', cols: ['学号', '课程号', '教师'], keys: ['学号 + 课程号', '学号 + 教师'], keyCols: ['学号', '课程号', '教师'], sick: ['教师'],
        rows: [['S01', 'C01', '甲老师'], ['S02', 'C01', '甲老师'], ['S01', 'C02', '乙老师']] },
    ],
    diagnosis: {
      disease: '教师 → 课程号：决定因素“教师”不是超键（只知教师定不了是哪个学生的记录），BCNF 不过关。全主属性只保证到 3NF。',
      fds: [
        { text: '(学号, 课程号) → 教师：决定因素是候选键，正常', kind: 'ok' },
        { text: '教师 → 课程号：决定因素不是超键（病）', kind: 'bad' },
      ],
    },
    result: '把“教师 → 课程号”这对关系单独成表，教师升格为主键。两张表里每条依赖的起点都是超键：达到 BCNF。',
    after: [
      { name: '上课', cols: ['学号', '教师'], keys: ['学号 + 教师'], keyCols: ['学号', '教师'],
        rows: [['S01', '甲老师'], ['S02', '甲老师'], ['S01', '乙老师']],
        verdict: '决定因素都是超键' },
      { name: '教师开课', cols: ['教师', '课程号'], keys: ['教师'], keyCols: ['教师'],
        rows: [['甲老师', 'C01'], ['乙老师', 'C02']],
        verdict: '满足 BCNF ✓' },
    ],
    costNote: '代价：(学号,课程号)→教师 已不在任何单表里，须连接两表才能验证——BCNF 分解可能牺牲“保持函数依赖”。',
  },
  {
    label: '出院',
    title: '出院小结 · 全套成果',
    desc: '四站做完，选课大表变成下面三张干净的小表：每张的候选键都标在表名下，每个非主属性直接依赖整键，每个决定因素都是超键。',
    finalTables: [
      { name: '学生', cols: ['学号', '姓名', '系'], keys: ['学号'], keyCols: ['学号'],
        rows: [['S01', '张三', '计算机系'], ['S02', '李四', '计算机系'], ['S03', '王五', '数学系']] },
      { name: '系', cols: ['系', '系主任'], keys: ['系'], keyCols: ['系'],
        rows: [['计算机系', '王主任'], ['数学系', '李主任']] },
      { name: '选课成绩', cols: ['学号', '课程号', '成绩'], keys: ['学号 + 课程号'], keyCols: ['学号', '课程号'],
        rows: [['S01', 'C01', '86'], ['S01', 'C02', '92'], ['S02', 'C01', '78'], ['S03', 'C01', '91']] },
    ],
    result: '拆完别忘了回讲义过“无损连接与保持函数依赖”两道验收门。大纲只考到 BCNF；4NF（消除多值依赖）、5NF（消除连接依赖）认识名字即可。',
  },
];

let stepIdx = 0;
let diagnosed = false;
let cut = false;

const $ = (id) => document.getElementById(id);

function makeTable(t, markSick) {
  const wrap = document.createElement('div');
  wrap.className = 'tbl-card';
  const name = document.createElement('div');
  name.className = 'tname';
  name.textContent = t.name + '(' + t.cols.join(', ') + ')';
  wrap.appendChild(name);
  if (t.keys) {
    const key = document.createElement('div');
    key.className = 'tkey';
    key.textContent = '候选键：' + t.keys.join(' 或 ');
    wrap.appendChild(key);
  }
  const table = document.createElement('table');
  const headRow = document.createElement('tr');
  t.cols.forEach((c) => {
    const th = document.createElement('th');
    th.textContent = c;
    if (t.keyCols && t.keyCols.includes(c)) th.classList.add('keycol');
    if (markSick && t.sick && t.sick.includes(c)) th.classList.add('sick');
    headRow.appendChild(th);
  });
  table.appendChild(headRow);
  t.rows.forEach((r) => {
    const tr = document.createElement('tr');
    r.forEach((v, i) => {
      const td = document.createElement('td');
      td.textContent = v;
      if (markSick && t.sick && t.sick.includes(t.cols[i])) td.classList.add('sick');
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  wrap.appendChild(table);
  if (t.verdict) {
    const verdict = document.createElement('div');
    verdict.className = 'tverdict';
    verdict.textContent = t.verdict;
    wrap.appendChild(verdict);
  }
  return wrap;
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function render() {
  clearExtras();
  const step = STEPS[stepIdx];

  const stepper = $('stepper');
  stepper.textContent = '';
  STEPS.forEach((s, i) => {
    const chip = el('button', 'chip' + (i === stepIdx ? ' on' : (i < stepIdx ? ' done' : '')), s.label);
    chip.type = 'button';
    chip.addEventListener('click', () => goto(i));
    stepper.appendChild(chip);
  });

  $('stepTitle').textContent = step.title;
  $('stepDesc').textContent = step.desc;

  const beforeArea = $('beforeArea');
  const afterArea = $('afterArea');
  const diag = $('diagnosis');
  beforeArea.textContent = '';
  afterArea.textContent = '';
  diag.textContent = '';

  if (step.finalTables) {
    $('actions').classList.add('hidden');
    diag.classList.add('hidden');
    afterArea.classList.add('hidden');
    beforeArea.classList.remove('hidden');
    step.finalTables.forEach((t, i) => {
      const card = makeTable(t, false);
      card.style.animation = 'slideIn .5s ease both';
      card.style.animationDelay = i * 120 + 'ms';
      beforeArea.appendChild(card);
    });
    $('stage').appendChild(el('p', 'fds-plain', step.result));
    updateNav();
    return;
  }

  $('actions').classList.remove('hidden');
  step.before.forEach((t) => beforeArea.appendChild(makeTable(t, diagnosed)));
  const rules = el('p', 'fds-plain', '业务规则与键：');
  step.fds.forEach((f, i) => {
    if (i > 0) rules.appendChild(document.createTextNode('　'));
    rules.appendChild(el('code', null, f));
  });
  beforeArea.after(rules);

  if (diagnosed) {
    diag.classList.remove('hidden');
    diag.appendChild(el('div', null, '病灶：' + step.diagnosis.disease));
    step.diagnosis.fds.forEach((f) => {
      diag.appendChild(el('span', 'fd ' + f.kind, f.text));
    });
  } else {
    diag.classList.add('hidden');
  }

  if (cut) {
    beforeArea.classList.add('done');
    beforeArea.prepend(el('span', 'stamp', '原表已拆开'));
    if (step.after && step.after.length) {
      afterArea.classList.remove('hidden');
      step.after.forEach((t, i) => {
        const card = makeTable(t, false);
        card.style.animationDelay = i * 120 + 'ms';
        afterArea.appendChild(card);
      });
      afterArea.appendChild(el('p', 'fds-plain', step.result));
    }
    if (step.costNote) {
      afterArea.appendChild(el('div', 'diagnosis cost', step.costNote));
    }
  } else {
    afterArea.classList.add('hidden');
  }

  $('diagBtn').disabled = diagnosed;
  $('cutBtn').disabled = !diagnosed || cut;
  updateNav();
}

/* 上一步/下一步产生的临时节点（规则行、结果行）统一清理；#diagnosis 是常驻节点，不能删 */
function clearExtras() {
  document.querySelectorAll('.stage > p.fds-plain').forEach((n) => n.remove());
}

function updateNav() {
  $('prevBtn').disabled = stepIdx === 0;
  $('nextBtn').disabled = stepIdx === STEPS.length - 1;
  $('progress').textContent = (stepIdx + 1) + ' / ' + STEPS.length;
}

function goto(i) {
  stepIdx = Math.max(0, Math.min(STEPS.length - 1, i));
  diagnosed = false;
  cut = false;
  render();
}

$('diagBtn').addEventListener('click', () => { diagnosed = true; render(); });
$('cutBtn').addEventListener('click', () => { cut = true; render(); });
$('prevBtn').addEventListener('click', () => goto(stepIdx - 1));
$('nextBtn').addEventListener('click', () => goto(stepIdx + 1));
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') goto(stepIdx - 1);
  if (e.key === 'ArrowRight') goto(stepIdx + 1);
});

(function () {
  const btn = $('themeBtn');
  try {
    const saved = localStorage.getItem('nf-theme');
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (err) { /* file:// 下存储不可用时忽略 */ }
  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('nf-theme', next); } catch (err) { /* 忽略 */ }
  });
})();

render();
