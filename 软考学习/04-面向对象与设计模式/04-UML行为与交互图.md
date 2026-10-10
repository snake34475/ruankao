# 04.4 UML 行为图与交互图 ★★★

### 3.3 顺序图与通信图：同一次交互，两种画法 ★★

**顺序图要素**（从图上一眼能指出来）：**对象**（顶部方框）、**生命线**（对象下方的竖直虚线）、**激活/控制焦点**（生命线上叠的窄长条，表示对象正在执行）、**消息**（水平箭头）、**返回消息**（**虚线**箭头，表示把结果交回）。

**消息方向与种类**：

| 消息 | 画法 | 含义 |
|---|---|---|
| 同步消息 | **实线 + 实心箭头** | 发送者**等**对方处理完（普通方法调用） |
| 异步消息 | 实线 + 空心箭头 | 发送者**不等**（发完就走） |
| 返回消息 | **虚线 + 箭头** | 把结果回传给调用者 |

**一条最重要的判图规律**：**从左边第一个对象开始，箭头指向谁，就是谁在干活**；消息自左向右排序，**上下位置 = 时间先后**——所以案例题让你"按说明填消息"，就是**照典型事件流的步骤顺序往右下方排**。

**通信图（协作图）**：交互内容可以完全相同，画法却完全不同——对象**网状散布**，消息写在**对象之间的连线**上，用**序号**标调用层次。同一次"读者借书"，两种画法并排放（左图每一根横箭头，在右图都变成连线上的一个序号）：

<figure class="fig">
<svg viewBox="0 0 720 322" width="100%" style="max-width:720px" role="img" aria-label="顺序图与通信图对照：同一次借阅交互含四条消息。左侧顺序图顶部四个对象各带竖直生命线，消息从上到下依次为 1 借阅请求、1.1 核验资格、1.2 查库存、2 登记目录，借阅处理者生命线上有激活条；右侧通信图四个对象用连线相连，同样的四条消息写成连线上的序号。底部说明两者可互相转换">
<style>
.ob{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.6}
.ab{fill:var(--gold-soft);stroke:var(--gold);stroke-width:1.4}
.ll{stroke:var(--line-strong);stroke-width:1.2;fill:none;stroke-dasharray:4 4}
.mg{stroke:var(--ink);stroke-width:1.6;fill:none}
.rt{stroke:var(--muted);stroke-width:1.4;fill:none;stroke-dasharray:5 4}
.lk{stroke:var(--line-strong);stroke-width:1.6;fill:none}
.tx{font:11px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;fill:var(--ink-strong);text-anchor:middle}
.ms{font:10px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;fill:var(--ink);text-anchor:middle}
.tt{font:600 13px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;fill:var(--ink-strong)}
.mt{font:11px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;fill:var(--muted)}
</style>
<defs><marker id="im-a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--ink)"/></marker><marker id="im-r" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--muted)"/></marker><marker id="im-l" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--line-strong)"/></marker></defs>
<text class="tt" x="16" y="24">顺序图：上下 = 时间</text>
<rect class="ob" x="24" y="36" width="66" height="24" rx="5"/><text class="tx" x="57" y="52">读者</text>
<rect class="ob" x="108" y="36" width="72" height="24" rx="5"/><text class="tx" x="144" y="52">借阅处理者</text>
<rect class="ob" x="192" y="36" width="66" height="24" rx="5"/><text class="tx" x="225" y="52">图书</text>
<rect class="ob" x="276" y="36" width="66" height="24" rx="5"/><text class="tx" x="309" y="52">目录</text>
<path class="ll" d="M57 60 V268 M144 60 V268 M225 60 V268 M309 60 V268"/>
<rect class="ab" x="140" y="80" width="9" height="170"/>
<rect class="ab" x="221" y="170" width="8" height="30"/>
<rect class="ab" x="305" y="230" width="8" height="22"/>
<path class="mg" d="M57 92 H136" marker-end="url(#im-a)"/><text class="ms" x="97" y="86">1: 借阅请求()</text>
<path class="mg" d="M140 120 H61" marker-end="url(#im-a)"/><text class="ms" x="100" y="114">1.1: 核验资格()</text>
<path class="rt" d="M61 146 H140" marker-end="url(#im-r)"/><text class="ms" x="100" y="140">合格</text>
<path class="mg" d="M149 176 H221" marker-end="url(#im-a)"/><text class="ms" x="185" y="170">1.2: 查库存()</text>
<path class="rt" d="M221 200 H149" marker-end="url(#im-r)"/><text class="ms" x="185" y="214">有可借</text>
<path class="mg" d="M149 236 H305" marker-end="url(#im-a)"/><text class="ms" x="227" y="230">2: 登记目录()</text>
<text class="mt" x="16" y="286">金色窄条 = 激活：谁在干活看窄条压在谁的生命线上</text>
<text class="tt" x="400" y="24">通信图：连线 + 序号</text>
<rect class="ob" x="428" y="64" width="84" height="26" rx="5"/><text class="tx" x="470" y="81">读者</text>
<rect class="ob" x="576" y="64" width="90" height="26" rx="5"/><text class="tx" x="621" y="81">借阅处理者</text>
<rect class="ob" x="576" y="186" width="84" height="26" rx="5"/><text class="tx" x="618" y="203">图书</text>
<rect class="ob" x="428" y="186" width="84" height="26" rx="5"/><text class="tx" x="470" y="203">目录</text>
<path class="lk" d="M512 72 H572" marker-end="url(#im-l)"/><text class="ms" x="542" y="64">1: 借阅请求</text>
<path class="lk" d="M576 84 H516" marker-end="url(#im-l)"/><text class="ms" x="546" y="102">1.1: 核验资格</text>
<path class="lk" d="M618 90 V182" marker-end="url(#im-l)"/><text class="ms" x="660" y="140" style="text-anchor:start">1.2: 查库存</text>
<path class="lk" d="M596 90 L512 196" marker-end="url(#im-l)"/><text class="ms" x="520" y="150" style="text-anchor:end">2: 登记目录</text>
<text class="mt" x="400" y="248">没有上下轴：先后与嵌套全看序号——</text>
<text class="mt" x="400" y="266">1 → 1.1 → 1.2 是"1 号调用内部的两步"，2 才是第二个顶层调用</text>
<text class="mt" x="16" y="300">互转规律：生命线 ↔ 对象节点；从上到下 ↔ 序号从小到大；嵌套调用点"点号"（1.1.2 比 1.1 更深一层）。</text>
<text class="mt" x="16" y="318">口诀：顺序看时间，通信看链接；带点的序号就是嵌套层。</text>
</svg>
<figcaption>案例题要求"由顺序图画通信图"时，把每条横箭头按出现顺序编号、两端对象连线即可；反之把序号展开成上下排列的箭头。两图语义等价，只换视角。</figcaption>
</figure>

