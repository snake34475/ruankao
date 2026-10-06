# 04.3 UML 结构图：类图、对象图与用例图 ★★★

### 3.0 先建全景：UML 2.x 共 13 种图，按"静态/动态"一刀切开

UML 2.x 共定义 **13 种图**，按"静态/动态"一刀切开（其中最常见的 10 种必须全认，末尾三种低频，**认名字即可**）：

| 类别 | 图 | 一句话用途 | 认图特征 |
|---|---|---|---|
| **静态（结构图）** | 类图 | 一组对象、接口、协作及其关系 | 矩形分三格：类名/属性/操作 |
| | 对象图 | 某一时刻的对象快照 | 名字带**下划线** |
| | 构件图（组件图） | 一组构件之间的组织和依赖（静态**实现**视图） | 构件符号（带两个小凸起）+ 供/需接口 |
| | 部署图 | 运行处理**节点**及构件的配置（静态**实施**视图） | **立体长方体**（节点） |
| | 包图 | 类/图如何组织成包及包间依赖 | 文件夹形状 |
| | 组合结构图 | 分解类、构件或用例的**内部结构** | 大框套小框、内部部件 |
| **动态（行为图）** | 用例图 | 用例、参与者及其关系 | 小人（参与者）+ 椭圆（用例） |
| | 顺序图（序列图） | 以**时间顺序**组织的对象间交互 | 竖直生命线 + 水平消息箭头 |
| | 通信图（协作图） | 强调收发消息的对象的**组织结构** | 对象间连线标消息序号 |
| | 状态图 | 一个**状态机**：状态、转换、事件、活动 | 圆角矩形（状态）+ 箭头（转换） |
| | 活动图 | 一个活动到另一个活动的**流程** | 泳道、分叉/汇合粗横线 |
| | 交互概览图 | 组合顺序图与活动图的特征，显示对象如何交互 | 像活动图但节点是交互引用 |
| | 定时图 | 关注对象改变状态时的**时间约束** | 时间刻度、状态阶梯 |

**记忆抓手**：结构图 6 种 = **类、对象、构件、部署、包、组合结构**；行为图 7 种 = **用例、顺序、通信、状态、活动、交互概览、定时**。其中真正高频的是 **10 种（静态五 + 动态五）**——类图、对象图、构件图、部署图、包图、用例图、顺序图、通信图、状态图、活动图。多出的三种（组合结构图、交互概览图、定时图）只会在"UML 图不包括下列哪种"这类题里当干扰项出现。

**反例演示（易错）**：状态图和活动图长得像，区别在——状态图描述**一个对象**因事件引起的状态变迁，必须以"事件"为转换条件；活动图描述**业务流程**步骤，支持并发分支（分叉/汇合），不关心某个对象。另外顺序图 vs 通信图：**内容等价、侧重不同**——顺序图突出时间顺序，通信图突出对象间链接结构，两者可以互相转换（案例题常要求"画出通信图"）。

### 3.1 类图与对象图：三格 + 可见性 + 多重性

**类图的矩形三格**（从上到下）：

```
┌──────────────────────┐
│      类名 Book       │  ← 第 1 格：类名（抽象类用斜体）
├──────────────────────┤
│ - 书号  : String     │  ← 第 2 格：属性    - 私有  + 公有  # 保护
│ - 定价  : double     │
├──────────────────────┤
│ + 借出() : boolean   │  ← 第 3 格：操作（方法）  括号不能省
│ + 计算应还日() : Date│
└──────────────────────┘
```

**可见性符号**（选择题直接问 `-` 是什么意思）：`+` 公有 public、`-` 私有 private、`#` 保护 protected。考场上看到属性前全是一串减号，说明是**私有属性**（这正是封装）。

**多重性（读书数字）vs 基数**：题目常给你一句业务的自然语言，要你翻成符号。**翻法**是"**在每一端，问自己：一个对面对象能对应几个我**"：

| 符号 | 读作 | 业务原话的样子 |
|---|---|---|
| `1` | 恰好一个 | "每本书只属于一个书架" |
| `0..1` | 零个或一个 | "读者可能有一条"欠款记录"，也可能没有" |
| `1..*` | 一个或多个（**至少一个**） | "一名读者至少有一条借阅记录" |
| `0..*` 或 `*` | 零个或多个（**可以没有**） | "一个书架可以没有任何图书" |

