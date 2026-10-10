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

