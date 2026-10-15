# 02.5 SQL ★★★

SQL 分四类语句，案例题主要考前两类：

| 类别 | 英文全称（中文） | 关键词 | 用途 |
|---|---|---|---|
| DDL | Data Definition Language（数据定义） | CREATE / ALTER / DROP | 建表、建视图、改结构 |
| DML | Data Manipulation Language（数据操纵） | SELECT / INSERT / UPDATE / DELETE | 查和改数据 |
| DCL | Data Control Language（数据控制） | GRANT / REVOKE | 授权、收权（选择题常考） |
| TCL | Transaction Control Language（事务控制） | COMMIT / ROLLBACK | 提交事务、回滚事务 |

两个记忆抓手：

- **缩写怎么来的**：四个都是「D + 一个单词 + Language（语言）」，区别只在中间那个词的首字母。定义 Definition 取 D、操纵 Manipulation 取 M、控制 Control 取 C、事务 Transaction 取 T，拼起来就是 DDL、DML、DCL、TCL。
- **为什么讲义全大写**：SQL 本身不区分大小写，`select` 和 `SELECT` 完全等价；讲义按行业惯例把**关键词**写成大写，只为一眼认出，表名、列名才习惯写小写。考试答题时大写小写都算对。

### 英文关键词速查（本页出现过的词）

中文的「增、删、查、改」正好是 DML 的四个动词：INSERT 增、DELETE 删、SELECT 查、UPDATE 改。其余关键词一并列在下面，方便对照含义：

| 关键词 | 中文 | 一句话说明 |
|---|---|---|
| CREATE | 创建 | 造一个新对象，如建表、建视图 |
| ALTER | 修改 | 改**已有表**的结构（加列、改类型） |
| DROP | 丢弃 | 连对象带数据一起删，删的是整个对象 |
| INSERT | 插入（增） | 往表里新增一行记录 |
| DELETE | 删除（删） | 删除满足条件的行，不动表结构 |
| SELECT | 选择（查） | 查询、取出数据 |
| UPDATE | 更新（改） | 修改已有行的值 |
| GRANT | 授予 | 把权限给别人 |
| REVOKE | 撤销／收回 | 把已经给出的权限收回来 |
| COMMIT | 提交 | 让事务的修改正式生效 |
| ROLLBACK | 回滚 | 撤销事务、恢复到修改前 |

骨架和完整性子句里还会遇到这些英文词：

| 关键词 | 中文 | 作用 |
|---|---|---|
| FROM | 来自 | 指定数据从哪张表来 |
| WHERE | 在哪里 | 分组前筛原始行 |
| GROUP BY | 按…分组 | 把行按某列归成组 |
| HAVING | 拥有 | 分组后筛「组」 |
| ORDER BY | 按…排序 | 对结果排序 |
| ASC / DESC | 升序 / 降序 | 排序方向，默认 ASC |
| JOIN … ON | 连接…基于 | 多表按条件连接 |
| IN | 在…之中 | 判断值是否属于某个集合 |
| EXISTS | 存在 | 子查询有行即为真 |
| AS | 作为 | 给表或列起别名 |
| VALUES | 值 | INSERT 要写入的值列表 |
| SET | 设置 | UPDATE 赋的新值 |
| ADD | 添加 | ALTER 给表加一列 |
| BETWEEN A AND B | 在 A 与 B 之间 | 表达范围条件 |
| CHECK | 检查 | 用户定义完整性（取值范围约束） |
| PRIMARY KEY | 主键 | 实体完整性 |
| FOREIGN KEY | 外键 | 参照完整性 |
| REFERENCES | 参照、引用 | 外键指向哪张表的哪个键 |
| WITH GRANT OPTION | 附带转授权 | 被授权人还能把权限再转给别人 |

### SELECT 完整骨架（背顺序）

```sql
SELECT   列名或函数            -- ⑤ 挑列
FROM     表                    -- ① 数据从哪来（可 JOIN ... ON）
WHERE    行条件                -- ② 先筛行
GROUP BY 分组列                -- ③ 按列分组
HAVING   组条件                -- ④ 筛组（条件里通常带聚合函数）
ORDER BY 排序列 [ASC|DESC];    -- ⑥ 最后排序
```