序号里的点表示**嵌套层级**（`1.1` 是 `1` 内部调用的第一句，`1.1.2` 再深一层）。**顺序图 vs 通信图对照**：两者**语义等价、可以互相转换**；顺序图突出**时间顺序**，通信图突出**对象间的链接结构与调用层次**。

**反例演示（易错）**：判断"哪张是顺序图"不要只看有没有箭头——**定音锤是"有没有生命线（竖直虚线）"**：有竖直生命线、消息横着排的是顺序图；对象用连线连成网状、序号写在线上的是通信图。

### 3.4 活动图：流程 + 并发 + 泳道

**要素**：初始节点（**实心圆**）、结束节点（**带圈的实心圆**）、**动作/活动**（圆角矩形）、**分支与监护表达式**（菱形 + `[条件]`）、**分叉与汇合**（**粗横线**，表示并发）、**泳道**（按责任人划分的纵向区域）。

```
        ●                ← 初始节点
        │
   ┌────▼────┐
   │ 接收订单 │            ← 动作
   └────┬────┘
   ═════╪═════             ← 分叉（粗横线）：下面两条并发
   │         │
┌──▼──┐  ┌──▼──┐
│填订单│  │开发票│          两条同时进行
└──┬──┘  └──┬──┘
   ═════╪═════             ← 汇合（粗横线）：都做完才往下
        │
   ┌────▼────┐
   │  ◇ [未完成] │           ← 分支（菱形）+ 监护表达式
   └────┬────┘
        ▼
        ◉                ← 结束节点
```

**与流程图的区别**（选择题常问）：活动图**支持并发**（分叉/汇合），流程图只有顺序和分支；活动图还能用**泳道**表达"谁负责哪一段"。

