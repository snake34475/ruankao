# 09.2 CPU、存储体系与主存编址 ★★★

CPU 主要由**运算器、控制器、寄存器组和内部总线**组成。

| 部件 | 作用 | 关键词 |
|---|---|---|
| ALU（算术逻辑单元） | 做算术与逻辑运算 | 真正“算” |
| AC（累加寄存器） | 暂存操作数和运算结果 | ALU 工作区 |
| DR/MDR（数据缓冲寄存器） | 暂存从主存读出或要写入主存的数据 | 数据中转站 |
| PSW（程序状态字） | 保存零、进位、溢出、中断允许等状态 | 状态标志 |
| PC（程序计数器） | 保存**下一条**要取的指令地址 | 下一条在哪 |
| IR（指令寄存器） | 保存**当前正在执行**的指令 | 当前是什么 |
| MAR/AR（地址寄存器） | 保存当前访问的主存地址 | 去哪里读写 |
| 指令译码器 | 解释操作码 | 要做什么 |
| 时序部件 | 发出有先后次序的控制信号 | 什么时候做 |

指令周期通常经历：**取指 → 分析/译码 → 执行**。冯·诺依曼机的指令和数据都以二进制存入同一存储器，CPU 不是靠“长相”区分它们，而是靠**所处的指令周期阶段**：取指阶段读到的是指令，执行阶段按指令要求读到的是数据。

**反例**：“PC 保存当前指令”是错的。当前指令在 IR，PC 通常已经指向下一条指令。“地址寄存器保存数据”也错，MAR 保存地址，MDR 保存数据。

把上面这张"部件表"连成电影——指令 `2000H: 取 2100H 处的数到 R1` 的完整旅程，每一步都点名"哪个部件经了手"（表里的寄存器全在这张图上上岗一次）：