**反例演示（易错）**：`1..*` 与 `0..*` 只差一个数字，含义却相反。判断口诀——**看"至少"这个词**：题干出现"至少有/必须有"→ 端点写 `1..*`；出现"可以没有/可能没有/不一定有"→ 写 `0..*`。这里最容易把手写答案画反，因为**同一句话的两端各有一个多重性**：如"读者可借多本书"，在**图书端**要写的不是"多"而是"1"（一本书只被一条借阅记录指向一个读者），在**读者端**才写 `0..*`。**逐端问、别照抄句子**。

**对象图**：类图是"模板"，对象图是"**某一时刻的快照**"。识别特征就是**名字带下划线、冒号前是对象名、冒号后是类名**，写成 `:图书` 或 `b1 : 图书`。

<figure class="fig">
<svg viewBox="0 0 760 300" width="100%" style="max-width:760px" role="img" aria-label="图书借阅类图。读者、借阅记录和图书都是三格类。一个读者可对应零到多条借阅记录，但每条借阅记录恰好属于一个读者；一本图书也可对应零到多条借阅记录，但每条借阅记录恰好关联一本图书。">
<style>.c{fill:var(--surface-2);stroke:var(--line-strong);stroke-width:2}.head{fill:var(--accent-soft);stroke:var(--accent);stroke-width:2}.e{stroke:var(--ink);stroke-width:2}.t{fill:var(--ink-strong);font:14px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}.s{fill:var(--muted);font:12px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}.h{fill:var(--ink-strong);font:bold 15px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}</style>
<text x="280" y="25" class="h">借阅关系：多重性写在“对面对象的数量”一端</text>
<rect x="42" y="90" width="180" height="136" class="c"/><rect x="42" y="90" width="180" height="38" class="head"/><line x1="42" y1="175" x2="222" y2="175" stroke="var(--line)"/><text x="111" y="115" class="h">读者</text><text x="55" y="151" class="t">- 读者号 : String</text><text x="55" y="169" class="t">- 姓名 : String</text><text x="55" y="202" class="t">+ 借阅() : boolean</text>
<rect x="290" y="90" width="180" height="136" class="c"/><rect x="290" y="90" width="180" height="38" class="head"/><line x1="290" y1="175" x2="470" y2="175" stroke="var(--line)"/><text x="345" y="115" class="h">借阅记录</text><text x="303" y="151" class="t">- 借出日 : Date</text><text x="303" y="169" class="t">- 应还日 : Date</text><text x="303" y="202" class="t">+ 归还()</text>
<rect x="538" y="90" width="180" height="136" class="c"/><rect x="538" y="90" width="180" height="38" class="head"/><line x1="538" y1="175" x2="718" y2="175" stroke="var(--line)"/><text x="609" y="115" class="h">图书</text><text x="551" y="151" class="t">- 书号 : String</text><text x="551" y="169" class="t">- 书名 : String</text><text x="551" y="202" class="t">+ 是否可借() : boolean</text>
<path d="M222 158H290" class="e"/><text x="230" y="148" class="t">1</text><text x="257" y="148" class="t">0..*</text><text x="238" y="187" class="s">拥有</text>
<path d="M470 158H538" class="e"/><text x="478" y="148" class="t">0..*</text><text x="519" y="148" class="t">1</text><text x="486" y="187" class="s">对应</text>
<text x="65" y="267" class="s">读法示例：每条借阅记录关联 1 位读者；1 位读者可以没有记录，也可以有多条记录。</text>
</svg>
<figcaption>类图既要看三格，也要逐端读多重性；不能把自然语言里的“多”原样抄到两端。</figcaption>
</figure>

### 3.2 用例图：三个要素 + 三种关系 + 建模流程四步 ★★

**要素**：**参与者**（小人，缩写可以是人、外部系统）、**用例**（椭圆，一件完整的、有业务价值的事）、**关系**（连线）。

**三种关系**（选择题 + 案例题双考）：

| 关系 | 符号 | 判据 | 例 |
|---|---|---|---|
| **包含** `<<include>>` | 虚线箭头 + 构造型，**基用例 → 被包含用例** | **必经**、可被多个用例共用的公共行为 | 借书**必须先**登录；借书/还书/查询**都要**检查权限 |
| **扩展** `<<extend>>` | 虚线箭头 + 构造型，**扩展用例 → 基用例** | **可选**、条件触发、是基用例的分支场景 | 超额时**才**弹逾期提示；勾选定时发布**才**执行 |
| **泛化** | 空心三角实线，**子用例 → 父用例** | 多个用例有**共同的类似结构和行为**，抽出父用例 | 网上注册/电话注册 → 泛化到"课程注册" |