**反例演示（易错）**：**分叉（fork）和分支（decision）都画两条出路，但含义相反**——**分支**是"**二选一**，只走一条"（菱形，路上标条件）；**分叉**是"**两条都要走，并发执行**"（粗横线）。看符号不看箭头数量：**菱形 = 选一条，粗横线 = 全走并同时走**。

<figure class="fig">
<svg viewBox="0 0 760 365" width="100%" style="max-width:760px" role="img" aria-label="订单处理活动图，分为顾客和系统两个泳道。顾客提交订单后，系统校验订单；校验通过时，系统分叉并发执行生成发票和安排配送，二者汇合后发送确认；校验不通过时发送拒绝提示。图中菱形是二选一的分支，粗横线是两项都执行的分叉与汇合。">
<style>.lane{fill:var(--surface-2);stroke:var(--line);stroke-width:1.5}.act{fill:var(--accent-soft);stroke:var(--accent);stroke-width:2}.e{stroke:var(--ink);stroke-width:2;fill:none}.t{fill:var(--ink-strong);font:14px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}.s{fill:var(--muted);font:12px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}.h{fill:var(--ink-strong);font:bold 15px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}</style>
<defs><marker id="act-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="var(--ink)"/></marker></defs>
<rect x="35" y="30" width="220" height="305" class="lane"/><rect x="255" y="30" width="470" height="305" class="lane"/><text x="117" y="54" class="h">顾客泳道</text><text x="454" y="54" class="h">系统泳道</text>
<circle cx="145" cy="84" r="8" fill="var(--ink)"/><path d="M145 92V115" class="e" marker-end="url(#act-arrow)"/><rect x="90" y="116" width="110" height="38" rx="18" class="act"/><text x="111" y="140" class="t">提交订单</text><path d="M200 135H328" class="e" marker-end="url(#act-arrow)"/>
<rect x="329" y="116" width="110" height="38" rx="18" class="act"/><text x="350" y="140" class="t">校验订单</text><path d="M384 154V173" class="e" marker-end="url(#act-arrow)"/><path d="M384 174l18 18 -18 18 -18 -18z" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/><text x="408" y="196" class="s">[通过]</text><text x="313" y="222" class="s">[不通过]</text>
<path d="M402 192H520V220" class="e" marker-end="url(#act-arrow)"/><path d="M366 192H350V255" class="e" marker-end="url(#act-arrow)"/><rect x="295" y="256" width="110" height="38" rx="18" class="act"/><text x="309" y="280" class="t">发送拒绝提示</text><path d="M350 294V331" class="e" marker-end="url(#act-arrow)"/><circle cx="350" cy="343" r="10" fill="var(--surface)" stroke="var(--ink)" stroke-width="3"/><circle cx="350" cy="343" r="5" fill="var(--ink)"/>
<path d="M520 220V232" class="e" marker-end="url(#act-arrow)"/><path d="M480 234H700" stroke="var(--ink)" stroke-width="7"/><path d="M520 237V255" class="e" marker-end="url(#act-arrow)"/><path d="M640 237V255" class="e" marker-end="url(#act-arrow)"/><rect x="465" y="256" width="110" height="38" rx="18" class="act"/><text x="483" y="280" class="t">生成发票</text><rect x="585" y="256" width="110" height="38" rx="18" class="act"/><text x="603" y="280" class="t">安排配送</text>
<path d="M520 294V310" class="e" marker-end="url(#act-arrow)"/><path d="M640 294V310" class="e" marker-end="url(#act-arrow)"/><path d="M480 313H700" stroke="var(--ink)" stroke-width="7"/><path d="M590 317V331" class="e" marker-end="url(#act-arrow)"/><circle cx="590" cy="343" r="10" fill="var(--surface)" stroke="var(--ink)" stroke-width="3"/><circle cx="590" cy="343" r="5" fill="var(--ink)"/>
</svg>
<figcaption>菱形后的两条路径只能选一条；粗横线后的两条路径都要完成，才能在下一条粗横线汇合。</figcaption>
</figure>

### 3.5 状态图：五要素 + 四类事件 + 组合状态 ★★

状态图是"**单个对象的生命史**"：它在这辈子经历过哪些状态、因为什么事件而切换。**五要素必须背齐**：