**为什么 HAVING 和 WHERE 要分家**：WHERE 在分组**前**筛原始行，此时还没有算出平均分这类聚合值；HAVING 在分组**后**筛"每组"。所以"查询平均分大于 80 的课程"必须写 `HAVING AVG(成绩)>80`，写进 WHERE 直接报错——这是最常见的案例扣分点。

骨架里圈注的 ①～⑥ 就是**执行顺序**（写的时候 SELECT 在最前，执行时它排第五）。光背顺序容易飘，拿一张 8 行的 SC 表把六个从句走一遍，看每一步之后"表变成了什么样"：

```sql
SELECT   Cno, AVG(Grade)
FROM     SC
WHERE    Grade >= 70
GROUP BY Cno
HAVING   AVG(Grade) > 90
ORDER BY AVG(Grade) DESC;
```

SC 数据（8 行）：C01 的成绩是 86、78、95、60；C02 是 92、91；C03 是 88、96。

| 执行到哪步 | 动作 | 这一步之后的状态 | 备注 |
|---|---|---|---|
| ① FROM SC | 取数据源 | 全部 8 行 | 若写了 JOIN，配对在这一步完成 |
| ② WHERE Grade≥70 | 逐行验条件 | **7 行**：60 分那行被剔除 | 筛行在分组**前**——C01 组里根本没有那个低分；若不写此条件，C01 平均会被拉到 79.75 |
| ③ GROUP BY Cno | 按课程号归堆 | 3 组：C01{86,78,95}、C02{92,91}、C03{88,96} | 分组之后"单行"消失，只剩"整组" |
| ④ HAVING AVG>90 | 逐组算平均再筛 | C01=86.33 ✗ 出局；C02=91.5 ✓；C03=92 ✓ | 组级筛选，条件里带聚合函数 |
| ⑤ SELECT Cno, AVG | 定最终列 | 2 行 2 列：(C02, 91.5)、(C03, 92) | 到这一步才"产出列"，所以 WHERE 里不能引用 SELECT 起的别名 |
| ⑥ ORDER BY AVG DESC | 排序 | (C03, 92)、(C02, 91.5) | 永远最后做 |

**执行顺序口诀：拿表（FROM）先筛行，分堆、算组、再筛组，选列之后才排序——写序认骨架，做序认①到⑥。**

**反例演示（易错）**：把 `AVG(Grade)>90` 写进 WHERE——分组还没发生，数据库根本算不出"组平均"，直接报错；反过来把 `Grade>=70` 挪进 HAVING 不报错，但含义变了：60 分会**先参与分组**再一起算账。**"进组前淘汰"和"进组后算账"是两回事**：条件关于哪一步，就写在哪一步。

**两个连环追问**：学到这里最常见的两问，卡点都在"WHERE 和 HAVING 各管哪一步"。

一问："WHERE 和 HAVING 都在筛成绩，合成一个 `WHERE Grade >= 90` 不就够了？"不够。两个条件管的是不同的步骤：`WHERE Grade >= 70` 给平均数挑**原料**（70 分以上的成绩才有资格进组算账，60 分那行根本不入组），`HAVING AVG(Grade) > 90` 审判**成品**（分组算出的组平均够不够格进最终名单）。把门槛挪到入口写成 `WHERE Grade >= 90`，C01 的 86、78 两个分数连同 60 一起被踢出原料，组平均从真实的 86.33 被抬高到 95——本来不合格的课**错误入选**。而且此时 HAVING 也形同虚设：组内每个分数都 ≥90，平均必然 ≥90，`> 90` 顶多拦得住"全组恰好都是 90 分"的组，筛组几乎不费力，整条查询的实际含义退化成"只要有任何人考了 90 以上，这门课就进名单"。**门槛设在入口，改的是平均数本身；门槛设在组上，只改谁进名单**——两个条件不可互相顶替。

