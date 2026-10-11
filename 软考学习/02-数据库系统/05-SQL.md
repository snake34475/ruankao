# 02.5 SQL ★★★

SQL 分四类语句，案例题主要考前两类：

| 类别 | 关键词 | 用途 |
|---|---|---|
| DDL 数据定义 | CREATE / ALTER / DROP | 建表、建视图、改结构 |
| DML 数据操纵 | SELECT / INSERT / UPDATE / DELETE | 查和改数据 |
| DCL 数据控制 | GRANT / REVOKE | 授权、收权（选择题常考） |
| TCL 事务控制 | COMMIT / ROLLBACK | 提交事务、回滚事务 |

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

聚合函数只能出现在 `SELECT`（产出这列）、`HAVING`（筛组）、`ORDER BY`（排序）三处，**写进 `WHERE` 必报错**。另有一条高频规则：SELECT 里的普通列（不在聚合函数包裹下的）**必须全部出现在 GROUP BY 里**，否则报错——案例题检查自己写的答案时先看这条。

**AS（别名）两个用途**：`AVG(Grade) AS 均分` 给结果列起名，`ORDER BY` 可以引用这个别名，但 `WHERE` 不行（它比 SELECT 先执行）；`FROM Student AS S` 给表起名，列写成 `S.Sno`，自连接题里必用。

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

**应试动作**：看到"范围／之内"想 `BETWEEN`；"在给定几个里"想 `IN`；"姓李／以 XX 开头／包含"想 `LIKE`；"没有成绩／缺"想 `IS NULL`；"每个／各"想 `GROUP BY`＋聚合函数；条件里出现聚合函数，必写 `HAVING`。

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

### 嵌套查询（选择题常考）

```sql
SELECT Sname FROM Student
WHERE Sno IN (SELECT Sno FROM SC WHERE Cno = 'C02');
```

IN 后面跟子查询结果集合；EXISTS 写法是"存在即保留"，选择题考"IN 与 EXISTS 等价改写"。

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

