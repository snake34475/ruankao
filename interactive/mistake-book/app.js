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
    mine: '10-09：B，按两表行数相乘；10-15 第 1 题：B（自然连接行数直接按 3×5 算）；第 7 题：9 行（按 3×3 算）',
    correct: '自然连接的列数为两表列数减去重复的同名列；行数由公共属性值实际配成的组合数决定',
    cause: '把笛卡尔积 × 的行数规则「两表行数相乘」套到了自然连接 ⋈ 上。⋈ 是先按同名属性配对、再只保留同名列相等的组合，行数由每个公共值在两表中出现次数的乘积相加决定；只有所有行都能互相配对时，才可能达到两表行数相乘这个上限。10-15 第 7 题中 x 在两表各出现 2 次，故只有 2×2=4 行，y、z 均配不上。',
    next: '2026-10-17',
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
    status: 'ok',
    mine: '第 3 题选 A（丢失的数据）；10-14 回炉重做选 C',
    correct: 'C（脏数据）：读到的是未提交、随后被回滚的值',
    cause: '只抓住了“读到的值后来没了”，就归到“丢失”。丢失修改的关键字是“写被写覆盖”（两个写回互相盖掉，谁都提交了）；读脏数据的特征字是“读到一个从未生效的值”。判别锚点是最后一步动作：改值者 ROLLBACK → 脏读；改值者 COMMIT → 不可重复读。10-14 回炉重做一次答对，锚点已用对。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '把“幻读”认成“不可重复读”',
    tags: ['并发错误', '幻读'],
    status: 'ok',
    mine: '第 7 题选 C（不可重复读）；10-14 回炉重做选 D',
    correct: 'D（幻读）：同一范围条件两次查，行数 3 行变 4 行',
    cause: '不可重复读与幻读都叫“两次结果不同”，区别在对象：不可重复读是“同一行字段值被改了”，幻读是“满足条件的行数增减了”。题干给的是插入新行导致结果集多一行，属于行数变化。口诀：同一行变是前，结果集增减行是后。10-14 回炉重做一次答对。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-13',
    kind: '疑问',
    title: 'REDO / UNDO 在 A、B 之间摇摆',
    tags: ['故障恢复', 'REDO/UNDO'],
    status: 'ok',
    mine: '第 5 题答“不确定是 B 还是 A”；10-14 回炉重做选 B',
    correct: 'B（UNDO）：未提交事务做了一半，必须撤销抹掉',
    cause: '口诀只有一句：已提交就 REDO、未提交就 UNDO。恢复扫描日志时只看两件事——BEGIN 后面有没有 COMMIT。有 COMMIT 说明结果该留存，重放（REDO）；只有 BEGIN 说明是半成品，撤销（UNDO）。A（REDO）是给已完成事务用的，方向正好相反。10-14 回炉重做一次答对。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: 'GROUP BY 用课程号分组去查学生——分组列选错',
    tags: ['SQL', 'GROUP BY', '聚合'],
    status: 'danger',
    mine: '第 12(2) 写：SELECT Sno FROM SC GROUP BY Cno HAVING Cno>3；10-14 回炉第 1 次写 HAVING COUNT(Cno>3)，第 2 次 GROUP Sno（漏 BY）',
    correct: 'SELECT Sno FROM SC GROUP BY Sno HAVING COUNT(Cno)>3',
    cause: '两处错叠加：① 题干要“每个学生选了几门”，粒度是学生，分组列必须写 Sno，写 Cno 变成“每门课”；② HAVING 里应该是数行数的聚合 COUNT(Cno)，却写成裸列 Cno 和一个数字比较——分组后裸列代表不了整组。记住：题干说“每个 X 的门数/平均分/人数”，GROUP BY 就写 X，组条件用聚合函数包住要统计的列。10-14 回炉：分组列已改对（Sno），但把比较运算符写进了聚合括号（COUNT(Cno>3)），第二次又漏掉 GROUP BY 的 BY——粒度会认了，写法仍不稳。',
    next: '2026-10-18',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '三表聚合查询漏了连接、子查询出了多列',
    tags: ['SQL', '多表连接', '聚合', '子查询'],
    status: 'warn',
    mine: '第 13(2) 写：SELECT 团名,成绩 FROM 代表团 WHERE 团编号 IN (SELECT 团编号,SUM(成绩) FROM 运动员 WHERE (SELECT 运动员编号,成绩 FROM 参赛) GROUP BY 团编号 HAVING SUM(成绩)>300)；10-14 回炉：JOIN 路径写对，但 GROUP BY 里出现表名、HAVING 写成 SUM(成绩>=300)',
    correct: 'SELECT 代表团.团名, SUM(参赛.成绩) AS 总分 FROM 代表团 JOIN 运动员 ON 代表团.团编号=运动员.团编号 JOIN 参赛 ON 运动员.运动员编号=参赛.运动员编号 GROUP BY 代表团.团编号,代表团.团名 HAVING SUM(参赛.成绩)>=300',
    cause: '四个硬伤叠在一起：① 成绩在“参赛”表里，却当成代表团的列直接 SELECT；② 三张表沿“代表团→运动员→参赛”的路径必须逐段 JOIN，这里完全没连；③ IN 后的子查询只能出一列，这里 SELECT 出了两列；④ “300 分（含）以上”是闭区间，写成 > 300 丢掉了等于。聚合查询先画表间路径，再想分组粒度。10-14 回炉：三表 JOIN 路径已能一次写对（本条最大短板已补），闭区间也写对了；剩下两处是「代表团」表名当列名塞进 GROUP BY、以及 SUM(参赛.成绩>=300) 又把比较符写进聚合括号。',
    next: '2026-10-18',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '建表外键子句、视图定义两处语法写坏',
    tags: ['SQL', 'CREATE TABLE', 'CREATE VIEW'],
    status: 'danger',
    mine: '13(1) 写 FOREIGN KEY (运动员 REFRENCE 运动员(运动员编号))；13(3) 写 CREATE VIEW vHighScore AS ( FROM 比赛项目 WHEHE exit(...) 双层嵌套 )；10-14 回炉 13(1) 三次提交、REFERENCES 仍拼错，13(3) 的 AS 后又加括号',
    correct: 'FOREIGN KEY (运动员编号) REFERENCES 运动员(运动员编号)；CREATE VIEW vHighScore AS SELECT 运动员.运动员编号,运动员.姓名,比赛项目.项目名称 FROM 运动员 JOIN 参赛 ON ... JOIN 比赛项目 ON ... WHERE 参赛.成绩>=95',
    cause: '① 外键固定三段式：FOREIGN KEY (本表列) REFERENCES 表名(被引列)，列名要写完整（运动员编号），REFERENCES 拼写别丢 S；② CREATE VIEW 是“视图名 AS 查询语句”，AS 后直接接 SELECT，不加括号；③ 视图跨三张表要沿“运动员→参赛→比赛项目”逐段 JOIN，嵌套 EXISTS 不能替代连接。10-14 回炉：JOIN 路径已写对，但 REFERENCES 连错三次（记为 re-fer-ences，REF 后面那个 e 来自 refer）、AS 后又加括号（第二次），另把题干表名「参赛」写成「参赛表」——这一类纯属格式与誊写复核，非理解问题，故升级为未过关。',
    next: '2026-10-18',
  },
  {
    date: '2026-10-13',
    kind: '盲区',
    title: '关联子查询里，省掉关联条件为什么返回全体',
    tags: ['SQL', 'EXISTS', '关联子查询'],
    status: 'ok',
    mine: '第 9 题：知道“只要有人选了 C02 就会返回所有学生”，但说不出原因；10-14 回炉第 1 次给出结论，第 2 次补上机理',
    correct: '省掉 SC.Sno=S.Sno 后，子查询不再与本行学生挂钩，退化成与当前学生无关的常真判断',
    cause: 'EXISTS 是“逐行检查”：对外层每个学生 S，子查询才用 SC.Sno=S.Sno 把内层和当前这行绑在一起问“你选了吗”。一旦这截断掉，子查询问的对象就不再跟着外层的行走，变成固定的“这门课有没有人选”——有人选则所有学生都为真。关联子查询的关联条件就是那个“随外层行移动的指针”，省不得。10-14 回炉已能用自己的话讲出机理，只剩“常量恒为真 → 外层每行都保留”这一句收口。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '“含／以上”的闭区间写成半开区间：300、95 都漏了等于',
    tags: ['SQL', '边界条件', '字符串常量'],
    status: 'ok',
    mine: '13(2) HAVING SUM(成绩)>300；13(3) 成绩>95；9 题字符串写成双引号 "C02"；10-14 回炉：>= 与 \'C02\' 均写对',
    correct: '总分 ≥300 写 >=300；成绩“95（含）以上”写 >=95；字符串常量用单引号 \'C02\'',
    cause: '题眼“含／以上／之内”是闭区间，比较符必须带等号，99 分和 100 分这种擦边值最容易在这里丢分。另外 SQL 里字符串常量标准写法是单引号，双引号在标准 SQL 里表示标识符名，考试按单引号写才稳妥。10-14 回炉两处均已写对，转已过关。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-14',
    kind: '错题',
    title: '商标续展的“窗口期”和“新有效期”记混：续展年限写成 20 年',
    tags: ['知识产权', '商标权', '续展'],
    status: 'danger',
    mine: '练习第 10 题选 B：宽展期“期满后 6 个月”对上了，但把每次续展注册的有效期写成 20 年',
    correct: 'A：宽展期为期满后 6 个月；每次续展注册的有效期为 10 年',
    cause: '商标续展有两个独立的数字，都是 10 年、都不是 20 年：①“什么时候去续”——期满前 12 个月内办，来不及还有期满后 6 个月宽展期；②“续完管多久”——每次续展注册有效期又是 10 年，次数不限。20 年是发明专利的分量，商标里没有 20 这个数。口诀“商标 10 年核准起，前 12 后 6 可续展，续满 10 年无限次”：前 12 后 6 管窗口，续满 10 年管新期限。',
    next: '2026-10-16',
  },
  {
    date: '2026-10-14',
    kind: '疑问',
    title: '商标先申请原则与“同日才协商”的适用边界没分清',
    tags: ['知识产权', '商标权', '先申请原则'],
    status: 'warn',
    mine: '练习第 8 题选 B（授予甲公司）对了，但理由是反推的：“如果申请日期相同才是协商”，对“一先一后时按先申请原则”本身没把握',
    correct: 'B：商标注册申请实行先申请原则，相同或近似的商标由先申请者优先；协商只补“同日申请”这一种例外',
    cause: '把“同日申请 → 协商”当成了主规则，于是反过来推“不同日才轮得到先申请”，两层关系颠倒了。正确结构是：默认规则为“申请在先者优先”——题面只说先后、没提同日，就直接套先申请；协商仅用于双方同一天申请的情形。专利与商标共用同一套先申请原则，同日协商在两者中也都适用。',
    next: '2026-10-16',
  },
  {
    date: '2026-10-14',
    kind: '错题',
    title: '聚合函数的比较运算符写进了括号里（回炉两题同型）',
    tags: ['SQL', '聚合', 'HAVING'],
    status: 'danger',
    mine: '回炉 12(2) 写 HAVING COUNT(Cno>3)；回炉 13(2) 写 HAVING SUM(参赛.成绩>=300)',
    correct: 'HAVING COUNT(Cno)>3；HAVING SUM(参赛.成绩)>=300',
    cause: '把条件塞进聚合函数的括号，含义就变了：COUNT(Cno>3) 数的是“真假值非空的个数”（≈选过课的行数），SUM(成绩>=300) 数的是“成绩≥300 的行数”，两者都把原来的门槛条件整个丢掉。正确结构固定为 HAVING 聚合函数(列) 运算符 数值——括号里只放“要统计哪一列”，比较运算符永远写在括号外面。回炉两道题同型出现，属高频习惯性错误。',
    next: '2026-10-18',
  },
  {
    date: '2026-10-14',
    kind: '错题',
    title: 'REFERENCES 拼写反复错，且改错只改一处（同类项没扫全）',
    tags: ['SQL', 'CREATE TABLE', '拼写', '自查'],
    status: 'danger',
    mine: '回炉 13(1) 三次提交：REFRENCES → 两行都错 → 只改对一行，另一行继续写 REFRENCES',
    correct: 'REFERENCES（re-fer-ences，10 个字母、4 个 e）：refer + ence = reference，复数 references',
    cause: 'REFERENCES 由动词 refer 派生，REF 后面那个 e 属于 refer 本身，不能省；写错的 REFRENCES 少一个 e。真正暴露的是流程问题：同一句里同一个词出现两次，一轮改正只动了其中一处，错字在两条外键之间“转移”。交卷前的自查要扫“同类项是否全部改到”，而不是改完一处就收工。',
    next: '2026-10-18',
  },
  {
    date: '2026-10-14',
    kind: '错题',
    title: 'CREATE VIEW 的 AS 后又加括号（第二次），且视图里无聚合却写 GROUP BY',
    tags: ['SQL', 'CREATE VIEW', 'GROUP BY'],
    status: 'danger',
    mine: '回炉 13(3) 写 CREATE VIEW vHighScore AS ( SELECT ... GROUP BY 运动员.运动员编号,运动员.姓名 )',
    correct: 'CREATE VIEW vHighScore AS SELECT 运动员.运动员编号,运动员.姓名,比赛项目.项目名称 FROM 参赛 JOIN 运动员 ON ... JOIN 比赛项目 ON ... WHERE 参赛.成绩>=95;',
    cause: '① CREATE VIEW 的固定骨架是“视图名 AS 查询语句”，AS 后面直接接 SELECT，把整句套进括号是 0 分硬伤（上一轮已点过、本轮又犯）；② 题干只要三列，多出的成绩列属擅自加列；③ 整句没有任何聚合函数，GROUP BY 毫无意义，且 SELECT 里的项目名称既不在分组依据里也没被聚合，严格 SQL 直接报错——没有聚合就不写 GROUP BY；④ GROUP BY 漏 BY、GROUP BY 里塞进表名（代表团）同属固定短语写不准。',
    next: '2026-10-18',
  },
  {
    date: '2026-10-15',
    kind: '疑问',
    title: '商业秘密“未公开”不是不受法律保护',
    tags: ['知识产权', '商业秘密', '保护条件'],
    status: 'warn',
    mine: '第 4 题选 B，但怀疑 D：未公开是否意味着不受法律保护',
    correct: 'B：保密措施有效即持续受保护；独立研发不侵权',
    cause: '把专利“公开换独占”的取得路径套到了商业秘密上。商业秘密的“不为公众所知悉”恰是构成条件之一，不是失去保护的原因；它通过保密措施和《反不正当竞争法》等获得保护。只有被公开到不再是秘密、或未采取相应保密措施时，才可能不再满足商业秘密的条件。',
    next: '2026-10-17',
  },
  {
    date: '2026-10-15',
    kind: '错题',
    title: '建表外键与主键子句漏括号，表名也没改回题干（E-R 案例题第二次）',
    tags: ['SQL', 'CREATE TABLE', 'REFERENCES', '固定格式'],
    status: 'danger',
    mine: 'E-R 案例题 3(1) 重写：CREATE TABLE 参赛表 ( ... PRIMARY KEY 运动员编号,项目编号, FOREIGN KEY 运动员编号 REFERENCES 运动员(运动员编号), FOREIGN KEY 项目编号 REFERENCES 比赛项目(项目编号) )',
    correct: 'CREATE TABLE 参赛 ( ..., PRIMARY KEY (运动员编号, 项目编号), FOREIGN KEY (运动员编号) REFERENCES 运动员(运动员编号), FOREIGN KEY (项目编号) REFERENCES 比赛项目(项目编号) );',
    cause: '① 本轮 REFERENCES 两处拼写已改对、被引列名也对齐「运动员编号」，10-14 的同类项毛病这轮没犯，进步实在；② 但 PRIMARY KEY 与两条 FOREIGN KEY 的关键字后都漏了括号——固定骨架是「关键字 (本表列名)」，列名必须包在括号里；③ 表名仍沿用自造的「参赛表」，题干给的表从头到尾叫「参赛」，三个小问须同名。括号与表名同属固定格式，仍判未过关。',
    next: '2026-10-17',
  },
  {
    date: '2026-10-15',
    kind: '错题',
    title: '三表聚合仍凭空造列（运动员.所属团编号），且连接条件多写孤立等号',
    tags: ['SQL', '多表连接', '聚合'],
    status: 'danger',
    mine: 'E-R 案例题 3(2) 重写：SELECT ...,SUM(参赛.成绩), FROM 代表团 JOIN 运动员 ON  = 运动员.所属团编号 = 代表团.团编号 JOIN 参赛 ON  = 参赛.运动员编号 = 运动员.运动员编号 GROUP BY 代表团.团编号 HAVING SUM(参赛.成绩) >= 300',
    correct: 'SELECT 代表团.团编号,代表团.团名,SUM(参赛.成绩) AS 总分 FROM 代表团 JOIN 运动员 ON 代表团.团编号 = 运动员.团编号 JOIN 参赛 ON 运动员.运动员编号 = 参赛.运动员编号 GROUP BY 代表团.团编号,代表团.团名 HAVING SUM(参赛.成绩) >= 300;',
    cause: '① SUM 拼写、聚合括号、>= 闭区间、三表路径都改对了，进步明显；② 但「运动员」表里的列是「团编号」，仍写成不存在的「运动员.所属团编号」，第二次凭空造列——连接条件的列必须两张表都真实存在，写前先回题干表定义表逐字核对；③ 两处 ON 后面多写了一个孤立的「=」，连接条件整体语法错；④ SELECT 末列后多一个逗号。列名与标点各有手滑，本簇维持未过关。',
    next: '2026-10-17',
  },
  {
    date: '2026-10-15',
    kind: '错题',
    title: 'CREATE VIEW 的 AS 后又加括号（连续两轮），无聚合却写 GROUP BY，还擅自加列',
    tags: ['SQL', 'CREATE VIEW', 'GROUP BY'],
    status: 'ok',
    mine: '首答 13(3) 与回炉 13(3)：CREATE VIEW vHighScore AS ( SELECT ...参赛.成绩... GROUP BY 运动员.运动员编号, 比赛项目.项目编号 )',
    correct: 'CREATE VIEW vHighScore AS SELECT 运动员.运动员编号, 运动员.姓名, 比赛项目.项目名称 FROM 运动员 JOIN 参赛 ON 运动员.运动员编号 = 参赛.运动员编号 JOIN 比赛项目 ON 参赛.项目编号 = 比赛项目.项目编号 WHERE 参赛.成绩 >= 95;',
    cause: '① AS 后加括号曾连续两轮出现（10-13、10-14），是 0 分硬伤；② 题干只要三列，多出的成绩列属擅自加列；③ 整句没有聚合函数却写 GROUP BY，严格 SQL 报错。**10-15 E-R 案例题重写时三处全部修正**：AS 后直接接 SELECT（括号去掉）、只投影三列、不再写多余的 GROUP BY，且 JOIN 顺序 运动员→参赛→比赛项目 正确。唯一小瑕疵是 WHERE 里的 成绩 未带表名前缀（标准答案写 参赛.成绩），属规范性而非错误。连续三轮的顽疾本轮过关，转已过关。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-15',
    kind: '错题',
    title: '候选键最小性、主属性与范式阶梯混在一起判断',
    tags: ['关系规范化', '候选键', '主属性', '范式'],
    status: 'danger',
    mine: '第 2 题选 ABD；第 5 题把有传递依赖判为 3NF；第 6 题答候选键 A、B、C，且把“全码”与“全属性为主属性”混同',
    correct: '第 2 题候选键 AD；第 5 题最高 2NF（但可再分解到 3NF）；第 6 题候选键 AB、AC，A、B、C 都是主属性，最高 3NF',
    cause: '候选键先要“能推出全集”，再要逐个删属性验最小性：AD 已能推出 ABCD，ABD 中的 B 多余。主属性只问“是否出现在任一候选键中”，不是候选键本身，也不是只看选作主键的那一个；第 6 题 AB、AC 都是候选键，所以 A、B、C 均为主属性。范式必须逐级验：单属性候选键不可能有部分依赖，故第 5 题先过 2NF；但仓库号→城市→地区编号构成传递依赖，止于 2NF，达不到 3NF。',
    next: '2026-10-17',
  },
  {
    date: '2026-10-16',
    kind: '错题',
    title: '接口隔离与里氏替换连续混淆：先看“被迫实现”还是“子换父出错”',
    tags: ['面向对象设计原则', '接口隔离', '里氏替换', 'SOLID'],
    status: 'danger',
    mine: '① IWorker 同时含 work()、eat()、fly()；普通员工被迫空实现 fly()，答 LSP；② Bird 父类承诺 fly()，Penguin 子类改为抛异常，客户代码替换后报错，答 IFP（犹豫）',
    correct: '① ISP（接口隔离原则）：多个专门接口优于一个包含无关方法的总接口；② LSP（里氏替换原则）：子类替换父类后，不能破坏原有约定',
    cause: '这两题的区分必须先看题目在批评什么：普通员工被迫依赖和实现 fly() 这个无关方法，说明接口职责太杂，应拆成 IWork、IEat、IFly 等按需实现的小接口，选 ISP；企鹅替换鸟后，原本合法的 fly() 调用抛异常，说明子类破坏了父类约定，选 LSP。口诀：“被迫空实现无关方法”见 ISP；“子换父，原逻辑出错”才见 LSP。10-16 随后两道对照题均答对：简易打印机被迫空实现 scan/fax 选 ISP；VIPAccount 改变余额不足的行为约定选 LSP。',
    next: '2026-10-17',
  },
];