二问："SELECT 里不是已经算出 `AVG(Grade)` 了吗，HAVING 直接写 `Grade > 90` 凭什么不行？"写不了，但原因恰恰**不是**"复用 SELECT 的结果"——HAVING（④）比 SELECT（⑤）执行得**还早**，它写的 `AVG(Grade)` 是数据库筛组时逐组当场算的，与 SELECT 里写法相同的那截表达式互不依赖，两处各自算各自的。真正的约束是：分组之后每组手里拿的是一整捆行（C01 是 {86,78,95}），裸的 `Grade` 不再指向这一组的某一个值——输出行只有一格、该取哪一行的值没有依据，与后文"GROUP BY 为什么管着普通列"一节的矛盾是同一个。所以组条件里只允许两类东西：分组列（每组天然一个值）和聚合函数（把组内全部行算成一个数）。`HAVING Grade > 90` 直接报错。

### 每个从句里写什么：WHERE 谓词、聚合函数与 AS

上面说清了"哪个条件写在哪"，本节回答"每一格里具体能填什么"。三类都是案例题写 SQL 的直接考点。

**WHERE 常用的行条件谓词**（题干出现对应说法就要想到写法）：

| 谓词 | 形式 | 示例 | 含义 |
|---|---|---|---|
| 比较 | `=` `>` `<` `>=` `<=` `<>` | `Grade >= 60` | 列与值比较，`<>` 是不等于 |
| 区间 | `BETWEEN ... AND ...` | `Grade BETWEEN 60 AND 100` | 闭区间 `60～100`，**含两端** |
| 集合 | `IN (...)` | `Sno IN ('S01','S02')` | 属于列举集合，等价于一串 OR；后面也可跟子查询 |
| 模式 | `LIKE` | `Sname LIKE '李%'` | 模糊匹配：`%` 任意串（含 0 个字符），`_` 恰好一个字符 |
| 空值 | `IS [NOT] NULL` | `Grade IS NULL` | 判断"缺值"，如缺考未登分 |

**反例演示（易错）**：`WHERE Grade = NULL` 语法不报错，但永远查不出缺分记录——与 NULL 的任何比较结果都是"未知"，判空必须用 `IS NULL`；`LIKE '李_'` 只匹配"李"开头且**总共两个字符**的姓名（李明、李娜），要匹配所有姓李的应写 `LIKE '李%'`。

**聚合函数：把"一整组"算成一个数**

| 函数 | 数什么 | 注意 |
|---|---|---|
| `COUNT(*)` | 组内行数 | NULL 行也计入 |
| `COUNT(列)` | 该列非 NULL 的个数 | NULL 的不计，与 `COUNT(*)` 可考差别 |
| `SUM` / `AVG` | 求和 / 求平均 | 只用于数值列，自动跳过 NULL |
| `MAX` / `MIN` | 最大 / 最小 | 字符、日期列也可用 |

聚合函数只能出现在 `SELECT`（产出这列）、`HAVING`（筛组）、`ORDER BY`（排序）三处，**写进 `WHERE` 必报错**。另有一条高频规则：SELECT 里的普通列（不在聚合函数包裹下的）**必须全部出现在 GROUP BY 里**，否则报错——为什么、怎么改，见下一小节。镜像一条同样高频：HAVING 条件里的裸列必须出现在 GROUP BY 里、或被聚合函数包住，否则报错——分组后一个裸列不代表这一组的一个值，道理见上面"两个连环追问"的二问。

**AS（别名）两个用途**：`AVG(Grade) AS 均分` 给结果列起名，`ORDER BY` 可以引用这个别名，但 `WHERE` 不行（它比 SELECT 先执行）；`FROM Student AS S` 给表起名，列写成 `S.Sno`，自连接题里必用。

### GROUP BY 为什么管着普通列：报错原理与正确改写

规则"未分组的普通列不许出现在 SELECT 里"背后只有**一个矛盾**：GROUP BY 不是把行**排在一起**，而是把多行**压成一行**（对照执行顺序表里 ③ 那行"分组之后单行消失，只剩整组"）。组被压成输出的一行之后，SELECT 里每列的处境：