| 要素 | 是什么 | 画法/写法 |
|---|---|---|
| **状态** | 对象所处的情形 | 圆角矩形，写状态名（空闲/占线/已锁定） |
| **事件** | 触发状态迁移的事情 | 转换线**上方**写事件名 |
| **监护条件** | 事件发生还不够，还要满足的条件 | 方括号写在事件后：`turnOn[有水]` |
| **动作** | 迁移时执行的一句话 | 斜线后写：`turnOn[有水]/烧水` |
| **转换（转移）** | 状态之间的那条箭头 | 箭头从源状态指向目标状态 |

**一条完整转换的读法**（把上面四样串起来）：

```
  空闲 ──── turnOn[有水]/烧水 ────▶ 加热中
  ↑源状态      ↑事件 ↑监护条件 ↑动作        ↑目标状态
```

**结构规律（选择题原话）**：一个状态图**只能有一个初态**（实心圆），但**可以有一个或多个终态**（带圈实心圆），**也可以没有终态**（比如一个永远循环的系统）。

**四类事件（问"下面属于哪种事件"）**：

| 事件类型 | 含义 | 例子 |
|---|---|---|
| **信号事件** | 对象之间**发送/接收信号**实现通信 | 鼠标点击、外部中断 |
| **调用事件** | 一个对象**请求调用**另一个对象的操作 | 方法调用 |
| **变换事件** | **when + 布尔表达式**，条件由假变真即触发 | `when(温度>100)` |
| **时间事件** | 到达某时刻或经过某段时间，用 **when / after** | `after(5秒)`、`when(日期=10月24日)` |

**状态内部的五个组成部分**（了解即可）：状态名、**entry/exit 动作**（进入/退出该状态要做的事）、**内部转移**（`event/action`，不跳出本状态）、**子状态**、**延迟事件**（`defer`，事件先记下、等以后处理）。

```
   ┌──────────── Flashlight ────────────┐
   │ entry/开灯      do/闪烁五次         │   ← 进入即开灯、在状态内持续闪烁
   │ exit/关灯       selfTest/defer      │   ← 退出即关灯；selfTest 事件先延迟
   └────────────────────────────────────┘
```

**组合状态**：一个状态内部还装着子状态，分两种，**这是易混点**：

- **顺序子状态**：子状态之间**互斥**（同一时刻只能在一个），要**全部完成**整体才算完成（像是"一串流程分几步"）；
- **并发子状态**：某时刻**可以同时达到多个**子状态，内部**并发进行**。

**反例演示（易错）**：题干说"进入该状态后，可以同时进行 A、B 两件事"→ **并发子状态**；说"先做 A、做完再做 B，两步都完成状态才结束"→ **顺序子状态**。判别只看一个字：**"同时"还是"先后"**。

<figure class="fig">
<svg viewBox="0 0 760 265" width="100%" style="max-width:760px" role="img" aria-label="订单状态图。初态进入待支付；支付成功且库存充足时转到待发货，动作是扣库存；支付超时转到已取消，动作是释放库存；待发货经发货事件转到运输中，再经签收事件转到已完成终态。每条转移均标明事件、可选监护条件和动作。">
<style>.st{fill:var(--accent-soft);stroke:var(--accent);stroke-width:2}.e{stroke:var(--ink);stroke-width:2;fill:none}.t{fill:var(--ink-strong);font:14px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}.s{fill:var(--muted);font:12px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}.h{fill:var(--ink-strong);font:bold 15px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}</style>
<defs><marker id="state-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="var(--ink)"/></marker></defs>
<text x="250" y="26" class="h">事件 [监护条件] / 动作 写在状态转换箭头上</text><circle cx="54" cy="127" r="8" fill="var(--ink)"/><path d="M62 127H114" class="e" marker-end="url(#state-arrow)"/>
<rect x="115" y="101" width="100" height="52" rx="14" class="st"/><text x="145" y="132" class="t">待支付</text><path d="M215 118H316" class="e" marker-end="url(#state-arrow)"/><text x="224" y="101" class="s">支付成功[库存足]/扣库存</text>
<rect x="317" y="101" width="100" height="52" rx="14" class="st"/><text x="347" y="132" class="t">待发货</text><path d="M417 127H500" class="e" marker-end="url(#state-arrow)"/><text x="434" y="114" class="s">发货</text>
<rect x="501" y="101" width="100" height="52" rx="14" class="st"/><text x="531" y="132" class="t">运输中</text><path d="M601 127H678" class="e" marker-end="url(#state-arrow)"/><text x="620" y="114" class="s">签收</text><circle cx="697" cy="127" r="12" fill="var(--surface)" stroke="var(--ink)" stroke-width="3"/><circle cx="697" cy="127" r="6" fill="var(--ink)"/>
<path d="M165 153V205H288" class="e" marker-end="url(#state-arrow)"/><text x="175" y="198" class="s">支付超时 / 释放库存</text><rect x="289" y="180" width="100" height="52" rx="14" class="st"/><text x="319" y="211" class="t">已取消</text><path d="M389 206H450" class="e" marker-end="url(#state-arrow)"/><circle cx="469" cy="206" r="12" fill="var(--surface)" stroke="var(--ink)" stroke-width="3"/><circle cx="469" cy="206" r="6" fill="var(--ink)"/>
<text x="115" y="254" class="s">状态图描述一个订单对象的状态变化；业务流程的并发责任划分应使用活动图。</text>
</svg>
<figcaption>读状态图时先沿箭头读“源状态—触发事件—条件/动作—目标状态”，不要把状态名与业务步骤混为一谈。</figcaption>
</figure>