<figure class="fig">
<svg viewBox="0 0 720 268" width="100%" style="max-width:720px" role="img" aria-label="一条指令的旅程接力图，分三个阶段：取指阶段 PC 把地址 2000H 交给 MAR，读主存得指令进 MDR 再送 IR，PC 加一指向下一条；译码阶段 IR 的操作码交指令译码器产生控制信号；执行阶段 IR 的地址字段 2100H 交给 MAR，读主存得数据经 MDR 放入寄存器 R1。同一块主存两次被访问，取的分别是指令和数据">
<style>
.cu{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5}
.cd{fill:var(--gold-soft);stroke:var(--gold);stroke-width:1.5}
.cc{fill:var(--surface);stroke:var(--line-strong);stroke-width:1.5}
.e{stroke:var(--ink);stroke-width:1.6;fill:none}
.tx{font:11px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;fill:var(--ink-strong);text-anchor:middle}
.st{font:10px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;fill:var(--red);text-anchor:middle}
.tt{font:600 13px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;fill:var(--ink-strong)}
.mt{font:11px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;fill:var(--muted)}
</style>
<defs><marker id="tp-a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--ink)"/></marker></defs>
<text class="tt" x="14" y="20">一条指令的旅程：取 2000H 处的指令（内容：把 2100H 的数取到 R1）</text>
<text class="mt" x="14" y="60">取指阶段</text>
<rect class="cu" x="88" y="44" width="88" height="26" rx="5"/><text class="tx" x="132" y="61">PC＝2000H</text>
<rect class="cu" x="206" y="44" width="88" height="26" rx="5"/><text class="tx" x="250" y="61">MAR＝2000H</text>
<rect class="cc" x="324" y="44" width="92" height="26" rx="5"/><text class="tx" x="370" y="61">主存 2000H</text>
<rect class="cu" x="446" y="44" width="96" height="26" rx="5"/><text class="tx" x="494" y="61">MDR＝指令字</text>
<rect class="cu" x="572" y="44" width="56" height="26" rx="5"/><text class="tx" x="600" y="61">IR</text>
<path class="e" d="M176 57 H202" marker-end="url(#tp-a)"/><text class="st" x="189" y="38">①送地址</text>
<path class="e" d="M294 57 H320" marker-end="url(#tp-a)"/><text class="st" x="307" y="38">②读</text>
<path class="e" d="M416 57 H442" marker-end="url(#tp-a)"/><text class="st" x="429" y="38">③</text>
<path class="e" d="M542 57 H568" marker-end="url(#tp-a)"/><text class="st" x="555" y="38">④入IR</text>
<text class="mt" x="88" y="88">⑤同时 PC←2001H：开始盯着"下一条"，它从不存当前指令</text>
<text class="mt" x="14" y="126">译码阶段</text>
<rect class="cd" x="88" y="110" width="56" height="26" rx="5"/><text class="tx" x="116" y="127">IR</text>
<rect class="cd" x="174" y="110" width="100" height="26" rx="5"/><text class="tx" x="224" y="127">指令译码器</text>
<rect class="cd" x="304" y="110" width="120" height="26" rx="5"/><text class="tx" x="364" y="127">时序·控制信号</text>
<path class="e" d="M144 123 H170" marker-end="url(#tp-a)"/><text class="st" x="157" y="104">⑥操作码</text>
<path class="e" d="M274 123 H300" marker-end="url(#tp-a)"/><text class="st" x="287" y="104">⑦</text>
<text class="mt" x="436" y="127">"要做什么、按什么次序做"在此定案</text>
<text class="mt" x="14" y="192">执行阶段</text>
<rect class="cu" x="88" y="176" width="104" height="26" rx="5"/><text class="tx" x="140" y="193">IR 地址段＝2100H</text>
<rect class="cu" x="222" y="176" width="88" height="26" rx="5"/><text class="tx" x="266" y="193">MAR＝2100H</text>
<rect class="cc" x="340" y="176" width="92" height="26" rx="5"/><text class="tx" x="386" y="193">主存 2100H</text>
<rect class="cu" x="462" y="176" width="96" height="26" rx="5"/><text class="tx" x="510" y="193">MDR＝数据字</text>
<rect class="cu" x="588" y="176" width="56" height="26" rx="5"/><text class="tx" x="616" y="193">R1</text>
<path class="e" d="M192 189 H218" marker-end="url(#tp-a)"/><text class="st" x="205" y="170">⑧</text>
<path class="e" d="M310 189 H336" marker-end="url(#tp-a)"/><text class="st" x="323" y="170">⑨读</text>
<path class="e" d="M432 189 H458" marker-end="url(#tp-a)"/><text class="st" x="445" y="170">⑩</text>
<path class="e" d="M558 189 H584" marker-end="url(#tp-a)"/><text class="st" x="571" y="170">⑪</text>
<text class="mt" x="88" y="228">同一块主存被访两次：取指阶段取出的是<u>指令</u>，执行阶段取出的是<u>数据</u>。</text>
<text class="mt" x="88" y="246">接力口诀：取指 PC 领路（PC→MAR→MDR→IR），译码 IR 开口，执行按令再走 MAR·MDR。</text>
</svg>
<figcaption>部件表里每个寄存器的"关键词"都在这条流水线上兑现：PC 管下一条、MAR 管地址、MDR 管数据中转、IR 管当前指令、译码器管解释、时序管节奏。</figcaption>
</figure>

### 3.1 常见性能指标

- 时钟周期 T = 1 / 主频 f；
- CPI = 总时钟周期数 / 指令条数；
- CPU 执行时间 = 指令条数 × CPI × 时钟周期；
- MIPS = 主频 / (CPI × 10^6)，主频单位为 Hz；
- 带宽 = 数据量 / 传输时间。

例：某处理器主频 2 GHz，平均 CPI=4，执行 5×10^8 条指令：

CPU 时间 = 5×10^8 × 4 / (2×10^9) = **1 s**。

反向验算：2 GHz 在 1 秒内给出 2×10^9 个周期；5×10^8 条×4 周期/条也正好是 2×10^9 个周期。

**应试动作**：看到“下一条地址”选 PC，“当前指令”选 IR，“算术逻辑”选 ALU，“主存地址”选 MAR，“主存数据”选 MDR。性能计算先统一 Hz、秒、Byte/bit。

---

## 第四节 存储体系与主存编址 ★★★

### 4.1 为什么分层

理想存储器要又快、又大、又便宜，但现实中三者不能同时满足，所以按层次组合：

**寄存器 → Cache → 主存 → 外存**

从左到右：速度变慢、容量变大、每位成本降低。分层能奏效，是因为程序具有**局部性**：

- 时间局部性：刚访问过的内容很快又访问，如循环中的指令；
- 空间局部性：访问某地址后很快访问邻近地址，如顺序扫描数组。

