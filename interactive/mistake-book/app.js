/* 错题本与知识图谱 · 数据与渲染
   新增错题：往 MISTAKES 追加一个对象即可；薄弱点图谱读 WEAK。
   status 取值：danger(未过关) / warn(待巩固) / ok(已过关) */

const STATUS = {
  danger: { label: '未过关', glyph: '●', cls: 'danger' },
  warn:   { label: '待巩固', glyph: '▲', cls: 'warn' },
  ok:     { label: '已过关', glyph: '✔', cls: 'ok' },
};

const MISTAKES = [
  {
    date: '2026-10-09',
    kind: '错题',
    title: '自然连接的行数不能由两表行数相乘得出',
    tags: ['关系代数', '连接行数'],
    status: 'danger',
    mine: 'B：5 列 + 行数 = 两表行数相乘',
    correct: 'C：4 列，行数取决于 B 上实际能配成多少对',
    cause: '把笛卡尔积 × 的行数规则「两表相乘」套到了自然连接 ⋈ 上。⋈ 是先按同名属性配对、再只保留同名列相等的组合，行数由实际能配成多少对决定。',
    next: '2026-10-11',
  },
  {
    date: '2026-10-09',
    kind: '错题',
    title: '用笛卡尔积代替连接（改错题看不出错）',
    tags: ['关系代数', '辨析'],
    status: 'danger',
    mine: 'π姓名(σ课程号=C1(学生 × 选课))，觉得没错',
    correct: 'π姓名(σ课程号=C1(学生 ⋈ 选课)) → 只有小林、小周',
    cause: '笛卡尔积把每个学生和任意选课行都配一遍，「课程号是 C1」和「这个学生是谁」变成两件不相干的事，没选 C1 的小陈、小吴也被列了进来。',
    next: '2026-10-11',
  },
  {
    date: '2026-10-09',
    kind: '盲区',
    title: '学号 05 是在哪一步被去掉的',
    tags: ['关系代数', '连接顺序'],
    status: 'warn',
    mine: '以为 ⋈ 行数 = 两表乘积，于是找不到 05 消失的那一步',
    correct: '在「筛掉同名列不相等」这一步被淘汰',
    cause: '× 才是乘积；⋈ 的一步动作是「先配对、再筛同名列相等」。05 在学生表里没有对应行，配不上，因此没机会走到后面的成绩筛选。',
    next: '2026-10-12',
  },
  {
    date: '2026-10-09',
    kind: '疑问',
    title: '两表有多个同名属性时，等值连接怎么算',
    tags: ['连接列数', '辨析'],
    status: 'warn',
    mine: '不确定同等值连接下多个同名列如何处理',
    correct: '等值连接只按写出的等式筛；自然连接要求所有同名属性都相等',
    cause: 'R(A,B,C) ⋈(R.B=S.B) S(B,C,D)：列数 6，B、C 各留一份、互不比较；自然连接 R ⋈ S：B、C 都要相等，列数 4。考点是「总列数 − 同名属性个数」。',
    next: '2026-10-12',
  },
];

const WEAK = [
  { name: '连接的行数与列数手算', errors: 2, status: 'danger', action: '重做 × / ⋈ 对照表' },
  { name: '笛卡尔积与连接的区别', errors: 2, status: 'danger', action: '背口诀 + 重做改错题' },
  { name: '等值连接 / 自然连接列数', errors: 1, status: 'warn', action: '手算 3 对表' },
  { name: '投影去重、选择逐行验条件', errors: 0, status: 'ok', action: '考前抽查' },
  { name: '复合式子 σ+π+⋈ 运算顺序', errors: 0, status: 'ok', action: '考前抽查' },
];

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- 总览数字块 ---------- */
function renderTiles() {
  const count = s => MISTAKES.filter(m => m.status === s).length;
  const defs = [
    { n: MISTAKES.length, l: '记录总数', cls: 't-total' },
    { n: count('danger'), l: '未过关', cls: 't-danger', st: 'danger' },
    { n: count('warn'), l: '待巩固', cls: 't-warn', st: 'warn' },
    { n: count('ok'), l: '已过关', cls: 't-ok', st: 'ok' },
  ];
  document.getElementById('tiles').innerHTML = defs.map(d => {
    const glyph = d.st ? `<span class="chip ${d.st}" style="border:0;background:none;padding:0"><span class="g">${STATUS[d.st].glyph}</span></span>` : '';
    return `<div class="tile ${d.cls}"><div class="n">${d.n}</div><div class="l">${glyph}${esc(d.l)}</div></div>`;
  }).join('');
}