- **组键列**（GROUP BY 里的列）：每组恰好一个值，天然确定 ✓
- **聚合函数**：吃组内全部行算出一个数，确定 ✓
- **其他普通列**：组内每行各有一个值，而输出行只有一格，**该取哪一行的值没有任何依据** ✗

数据库若从组里随便挑一行来填，查询能跑出来、结果却永远说不清是谁的——报错是在保护正确性，不是刁难你。

**高频反例（易错）**——拿本节 SC 小表查每门课平均分，顺手多选了一个 Sno：

```sql
SELECT Cno, Sno, AVG(Grade)   -- ✗ 报错：Sno 既没被聚合包住，也不在 GROUP BY 里
FROM SC
GROUP BY Cno;
```

按 Cno 分堆后是 3 组（查询里没有 WHERE，5 行都在）：C01 组的 Sno 有 S01、S02、S03 三个值，压成输出 1 行后这一格填谁？填哪个都错，数据库直接拒绝执行。

两种修法对应两种题意，**要么删列，要么把它请进组键**：

```sql
-- 修一：题意是"每门课一个平均分"，Sno 本来就是杂音，删掉
SELECT Cno, AVG(Grade)
FROM SC
GROUP BY Cno;

-- 修二：题意要"每个学生 × 每门课"一行，Sno 必须进 GROUP BY
SELECT Cno, Sno, AVG(Grade)
FROM SC
GROUP BY Cno, Sno;
```

修二的组键是 (Cno, Sno) 一对组合，分堆 C01{S01:86, S02:78, S03:95}、C02{S01:92}、C03{S02:NULL}，共 4 组 4 行——Sno 已是组键的一部分，每行有唯一值，合法了。

**粒度对照**——聚合到底在哪个粒度上"有活干"：

| GROUP BY 写什么 | 组键粒度 | 分出几组 | AVG 的实际效果 |
|---|---|---|---|
| `Cno` | 课程 | 3（C01 组 3 行） | ✓ 真正在算平均 |
| `Sno` | 学生 | 3（每人 2 行） | ✓ |
| `Cno, Sno` | 课程×学生 | 4（每组 1 行） | 每堆只剩 1 个分，"平均"等于它自己，结果退化成原表照抄 |

SC 的主键就是 (Sno, Cno)（见下文建表小节），**组键等于主键时每组必是 1 行，聚合空转**。"每个学生某门课的成绩"本来就是逐行查询、不需要 GROUP BY；只有"每门课""每个学生""每个系"这类比主键**粗**的粒度才轮到分组。认题意：题干说"每 X 的平均分／人数"，GROUP BY 就写 X。

**一句分界**：GROUP BY **减行**（N 行进、组数行出），ORDER BY **不减行**（只改顺序）——把分组想成"排序归堆"就会犯上面那个错。

**一句了解（超纲，不必背）**：若想保留全部原始行、又给每行附上"该课平均分"，标准聚合查询做不到（GROUP BY 必减行），要靠窗口函数 `AVG(Grade) OVER (PARTITION BY Cno)`——软考不考，见到认得即可。

**应试动作**：案例题写完带 GROUP BY 的 SQL，先扫一遍 SELECT——没被聚合函数包住的列，逐个核对是否出现在 GROUP BY 里，缺谁补谁、谁多余删谁；这条自查永远排在检查 HAVING 之前。

**逐行示例**——查每个系的选课记录数和平均分，只要"记录数不少于 2 且平均分不低于 75"的系，按平均分降序。两份小数据（沿用上面 SC 的分数）：

Student 表：

| Sno | Sname | Dept |
|---|---|---|
| S01 | 李明 | 计算机 |
| S02 | 王芳 | 计算机 |
| S03 | 赵雪 | 通信 |

SC 表：

| Sno | Cno | Grade |
|---|---|---|
| S01 | C01 | 86 |
| S01 | C02 | 92 |
| S02 | C01 | 78 |
| S02 | C03 | NULL |
| S03 | C01 | 65 |