<figure class="fig">
<svg viewBox="0 0 700 250" width="100%" style="max-width:700px" role="img" aria-label="存储体系层次图：寄存器、Cache、主存、外存从上到下容量逐渐增大、速度逐渐变慢、每位成本逐渐降低。Cache 位于寄存器和主存之间，用于利用程序的时间局部性和空间局部性。">
<style>.b{fill:var(--accent-soft);stroke:var(--accent);stroke-width:2}.t{fill:var(--ink-strong);font:15px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}.s{fill:var(--muted);font:13px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}.e{stroke:var(--ink);stroke-width:2;fill:none}</style><defs><marker id="marr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--ink)"/></marker></defs>
<text x="40" y="30" class="t">离 CPU 越近：更快、更小、更贵</text><text x="440" y="30" class="t">离 CPU 越远：更慢、更大、更便宜</text>
<path d="M350 45V220" class="e" marker-end="url(#marr)"/><path d="M205 62H495L455 102H245z" class="b"/><text x="318" y="88" class="t">寄存器</text><path d="M175 112H525L480 152H220z" class="b"/><text x="328" y="138" class="t">Cache</text><path d="M135 162H565L515 202H185z" class="b"/><text x="328" y="188" class="t">主存</text><path d="M95 212H605L550 247H150z" class="b"/><text x="328" y="235" class="t">外存</text><text x="34" y="142" class="s">容量 ↑</text><text x="34" y="160" class="s">访问时间 ↑</text><text x="570" y="142" class="s">每位成本 ↓</text>
</svg>
<figcaption>分层不是简单排序：Cache 靠局部性把常用主存块留在更快的一层。</figcaption>
</figure>

### 4.2 常见存储器

| 类型 | 特点 | 常见用途 |
|---|---|---|
| SRAM | 不需刷新、快、贵、集成度低 | Cache |
| DRAM | 需刷新、较慢、便宜、集成度高 | 主存 |
| ROM | 断电不丢，通常只读 | 固件 |
| EEPROM | 可电擦写，常按字节操作 | 配置数据 |
| Flash | 电擦写，通常按块擦除 | SSD、U 盘 |
| 相联存储器 | 按内容检索 | Cache/TLB 中的快速匹配 |

**反例**：RAM 的“随机”不是说数据随机，而是任一地址的访问时间近似相同。磁盘是直接存取，不是严格随机存取；磁带才是典型顺序存取。

### 4.3 主存编址与芯片扩展

通用形式：

- 存储单元数 = 最大地址 − 最小地址 + 1；
- 总容量 = 存储单元数 × 每单元位数；
- 所需芯片数 = 总容量 / 单片容量；
- 若位宽和字数都要扩展：芯片数 = 字数扩展倍数 × 位数扩展倍数。

例：地址 `4000H～7FFFH` 按字节编址：

单元数 = `7FFFH − 4000H + 1 = 4000H = 2^14` 个字节，容量 = **16 KiB**。

若用 `4K×8 bit` 芯片组成 `16K×16 bit` 存储器：

- 字数扩展：16K/4K=4；
- 位宽扩展：16/8=2；
- 总片数：4×2=**8 片**。

反向验证：8×4K×8 bit = 256 Kbit；目标 16K×16 bit = 256 Kbit，容量相等。

#### 非整齐边界的十六进制容量

真题不一定把首尾地址放在 `0000H`、`FFFFH` 这类整齐边界。例：地址范围 `B3000H～DABFFH`，按字节编址，求容量。

```text
  DABFFH
− B3000H
---------
  27BFFH
+      1
---------
  27C00H
```

所以单元数为 `27C00H`。换成 KiB 时可先转十进制：

`27C00H = 2×16^4 + 7×16^3 + 12×16^2 = 162816 B = 159 KiB`。

再用分段法交叉验证：

- `B3000H～BFFFFH`：`D000H = 52 KiB`；
- `C0000H～CFFFFH`：64 KiB；
- `D0000H～DABFFH`：`AC00H = 43 KiB`；
- 合计 `52+64+43=159 KiB`，一致。

**反例**：直接算“末地址−首地址”会少 1 个单元；本题若忘记 `+1`，就得到 `27BFFH`，无法整除成正确容量。

**应试动作**：地址范围一定写“末−首+1”；先看“按字节还是按字编址”；芯片题分别算字数倍数和位宽倍数，不能只拿总 bit 相除后就结束——虽然片数可能相同，但连接方式还要分组。

---