/* ---------- 薄弱点图谱 ---------- */
function renderGraph() {
  const max = Math.max(1, ...WEAK.map(w => w.errors));
  document.getElementById('graph').innerHTML = WEAK.map(w => {
    const st = STATUS[w.status];
    const pct = Math.round((w.errors / max) * 100);
    return `<div class="grow s-${w.status}">
      <div class="gname">${esc(w.name)}</div>
      <div class="gbar" role="progressbar" aria-label="${esc(w.name)} 出错强度" aria-valuenow="${w.errors}" aria-valuemin="0" aria-valuemax="${max}"><i style="width:${pct}%"></i></div>
      <div class="gcount">${w.errors} 次</div>
      <div class="gchip"><span class="chip ${w.status}"><span class="g">${st.glyph}</span>${st.label}</span></div>
    </div>`;
  }).join('');
}

/* ---------- 错题卡片 ---------- */
function cardHTML(m) {
  const st = STATUS[m.status];
  return `<article class="card s-${m.status}">
    <header class="card-h">
      <span class="card-kind">${esc(m.kind)} · ${esc(m.date)}</span>
      <h3 class="card-t">${esc(m.title)}</h3>
      <span class="tags">${m.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</span>
    </header>
    <div class="card-b">
      <div class="ba">
        <div class="ans mine"><div class="k"><span>✗</span>我的答案</div><div class="v">${esc(m.mine)}</div></div>
        <div class="ans right"><div class="k"><span>✓</span>正确答案</div><div class="v">${esc(m.correct)}</div></div>
      </div>
      <p class="cause"><b>错因　</b>${esc(m.cause)}</p>
      <footer class="card-f">
        <span class="chip ${m.status}"><span class="g">${st.glyph}</span>${st.label}</span>
        <span class="foot-l">下次回炉 <b>${esc(m.next)}</b></span>
      </footer>
    </div>
  </article>`;
}

let filter = 'all';
function renderCards() {
  const list = MISTAKES.filter(m => filter === 'all' || m.status === filter);
  document.getElementById('cards').innerHTML = list.map(cardHTML).join('');
  document.getElementById('empty').classList.toggle('is-hidden', list.length > 0);
}

function renderFilters() {
  const count = s => s === 'all' ? MISTAKES.length : MISTAKES.filter(m => m.status === s).length;
  const defs = [
    { k: 'all', label: '全部' },
    { k: 'danger', label: `${STATUS.danger.glyph} 未过关` },
    { k: 'warn', label: `${STATUS.warn.glyph} 待巩固` },
    { k: 'ok', label: `${STATUS.ok.glyph} 已过关` },
  ];
  const box = document.getElementById('filters');
  box.innerHTML = defs.map(d =>
    `<button class="fbtn" type="button" data-k="${d.k}" aria-pressed="${d.k === filter}">${esc(d.label)} <span class="cnt">${count(d.k)}</span></button>`
  ).join('');
  box.querySelectorAll('.fbtn').forEach(btn => btn.addEventListener('click', () => {
    filter = btn.dataset.k;
    box.querySelectorAll('.fbtn').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    renderCards();
  }));
}

/* ---------- 深/浅色 ---------- */
function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('mb-theme');
  const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = saved || (preferDark ? 'dark' : 'light');
  root.classList.toggle('reduce', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  document.getElementById('themeBtn').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('mb-theme', root.dataset.theme);
  });
}

initTheme();
renderTiles();
renderGraph();
renderFilters();
renderCards();
