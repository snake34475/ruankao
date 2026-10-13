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
  {
    date: '2026-10-12',
    kind: '错题',
    title: '职务开发著作权想当然归开发者个人',
    tags: ['知识产权', '职务开发'],
    status: 'warn',
    mine: '课后 5 选 A（归小周）；课后 16(1) 答“著作权归小吴”',
    correct: '课后 5 选 B（归甲公司）；16(1) 归甲公司，小吴只保留署名权',
    cause: '把“谁写的代码归谁”套在职务开发上。任职期间、针对单位明确指定的开发目标、主要使用单位物质技术条件、由单位承担责任——软件著作归单位，作者只剩署名权。2026-10-12 重做 G1～G4、G8(1) 全对，两要件与条例三问已能分开。',
    next: '2026-10-16',
  },
  {
    date: '2026-10-12',
    kind: '错题',
    title: '法人软件著作权保护期的锚点选错',
    tags: ['知识产权', '保护期'],
    status: 'danger',
    mine: '课后 4 选 A：自开发完成之日起第 50 年的 12 月 31 日',
    correct: 'B：法人软件 50 年，截止于首次发表后第 50 年的 12 月 31 日',
    cause: '条例对法人软件统一以“首次发表”为锚（自开发完成 50 年内未发表的不再保护）。“创作完成 50 年”是一般法人作品发表权的锚，两套规则记串了。10-12 重做 G5 时，法人一般作品财产权又错选“永久”，本簇升级为头号过关目标。',
    next: '2026-10-14',
  },
  {
    date: '2026-10-12',
    kind: '错题',
    title: '合法复制品所有人的备份义务漏了后半句',
    tags: ['知识产权', '合法复制品权利'],
    status: 'warn',
    mine: '课后 15 选 C：丧失所有权后仍保留备份，以为不侵权',
    correct: 'D：防损坏做一份备份、供自己使用，才不构成侵权；C 恰恰是侵权情形',
    cause: '备份条款是两半：“只能自留”+“丧失原件所有权必须销毁备份”，只记住了前一半。且与 16(2) 自相矛盾：16 里判小吴带走源代码侵权，15 却放过了“丢原件留备份”。10-12 重做 G6（反向问法“构成侵权的是”）已选对。',
    next: '2026-10-14',
  },
  {
    date: '2026-10-12',
    kind: '盲区',
    title: '场景题结论对但理由错：“离职两年内不能授权”',
    tags: ['知识产权', '表述理由'],
    status: 'ok',
    mine: '16(2) 判小吴、乙公司侵权（对），理由写成“离职两年内不能授权”',
    correct: '真正的理由：著作权归甲公司，小吴无权处分；以个人名义登记他人软件 + 擅自授权他人使用均侵权，与离职后几年无关',
    cause: '把著作权法里一般职务作品“单位优先使用权 2 年”或专利法职务发明概念搬来凑理由，软件条例并无“离职两年”限制。场景判定题要结论、理由各占一半分，理由编造等于没答对。',
    next: '2026-10-15',
  },
  {
    date: '2026-10-12',
    kind: '疑问',
    title: '发表权保护期在 A（永久）和 B（终生+死后 50 年）之间犹豫',
    tags: ['知识产权', '保护期'],
    status: 'ok',
    mine: '精华 5 答“A 或 B”，没敢定',
    correct: 'B：发表权 = 作者终生及其死亡后 50 年，不是永久',
    cause: '永久保护只有三样：署名权、修改权、保护作品完整权（口诀“署改完永久”）。发表权虽然同属人身权，但带期限。10-12 重做 G7（反向问“受期限限制的是”）已选对，转已过关。',
    next: '2026-10-15',
  },
  {
    date: '2026-10-12',
    kind: '错题',
    title: '法人一般作品财产权保护期错选“永久”（课后 4 的复发变体）',
    tags: ['知识产权', '保护期'],
    status: 'danger',
    mine: 'G5 选 C：法人作品的财产权永久保护',
    correct: 'B：保护期 50 年，截止于首次发表后第 50 年的 12 月 31 日',
    cause: '“永久”只是署改完三个人身权的待遇，财产权是钱权、一律有期限。法人作品双锚点：发表权锚创作完成后 50 年，财产权锚首次发表后 50 年；软件法人同按首次发表 50 年。与课后 4 同一簇，说明法人锚点表还没建起来。',
    next: '2026-10-14',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '把“读脏数据”认成“丢失的数据”',
    tags: ['并发错误', '脏读', '03 数据思维'],
    status: 'danger',
    mine: '第 3 题选 A（丢失的数据）',
    correct: 'C（脏数据）：读到的是未提交、随后被回滚的值',
    cause: '只抓住了“读到的值后来没了”，就归到“丢失”。丢失修改的关键字是“写被写覆盖”（两个写回互相盖掉，谁都提交了）；读脏数据的特征字是“读到一个从未生效的值”。判别锚点是最后一步动作：改值者 ROLLBACK → 脏读；改值者 COMMIT → 不可重复读。',
    next: '2026-10-15',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '把“幻读”认成“不可重复读”',
    tags: ['并发错误', '幻读'],
    status: 'danger',
    mine: '第 7 题选 C（不可重复读）',
    correct: 'D（幻读）：同一范围条件两次查，行数 3 行变 4 行',
    cause: '不可重复读与幻读都叫“两次结果不同”，区别在对象：不可重复读是“同一行字段值被改了”，幻读是“满足条件的行数增减了”。题干给的是插入新行导致结果集多一行，属于行数变化。口诀：同一行变是前，结果集增减行是后。',
    next: '2026-10-15',
  },
  {
    date: '2026-10-13',
    kind: '疑问',
    title: 'REDO / UNDO 在 A、B 之间摇摆',
    tags: ['故障恢复', 'REDO/UNDO'],
    status: 'warn',
    mine: '第 5 题答“不确定是 B 还是 A”',
    correct: 'B（UNDO）：未提交事务做了一半，必须撤销抹掉',
    cause: '口诀只有一句：已提交就 REDO、未提交就 UNDO。恢复扫描日志时只看两件事——BEGIN 后面有没有 COMMIT。有 COMMIT 说明结果该留存，重放（REDO）；只有 BEGIN 说明是半成品，撤销（UNDO）。A（REDO）是给已完成事务用的，方向正好相反。',
    next: '2026-10-15',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: 'GROUP BY 用课程号分组去查学生——分组列选错',
    tags: ['SQL', 'GROUP BY', '聚合'],
    status: 'danger',
    mine: '第 12(2) 写：SELECT Sno FROM SC GROUP BY Cno HAVING Cno>3',
    correct: 'SELECT Sno FROM SC GROUP BY Sno HAVING COUNT(Cno)>3',
    cause: '两处错叠加：① 题干要“每个学生选了几门”，粒度是学生，分组列必须写 Sno，写 Cno 变成“每门课”；② HAVING 里应该是数行数的聚合 COUNT(Cno)，却写成裸列 Cno 和一个数字比较——分组后裸列代表不了整组。记住：题干说“每个 X 的门数/平均分/人数”，GROUP BY 就写 X，组条件用聚合函数包住要统计的列。',
    next: '2026-10-15',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '三表聚合查询漏了连接、子查询出了多列',
    tags: ['SQL', '多表连接', '聚合', '子查询'],
    status: 'danger',
    mine: '第 13(2) 写：SELECT 团名,成绩 FROM 代表团 WHERE 团编号 IN (SELECT 团编号,SUM(成绩) FROM 运动员 WHERE (SELECT 运动员编号,成绩 FROM 参赛) GROUP BY 团编号 HAVING SUM(成绩)>300)',
    correct: 'SELECT 代表团.团名, SUM(参赛.成绩) AS 总分 FROM 代表团 JOIN 运动员 ON 代表团.团编号=运动员.团编号 JOIN 参赛 ON 运动员.运动员编号=参赛.运动员编号 GROUP BY 代表团.团编号,代表团.团名 HAVING SUM(参赛.成绩)>=300',
    cause: '四个硬伤叠在一起：① 成绩在“参赛”表里，却当成代表团的列直接 SELECT；② 三张表沿“代表团→运动员→参赛”的路径必须逐段 JOIN，这里完全没连；③ IN 后的子查询只能出一列，这里 SELECT 出了两列；④ “300 分（含）以上”是闭区间，写成 > 300 丢掉了等于。聚合查询先画表间路径，再想分组粒度。',
    next: '2026-10-16',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '建表外键子句、视图定义两处语法写坏',
    tags: ['SQL', 'CREATE TABLE', 'CREATE VIEW'],
    status: 'warn',
    mine: '13(1) 写 FOREIGN KEY (运动员 REFRENCE 运动员(运动员编号))；13(3) 写 CREATE VIEW vHighScore AS ( FROM 比赛项目 WHEHE exit(...) 双层嵌套 )',
    correct: 'FOREIGN KEY (运动员编号) REFERENCES 运动员(运动员编号)；CREATE VIEW vHighScore AS SELECT 运动员.运动员编号,运动员.姓名,比赛项目.项目名称 FROM 运动员 JOIN 参赛 ON ... JOIN 比赛项目 ON ... WHERE 参赛.成绩>=95',
    cause: '① 外键固定三段式：FOREIGN KEY (本表列) REFERENCES 表名(被引列)，列名要写完整（运动员编号），REFERENCES 拼写别丢 S；② CREATE VIEW 是“视图名 AS 查询语句”，AS 后直接接 SELECT，不加括号；③ 视图跨三张表要沿“运动员→参赛→比赛项目”逐段 JOIN，嵌套 EXISTS 不能替代连接。',
    next: '2026-10-16',
  },
  {
    date: '2026-10-13',
    kind: '盲区',
    title: '关联子查询里，省掉关联条件为什么返回全体',
    tags: ['SQL', 'EXISTS', '关联子查询'],
    status: 'warn',
    mine: '第 9 题：知道“只要有人选了 C02 就会返回所有学生”，但说不出原因',
    correct: '省掉 SC.Sno=S.Sno 后，子查询不再与本行学生挂钩，退化成与当前学生无关的常真判断',
    cause: 'EXISTS 是“逐行检查”：对外层每个学生 S，子查询才用 SC.Sno=S.Sno 把内层和当前这行绑在一起问“你选了吗”。一旦这截断掉，子查询问的对象就不再跟着外层的行走，变成固定的“这门课有没有人选”——有人选则所有学生都为真。关联子查询的关联条件就是那个“随外层行移动的指针”，省不得。',
    next: '2026-10-15',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '“含／以上”的闭区间写成半开区间：300、95 都漏了等于',
    tags: ['SQL', '边界条件', '字符串常量'],
    status: 'warn',
    mine: '13(2) HAVING SUM(成绩)>300；13(3) 成绩>95；9 题字符串写成双引号 "C02"',
    correct: '总分 ≥300 写 >=300；成绩“95（含）以上”写 >=95；字符串常量用单引号 \'C02\'',
    cause: '题眼“含／以上／之内”是闭区间，比较符必须带等号，99 分和 100 分这种擦边值最容易在这里丢分。另外 SQL 里字符串常量标准写法是单引号，双引号在标准 SQL 里表示标识符名，考试按单引号写才稳妥。',
    next: '2026-10-16',
  },
];