**方向易错**：include 是**基用例指出去**（借书 → 登录）；extend 是**扩展用例指回来**（拒绝提示 → 借书）。口诀：**include 从主干指出，extend 从分支指回**；判断只用一句话——**"没有它这事就干不成"是 include，"有它也行没它也行"是 extend**。

**用例建模流程（四步，其中前三步必须、第四步可选）**：

1. **识别参与者**（必须）—— 谁使用系统、系统服务谁；
2. **合并需求获得用例**（必须）—— 把每个参与者要做的事收成用例；
3. **细化用例描述**（必须）—— 写"典型事件流 + 备选事件流"；
4. **调整用例模型**（可选）—— 抽 include/extend/泛化，简化模型。

**案例题怎么用这四步**：真题给的"用例详细描述"就是第 3 步的产物，**结构固定为——参与者 / 典型事件流（正常步骤 1、2、3…）/ 备选事件流（2a、4a 这类"异常分支"）**。读题时把**典型事件流的步骤**当主线索（对应顺序图的消息顺序），把**编号带字母的备选事件流**当 **extend 的来源**（如"4a 读者要借的书无法外借"→ 扩展用例）。

**反例演示（易错）**："参与者"里可以有**外部系统**（如"支付网关""短信平台"），不一定是人；反过来，"系统内部的某个模块"**不能**当参与者——参与者必须**在系统边界之外**。这是选择题的常见陷阱：给你"数据库""登录模块"当选项，它们都是系统内部的东西，不是参与者。

<figure class="fig">
<svg viewBox="0 0 760 315" width="100%" style="max-width:760px" role="img" aria-label="图书馆用例图。系统边界内有借书、登录、查询图书和逾期提示四个用例；读者是边界外参与者。借书和查询图书都通过 include 指向登录，表示登录是必经的共用行为；逾期提示通过 extend 指向借书，表示只有逾期条件满足时才出现的可选分支。">
<style>.bound{fill:none;stroke:var(--line-strong);stroke-width:2}.uc{fill:var(--accent-soft);stroke:var(--accent);stroke-width:2}.e{stroke:var(--ink);stroke-width:2;fill:none}.d{stroke:var(--ink);stroke-width:2;fill:none;stroke-dasharray:7 5}.t{fill:var(--ink-strong);font:14px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}.s{fill:var(--muted);font:12px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}.h{fill:var(--ink-strong);font:bold 15px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}</style>
<defs><marker id="uml-open" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="none" stroke="var(--ink)" stroke-width="1.5"/></marker></defs>
<rect x="206" y="28" width="505" height="250" rx="8" class="bound"/><text x="226" y="54" class="h">图书馆系统</text>
<circle cx="83" cy="91" r="13" class="e"/><path d="M83 104V154M58 120H108M83 154L58 187M83 154L108 187" class="e"/><text x="62" y="210" class="t">读者</text>
<ellipse cx="360" cy="112" rx="66" ry="28" class="uc"/><text x="339" y="117" class="t">借书</text><ellipse cx="555" cy="112" rx="66" ry="28" class="uc"/><text x="519" y="117" class="t">登录</text><ellipse cx="360" cy="207" rx="66" ry="28" class="uc"/><text x="318" y="212" class="t">查询图书</text><ellipse cx="555" cy="207" rx="66" ry="28" class="uc"/><text x="520" y="212" class="t">逾期提示</text>
<path d="M108 128H293" class="e"/><path d="M108 158L293 201" class="e"/>
<path d="M426 112H488" class="d" marker-end="url(#uml-open)"/><text x="431" y="100" class="s">include（必经）</text>
<path d="M426 207L507 130" class="d" marker-end="url(#uml-open)"/><text x="427" y="188" class="s">include（必经）</text>
<path d="M498 186Q458 162 421 132" class="d" marker-end="url(#uml-open)"/><text x="452" y="157" class="s">extend [逾期]</text>
<text x="223" y="301" class="s">方向口诀：主干指向被包含用例；可选分支指回基用例。</text>
</svg>
<figcaption>用例图先划系统边界：读者在边界外；`include` 与 `extend` 的箭头方向相反。</figcaption>
</figure>