### 3.6 构件图：一眼认出供接口和需接口 ★

构件图（组件图）专注于**静态实现视图**——把系统拆成可替换的软件构件，画清它们之间谁依赖谁。

**构件符号**：矩形 + 左上角画两个小矩形凸起（像插头），框内写 `<<component>>`。

**接口的画法（高频识别题，必须记住）**：

| 接口 | 符号 | 记忆法 |
|---|---|---|
| **供接口**（provided，我对外提供的服务） | **整圆**（画成一个完整的圆圈） | 我**给出去**的是完整的；圆是**满**的 |
| **需接口**（required，我需要别人提供的服务） | **半圆**（缺了一块的半圆弧） | 我**要往里接**的是缺口；半圆是**缺**的 |

**口诀**：**整圆供、半圆需**（或"**满的给别人、缺的找别人要**"）。

**反例演示（易错）**：依赖箭头从**需接口**指向**供接口**（谁需要谁 → 指向被依赖方），别画反——画反了会变成"提供方依赖使用方"，逻辑颠倒。构件之间的虚线箭头表示**依赖关系**（一个构件的实现离不开另一个）。

### 3.7 部署图：节点是立体长方体

部署图给的是**体系结构的静态实施视图**——软件构件**跑在哪些物理节点上**。

**要素**：

| 要素 | 画法 |
|---|---|
| **节点**（node） | **立体长方体**（3D 立方体），表示硬件设备/运行环境，如应用服务器、数据库服务器、PC、手机 |
| **构件** | 节点框内放构件符号（表示这台机器上部署了什么） |
| **连接** | 节点之间的实线，可标协议（`TCP/IP`）或构造型（`<<Database>>`、`<<Storage>>`） |

**识别特征**：图上一旦出现**立体长方体（有厚度、有顶面和侧面）**，就是部署图——这是它和构件图最容易区分的地方（构件图是平的、带两个小凸起；部署图是立体的）。

### 3.8 UML 全图小结与应试动作

**"给场景选图"速判表**（案例题和选择题都用得上）：

| 题目在说什么 | 该用哪张图 |
|---|---|
| 系统有哪些功能、谁能用 | **用例图** |
| 类的属性、操作、类间关系 | **类图** |
| 某一时刻的对象快照 | **对象图** |
| 按时间顺序的对象交互 | **顺序图** |
| 强调对象链接结构与调用层次的交互 | **通信图** |
| **单个对象**因事件而状态变迁 | **状态图** |
| 业务流程步骤、有并发/责任人划分 | **活动图** |
| 软件拆成哪些可替换构件、接口供需 | **构件图** |
| 软件跑在哪些硬件节点上 | **部署图** |
| 类如何分组打包、包间依赖 | **包图** |

**应试动作**：
1. **背分类**：结构图 6 种、行为图 7 种（至少记住高频 10 种的归属）；
2. **认符号**：三角 = 泛化/实现（虚线是接口实现）、菱形 = 整体部分（空心聚合 / 实心组合）、虚线 = 弱关系（依赖最弱）、**整圆供/半圆需**、**立体长方体 = 部署节点**、**下划线 = 对象**；
3. **判用例关系**：必经 include（主干指出）、可选 extend（分支指回）；
4. **状态图五要素**与**四类事件**要能默写（简答题和填空都可能要）。