```sql
SELECT   Student.Dept,              -- ⑤ 产出列。Dept 是普通列，所以必须出现在 GROUP BY 里
         COUNT(*)      AS 选课数,    -- ⑤ 每组有几行，AS 给这列起名叫"选课数"
         AVG(SC.Grade) AS 均分       -- ⑤ 每组成绩的平均值
FROM     Student JOIN SC            -- ① 取两张表
         ON Student.Sno = SC.Sno    --    按学号相同配对：SC 的每一行挂上自己的系名
WHERE    SC.Grade IS NOT NULL       -- ② 逐行剔掉缺分记录（S02 选 C03 那行）
GROUP BY Student.Dept               -- ③ 按系归堆：计算机{86,92,78}，通信{65}
HAVING   COUNT(*) >= 2              -- ④ 分组后数行数：通信组只有 1 行，出局
         AND AVG(SC.Grade) >= 75    --    分组后算平均再筛一轮
ORDER BY 均分 DESC;                 -- ⑥ 最后排序，这里可以引用 AS 起的别名
```

逐步走一遍（对照注释里的 ①～⑥）：JOIN 后 5 行 → WHERE 剔 1 行剩 4 行 → 分成计算机 3 行、通信 1 行 → HAVING 淘汰通信 → SELECT 对计算机算出 3、(86+92+78)/3=256/3≈85.33。最终结果只有一行：

| Dept | 选课数 | 均分 |
|---|---|---|
| 计算机 | 3 | 85.33 |

**应试动作**：看到"范围／之内"想 `BETWEEN`；"在给定几个里"想 `IN`；"姓李／以 XX 开头／包含"想 `LIKE`；"没有成绩／缺"想 `IS NULL`；"每个／各"想 `GROUP BY`＋聚合函数；条件里出现聚合函数，必写 `HAVING`；写完 GROUP BY 先扫一遍 SELECT——没被聚合包住的普通列，逐个核对在不在 GROUP BY 里，缺谁补谁、谁多余删谁。

### 外连接（扩展：低频考点）

> 考频提示：真题案例题的 SQL 以等值 JOIN 和嵌套查询为主，**外连接几乎不要求写**；它可能以选择题形式考概念辨识（"保留左表全部行的是哪种连接"）。本节按"了解概念、认得出写法"的标准掌握即可，不占背诵额度。

**它解决什么问题**：上面的 `JOIN ... ON`（内连接）只保留两边都配对成功的行——配不上的会被**悄悄扔掉**。但题目有时要的恰恰是被扔的那部分，比如"查**一门课都没选**的学生"。

沿用上一节的两张小表，并给 Student 补一行：`S04 周杰 通信`（他在 SC 里没有任何选课记录）。

**三种外连接：指定哪一边的行必须无条件保留，配不上的一侧填 NULL**

| 写法 | 保留谁 | 说明 |
|---|---|---|
| `LEFT [OUTER] JOIN` | 左表全部行 | 周杰会保留，他的 Cno、Grade 显示 NULL |
| `RIGHT [OUTER] JOIN` | 右表全部行 | 只是 LEFT 的镜像，实战习惯统一写 LEFT |
| `FULL [OUTER] JOIN` | 两边全部行 | 谁配不上谁填 NULL |

方括号的 `OUTER` 可省略，`LEFT JOIN` 就是 `LEFT OUTER JOIN`。

```sql
SELECT Sname, Cno, Grade
FROM   Student LEFT JOIN SC ON Student.Sno = SC.Sno;
```

结果是上一节内连接的 5 行**加上**周杰这行：`周杰 | NULL | NULL`——内连接里他消失了，外连接把他留住。

**经典套路：外连接 + IS NULL 反查"配不上的人"**。"查没选课的学生"：

```sql
SELECT Sname
FROM   Student LEFT JOIN SC ON Student.Sno = SC.Sno
WHERE  SC.Sno IS NULL;    -- 只有配对失败的行，右表主键才是 NULL
```

先 LEFT JOIN 保证周杰在场，再用 `WHERE ... IS NULL` 挑出"右边全是 NULL"的行。同理可查孤儿记录（SC 里学号在 Student 中不存在的行）：`SC LEFT JOIN Student ... WHERE Student.Sno IS NULL`。