const WEAK = [
  { name: '连接的行数与列数手算', errors: 4, status: 'danger', action: '逐个公共值做“左表出现次数 × 右表出现次数”后求和；重做 10-15 第 1、7 题' },
  { name: '笛卡尔积与连接的区别', errors: 2, status: 'danger', action: '背口诀 + 重做改错题' },
  { name: '等值连接 / 自然连接列数', errors: 1, status: 'warn', action: '手算 3 对表' },
  { name: '投影去重、选择逐行验条件', errors: 0, status: 'ok', action: '考前抽查' },
  { name: '复合式子 σ+π+⋈ 运算顺序', errors: 0, status: 'ok', action: '考前抽查' },
  { name: '职务开发著作权归属（归单位）', errors: 2, status: 'warn', action: '10-12 重做 G1～G4 已过，考前抽查' },
  { name: '著作权保护期三锚点（永久/发表/终生+50）', errors: 3, status: 'danger', action: '背法人双锚点 +「署改完永久」，重做课后 3、4、精华 5、G5' },
  { name: '合法复制品备份的两半义务', errors: 1, status: 'warn', action: '重做课后 15，对照速判表' },
  { name: 'GROUP BY 分组粒度与聚合条件', errors: 4, status: 'danger', action: '分组列已会认（回炉已改对 Sno）；仍要练：先认「每个 X」定分组列，组条件写成 聚合函数(列) 运算符 值，GROUP BY 不许漏 BY；无聚合一律不写 GROUP BY（13(3) 已改对一次，E-R 3(2) 的聚合写法也已规范）' },
  { name: '多表连接路径与嵌套子查询写法', errors: 4, status: 'danger', action: '两条三表 JOIN 路径已能一次画对；仍要防「连接列名凭空编造」——E-R 3(2) 重写时仍写 运动员.所属团编号（该表只有 团编号），且 ON 后多写孤立等号；写连接条件前逐字回题干表定义核对列名' },
  { name: '建表外键与建视图的固定格式', errors: 5, status: 'danger', action: '三处固定骨架要能闭卷默写：FOREIGN KEY (本表列) REFERENCES 表名(被引列)、PRIMARY KEY (列)（关键字后必带括号）、CREATE VIEW 视图名 AS SELECT（AS 后直接接 SELECT、不加括号）；E-R 3(3) 的 AS 加括号已改对，E-R 3(1) 又漏 PRIMARY KEY/FOREIGN KEY 括号' },
  { name: '并发四类错误对号入座', errors: 3, status: 'ok', action: '回炉脏读、幻读各答对一次，锚点已用对；考前抽查' },
  { name: '故障恢复 REDO/UNDO 判据', errors: 2, status: 'ok', action: '回炉「未完成事务 → UNDO」答对；考前抽查' },
  { name: '“含／以上”闭区间与单引号常量', errors: 2, status: 'ok', action: '回炉闭区间与字符串常量均写对；考前抽查' },
  { name: '聚合函数与比较运算符的位置', errors: 2, status: 'danger', action: '括号里只放列，比较符写在外面；重做 12(2)、13(2)' },
  { name: '固定短语与同类项誊写复查', errors: 4, status: 'danger', action: '默写 REFERENCES / SUM / GROUP BY / WITH GRANT OPTION / CREATE VIEW ... AS SELECT；改错后扫同类项——10-15 重写已能一次改对 REFERENCES 两处，但标点仍漏（3(1) 关键字漏括号、3(2) 末列多逗号、ON 后多等号），交卷前扫一遍全句标点' },
  { name: '商标续展窗口期与新有效期（前 12 后 6 / 续 10）', errors: 1, status: 'danger', action: '背「前 12 后 6 管窗口，续满 10 年管新期限」，重做 10-14 练习第 10 题' },
  { name: '先申请原则与同日协商的适用边界', errors: 1, status: 'warn', action: '默认先申请优先，协商只补同日；专利商标同套规则，重做 10-14 练习第 8 题' },
  { name: '商业秘密的构成条件与法律保护', errors: 1, status: 'warn', action: '背“三要件：秘密性、价值性、保密措施”；重做本轮第 4、6 题' },
  { name: '候选键最小性、主属性与范式逐级判定', errors: 3, status: 'danger', action: '先算闭包、再逐个删属性；候选键求并集标主属性；按 1NF→2NF→3NF→BCNF 逐级验，重做 10-15 第 2、5、6 题' },
  { name: '接口隔离与里氏替换的场景辨析', errors: 2, status: 'warn', action: '本轮紧接的两道对照题已答对；明日各重做一题。被迫实现无关方法选 ISP；子类替换父类导致原有逻辑失效选 LSP' },
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