const WEAK = [
  { name: '连接的行数与列数手算', errors: 2, status: 'danger', action: '重做 × / ⋈ 对照表' },
  { name: '笛卡尔积与连接的区别', errors: 2, status: 'danger', action: '背口诀 + 重做改错题' },
  { name: '等值连接 / 自然连接列数', errors: 1, status: 'warn', action: '手算 3 对表' },
  { name: '投影去重、选择逐行验条件', errors: 0, status: 'ok', action: '考前抽查' },
  { name: '复合式子 σ+π+⋈ 运算顺序', errors: 0, status: 'ok', action: '考前抽查' },
  { name: '职务开发著作权归属（归单位）', errors: 2, status: 'warn', action: '10-12 重做 G1～G4 已过，考前抽查' },
  { name: '著作权保护期三锚点（永久/发表/终生+50）', errors: 3, status: 'danger', action: '背法人双锚点 +「署改完永久」，重做课后 3、4、精华 5、G5' },
  { name: '合法复制品备份的两半义务', errors: 1, status: 'warn', action: '重做课后 15，对照速判表' },
  { name: 'GROUP BY 分组粒度与聚合条件', errors: 1, status: 'danger', action: '重做 12(2)、13(2)，先认「每个 X」再定分组列，组条件必带 COUNT/SUM' },
  { name: '多表连接路径与嵌套子查询写法', errors: 2, status: 'danger', action: '重做第 9、13(2)、13(3) 题，连接先画表间路径，IN 子查询只出一列' },
  { name: '建表外键与建视图的固定格式', errors: 1, status: 'warn', action: '默写 FOREIGN KEY 三段式与 CREATE VIEW ... AS SELECT，重做 13(1)(3)' },
  { name: '并发四类错误对号入座', errors: 2, status: 'danger', action: '背判别锚点（改值者 COMMIT/ROLLBACK、行数变没变），重做第 3、7 题' },
  { name: '故障恢复 REDO/UNDO 判据', errors: 1, status: 'warn', action: '背「已提交 REDO、未提交 UNDO」，重做第 5、11 题' },
  { name: '“含／以上”闭区间与单引号常量', errors: 1, status: 'warn', action: '见 >= 就写等号，字符串统一单引号，重做 13(2)(3)' },
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