**易错点（ON 与 WHERE 的分工）**：外连接里 ON 只负责"怎么配对"，**不负责筛行**——保留侧的行永不删。因此对哪一侧的限制写在哪：保留侧（Student）的条件进 `WHERE`，可空侧（SC）的条件进 `ON`。把 `SC.Grade >= 60` 写进 WHERE，周杰那行会因 NULL 比较不通过而被删掉，外连接白做。

**应试动作**：选择题问"保留左表所有元组的连接"→ 答左外连接；案例题题干出现"包括没有选课／成绩的学生"→ 才考虑 LEFT JOIN，其余情形一律等值 JOIN。

### 建表与完整性（案例题第 1 小问模板）

```sql
CREATE TABLE SC (
    Sno   CHAR(8),
    Cno   CHAR(6),
    Grade SMALLINT,
    PRIMARY KEY (Sno, Cno),                -- 实体完整性：主键
    FOREIGN KEY (Sno) REFERENCES Student(Sno),  -- 参照完整性：外键
    FOREIGN KEY (Cno) REFERENCES Course(Cno),
    CHECK (Grade BETWEEN 0 AND 100)        -- 用户定义完整性
);
```

三种完整性对应关系：主键 → 实体完整性；外键 → 参照完整性；CHECK/取值范围 → 用户定义完整性。**选择题爱考对应关系，案例题爱考写外键子句**。

### 建表模板逐子句读法

模板里的每个子句按关键字读：

- `Sno CHAR(8)`：CHAR 是**定长字符串**，8 为最大长度。学号虽然由数字组成，但从不做算术，所以按字符串存（值写 `'20260001'`），不用整数类型。`Grade SMALLINT`：SMALLINT 是短整数，存 0～100 的分数绰绰有余。
- `PRIMARY KEY (Sno, Cno)`：主键唯一标识一行，自带**不重复、不许为 NULL** 两条强制。这里取两列做**复合主键**，原因是单列都不够格：一个学生选多门课，Sno 会重复；一门课多人选，Cno 也会重复；而"一个学生在一门课"最多出现一次，组合才唯一。主键若只有一列，可以直接跟在列定义后面（列级约束，如 `Sno CHAR(8) PRIMARY KEY`）；跨两列必须像模板这样写在全部列之后（表级约束）。
- `FOREIGN KEY (Sno) REFERENCES Student(Sno)`：读作"SC 的 Sno 取值，必须是 Student 表 Sno 列里**已经存在**的"。往 SC 插一个 Student 里没有的学号会被数据库直接拒绝——防止成绩册上出现"幽灵学生"。每列外键单独写一条，`REFERENCES` 后是"表名(列名)"。
- `CHECK (Grade BETWEEN 0 AND 100)`：表主人自己定的取值规则。INSERT、UPDATE 提交的数据要同时过主键、外键、CHECK 三道关，违反任何一道即报错拒收。

### 数据增、删、改与修改表结构

只会 `SELECT` 不够，题目若出现“新增一条记录、批量涨价、删除不及格记录、给旧表加列”，分别认下面四个模板：

```sql
-- INSERT：列名和值按位置一一对应
INSERT INTO Student(Sno, Sname, Dept)
VALUES ('20260001', '李明', '计算机');

-- UPDATE：一定先写 WHERE，防止误改整表
UPDATE SC
SET Grade = Grade + 5
WHERE Cno = 'C02' AND Grade < 60;

-- DELETE：删除满足条件的行，不删除表结构
DELETE FROM SC
WHERE Grade IS NULL;

-- ALTER：修改表结构，这里是给 Student 加一列
ALTER TABLE Student
ADD Email VARCHAR(50);
```

**四条模板没写进注释的细节**：

- **换行随意**：SQL 里换行和多个空格是同一类分隔符，四条语句写成一行还是多行都等价。只要求相邻的词之间至少隔一个空白，别把关键字或字符串常量从中间断开，每条语句以 `;` 结尾。分行只是给人看的排版习惯。
- **INSERT** 的值与列名表按位置一一对应：第 1 个值进第 1 列。没列出的列自动填 NULL（或默认值），但主键列 Sno 必须有值，否则违反实体完整性。
- **UPDATE** 的 SET 右边可以引用该列的旧值：`Grade = Grade + 5` 是"在原分数上加 5"，不是赋一个常数；多列同时改用逗号分隔。改出来的新值仍要通过主键、外键、CHECK 的检验。
- **ALTER** 改的是结构图纸，不动已有数据：加 Email 列后，所有老行的该列值为 NULL。`VARCHAR(50)` 是变长字符串，按实际内容占空间；`CHAR(8)` 是定长，不够补空格。长短不一的值（如邮箱）用 VARCHAR。

**反例演示（易错）**：`DELETE SC WHERE ...` 少了 `FROM`；`UPDATE SC SET Grade=0` 若忘写 WHERE，会把整张表全部改成 0；`DROP TABLE SC` 则连表结构和数据一起删除，绝不是“删除几行”。

**应试动作**：看到“记录/元组”想到 `INSERT、UPDATE、DELETE`；看到“列/表结构”想到 `ALTER`；看到“整个对象”才考虑 `DROP`。

### 视图与授权

```sql
CREATE VIEW 计算机系学生 AS
    SELECT Sno, Sname FROM Student WHERE Dept = '计算机';

GRANT SELECT, INSERT ON SC TO 用户1 WITH GRANT OPTION;  -- 授权（可转授）
REVOKE SELECT ON SC FROM 用户1;                          -- 收回权限
```

**视图的动机**：视图是一张**虚表**（只存定义不存数据），作用有二——① 简化常用查询；② **提供逻辑独立性/安全隔离**（用户只见视图字段，表结构改了只需改视图定义）。考题问"视图的作用/提高了什么独立性"→ 答**逻辑独立性**（视图是外模式级的东西，正好呼应第一节）。

建好视图后，它就当表来查：`SELECT Sno, Sname FROM 计算机系学生;`——数据库替你现场执行那段存档 SELECT。因为存的是定义不是数据快照，基表 Student 的数据一变，下次查视图的结果立刻跟着变。

**GRANT/REVOKE 的介词最容易混**，记口诀：**GRANT 用 TO 给出去、REVOKE 用 FROM 收回来**，被授权的对象永远跟在 `ON` 后面。`WITH GRANT OPTION` 表示被授权人可以再把权限转授给别人；不写这个短语就只能自用。

### 嵌套查询（选择题常考）

```sql
SELECT Sname FROM Student
WHERE Sno IN (SELECT Sno FROM SC WHERE Cno = 'C02');
```

IN 后面跟子查询结果集合；EXISTS 写法是"存在即保留"，选择题考"IN 与 EXISTS 等价改写"。

子查询两条规则：内层 SELECT 只能出**一列**（它是拿去做成员判断的集合）；`=` 右边只能接单个值，结果可能多行的子查询必须用 IN，不能写成 `WHERE Sno = (SELECT ...)`。反向判断用 `NOT IN`（如查没选 C02 的学生）。

把同一查询改写为 `EXISTS`：

```sql
SELECT S.Sname
FROM Student AS S
WHERE EXISTS (
    SELECT 1
    FROM SC
    WHERE SC.Sno = S.Sno
      AND SC.Cno = 'C02'
);
```

读法是：对外层每个学生 S，去 SC 表中寻找一行，使“学号等于当前学生学号且课程号为 C02”；只要找到一行，`EXISTS` 就为真，保留该学生。`SELECT 1` 中的 1 没有特殊数据含义，`EXISTS` 只关心“有没有行”，不关心子查询选出什么列。

**反例演示（易错）**：若漏掉关联条件 `SC.Sno = S.Sno`，只要全校有任何人选了 C02，子查询对每个学生都为真，最终会错误地返回全校学生。

**应试动作**：SELECT 骨架六个子句的**执行顺序**（FROM→WHERE→GROUP→HAVING→SELECT→ORDER）必须背熟，它是所有 SQL 题的做题导航。

