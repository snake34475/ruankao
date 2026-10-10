# 09.3 Cache ★★★

### 5.1 原理与命中率

Cache 保存近期最可能再次使用的主存块。CPU 要数据时先查 Cache：找到叫**命中**，找不到叫**未命中**，再访问主存。主存与 Cache 的地址映射由**硬件自动完成**。

命中率 h = 命中次数 / 总访问次数；未命中率 = 1−h。

### 5.2 平均访问时间：先判断题目的时间定义

考试常见两种模型，差别在“未命中时是否已花过一次查 Cache 的时间”。

**模型 A：题目直接给命中时间 tC、未命中访问时间 tM**

Tavg = h×tC + (1−h)×tM

例：h=95%，命中 10 ns，未命中 100 ns：

Tavg = 0.95×10 + 0.05×100 = 9.5+5 = **14.5 ns**。

**模型 B：先查 Cache，未命中后还要追加访问主存**

Tavg = tC + (1−h)×tM

例：查 Cache 10 ns，主存 100 ns，h=95%：

Tavg = 10 + 0.05×100 = **15 ns**。

两者为何不同？模型 A 的“100 ns”已被题目定义为未命中的完整时间；模型 B 的“100 ns”只是追加的主存时间。**不要脱离题干死背一种公式。**

反向范围检查：平均时间必须落在快路径与慢路径之间。模型 A 的 14.5 ns 在 10～100 ns 之间；若算出 4.5 ns，必错。

### 5.3 三种映射

| 映射方式 | 一个主存块可放哪里 | 地址中的选择字段 | 替换范围 | 冲突/复杂度 |
|---|---|---|---|---|
| 直接映射 | 唯一固定行 | 行号 | 无需选择替换行 | 冲突高、硬件简单 |
| 全相联映射 | 任意一行 | 无行号/组号 | 整个 Cache | 冲突低、硬件复杂 |
| 组相联映射 | 固定组内任意一行 | 组号 | 目标组内部 | 两者折中 |

三种地址结构可用下面的“切字段”记忆：

```text
直接映射：  标记 Tag | 行号 Line | 块内偏移 Offset
全相联：    标记 Tag             | 块内偏移 Offset
组相联：    标记 Tag | 组号 Set   | 块内偏移 Offset
```

- **块内偏移**回答“块里的第几个字节”，三种映射都有；
- **行号/组号**回答“先去哪一行或哪一组找”；
- **标记**回答“当前行里装的是不是我要的那个主存块”。

直接映射的位置唯一，被占就直接覆盖，不需要选择算法；全相联要在整个 Cache 中选牺牲行，组相联只在指定组内选。常见替换算法有 **LRU（最近最少使用）**、FIFO 和随机替换。

口诀：**直接最死板，全相联最自由，组相联折中**。全相联自由度高，但必须同时比较更多标记，硬件复杂。

<figure class="fig">
<svg viewBox="0 0 700 285" width="100%" style="max-width:700px" role="img" aria-label="Cache 三种映射方式对比：直接映射中一个主存块只能放固定一行；全相联中一个主存块可放任意行；组相联中一个主存块先定位到固定组，再放该组任意行。自由度从左到右增大，冲突率下降而硬件复杂度上升。">
<style>.box{fill:var(--surface-2);stroke:var(--line-strong);stroke-width:2}.hit{fill:var(--accent-soft);stroke:var(--accent);stroke-width:2}.t{fill:var(--ink-strong);font:14px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}.s{fill:var(--muted);font:12px system-ui,"PingFang SC","Microsoft YaHei",sans-serif}.e{stroke:var(--ink);stroke-width:2;fill:none}</style><defs><marker id="carr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--ink)"/></marker></defs>
<text x="65" y="28" class="t">直接映射</text><text x="295" y="28" class="t">全相联</text><text x="515" y="28" class="t">组相联</text>
<rect x="40" y="55" width="130" height="145" class="box"/><rect x="64" y="86" width="82" height="25" class="hit"/><text x="75" y="104" class="s">唯一固定行</text><path d="M105 42V83" class="e" marker-end="url(#carr)"/><text x="38" y="226" class="s">冲突高，硬件简单</text>
<rect x="270" y="55" width="130" height="145" class="box"/><rect x="294" y="76" width="82" height="25" class="hit"/><rect x="294" y="115" width="82" height="25" class="hit"/><rect x="294" y="154" width="82" height="25" class="hit"/><path d="M335 42V73M335 42L335 112M335 42L335 151" class="e" marker-end="url(#carr)"/><text x="267" y="226" class="s">任意行，硬件复杂</text>
<rect x="500" y="55" width="150" height="145" class="box"/><rect x="520" y="78" width="110" height="42" class="hit"/><rect x="520" y="137" width="110" height="42" class="box"/><text x="532" y="103" class="s">固定组内任意行</text><text x="540" y="163" class="s">其他组</text><path d="M575 42V75" class="e" marker-end="url(#carr)"/><text x="505" y="226" class="s">冲突与复杂度折中</text><text x="160" y="270" class="s">自由度：直接 &lt; 组相联 &lt; 全相联；冲突率与硬件复杂度的变化方向相反。</text>
</svg>
<figcaption>先问“一个主存块能放哪儿”：唯一行、任意行、固定组内任意行，分别对应三种映射。</figcaption>
</figure>

**数值算例：一条主存地址的旅行**。条件：主存 1 MB 按字节编址；Cache 8 KB，块大小 32 B。先算三种映射各自的字段宽度，再拿同一个地址 0x12345 分别走一遍。

第一步，算字段位数（顺序固定：**先切偏移，再切行号/组号，剩下的全归标记**）：

- 地址总位数 = log₂ 1 MB = 20 位（2²⁰ = 1 M）；
- 块内偏移 = log₂ 32 B = 5 位；
- 直接映射行数 = 8 KB ÷ 32 B = 256 行 → 行号 = log₂ 256 = 8 位；标记 = 20 − 8 − 5 = **7 位**。

第二步，把地址写全再切。**易错警告**：20 不是 4 的倍数，按 7|8|5 切完的边界不落在十六进制位上，**必须把 20 个二进制位整排写出来沿线切**：

<figure class="fig">
<svg viewBox="0 0 700 250" width="100%" style="max-width:700px" role="img" aria-label="直接映射切字段演算：主存地址 0x12345 的 20 个二进制位排成一排，前 7 位金色为标记值 9，中间 8 位绿色为行号值 26，末尾 5 位灰色为块内偏移值 5；下方三个步骤框说明先定行、再比标记、最后按偏移取字节">
<style>
.bt{font:12px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;fill:var(--ink);text-anchor:middle}
.tg{fill:var(--gold-soft);stroke:var(--gold);stroke-width:1.5}
.lnc{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5}
.of{fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1.5}
.sg{font:600 11px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;text-anchor:middle}
.sg1{fill:var(--gold)}
.sg2{fill:var(--accent-ink)}
.sg3{fill:var(--muted)}
.tt{font:600 13px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;fill:var(--ink-strong)}
.bx{fill:var(--surface);stroke:var(--line-strong);stroke-width:1.5}
.tx{font:11px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;fill:var(--ink);text-anchor:middle}
.mt{font:11px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;fill:var(--muted);text-anchor:middle}
.arr{stroke:var(--line-strong);stroke-width:1.5;fill:none}
</style>
<defs><marker id="ca-arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--line-strong)"/></marker></defs>
<text class="tt" x="54" y="20">0x12345 的 20 位二进制（地址总位数由主存容量定）</text>
<rect class="tg" x="54"  y="30" width="28" height="30"/><text class="bt" x="68"  y="50">0</text>
<rect class="tg" x="82"  y="30" width="28" height="30"/><text class="bt" x="96"  y="50">0</text>
<rect class="tg" x="110" y="30" width="28" height="30"/><text class="bt" x="124" y="50">0</text>
<rect class="tg" x="138" y="30" width="28" height="30"/><text class="bt" x="152" y="50">1</text>
<rect class="tg" x="166" y="30" width="28" height="30"/><text class="bt" x="180" y="50">0</text>
<rect class="tg" x="194" y="30" width="28" height="30"/><text class="bt" x="208" y="50">0</text>
<rect class="tg" x="222" y="30" width="28" height="30"/><text class="bt" x="236" y="50">1</text>
<rect class="lnc" x="250" y="30" width="28" height="30"/><text class="bt" x="264" y="50">0</text>
<rect class="lnc" x="278" y="30" width="28" height="30"/><text class="bt" x="292" y="50">0</text>
<rect class="lnc" x="306" y="30" width="28" height="30"/><text class="bt" x="320" y="50">0</text>
<rect class="lnc" x="334" y="30" width="28" height="30"/><text class="bt" x="348" y="50">1</text>
<rect class="lnc" x="362" y="30" width="28" height="30"/><text class="bt" x="376" y="50">1</text>
<rect class="lnc" x="390" y="30" width="28" height="30"/><text class="bt" x="404" y="50">0</text>
<rect class="lnc" x="418" y="30" width="28" height="30"/><text class="bt" x="432" y="50">1</text>
<rect class="lnc" x="446" y="30" width="28" height="30"/><text class="bt" x="460" y="50">0</text>
<rect class="of" x="474" y="30" width="28" height="30"/><text class="bt" x="488" y="50">0</text>
<rect class="of" x="502" y="30" width="28" height="30"/><text class="bt" x="516" y="50">0</text>
<rect class="of" x="530" y="30" width="28" height="30"/><text class="bt" x="544" y="50">1</text>
<rect class="of" x="558" y="30" width="28" height="30"/><text class="bt" x="572" y="50">0</text>
<rect class="of" x="586" y="30" width="28" height="30"/><text class="bt" x="600" y="50">1</text>
<path class="arr" d="M54 60 V68 H250 V60"/>
<path class="arr" d="M250 60 V76 H474 V60"/>
<path class="arr" d="M474 60 V84 H614 V60"/>
<text class="sg sg1" x="152" y="104">标记 7 位 = 0001001 = 9</text>
<text class="sg sg2" x="362" y="104">行号 8 位 = 00011010 = 26</text>
<text class="sg sg3" x="544" y="104">偏移 5 位 = 00101 = 5</text>
<text class="mt" x="350" y="124">边界不落在十六进制位上：先把二进制写全，再按 7｜8｜5 沿线切</text>
<rect class="bx" x="40" y="138" width="200" height="76" rx="8"/>
<text class="tx" x="140" y="158">① 先按行号定行</text>
<text class="tx" x="140" y="176">到第 26 行查岗：该行的标记</text>
<text class="tx" x="140" y="194">等于 9 吗？（见右两框）</text>
<rect class="bx" x="252" y="138" width="216" height="76" rx="8"/>
<text class="tx" x="360" y="158">② 比标记判定</text>
<text class="tx" x="360" y="176">行 26 已存标记 10 → 不符，未命中</text>
<text class="tx" x="360" y="194">行 26 存标记 9 → 命中</text>
<rect class="bx" x="480" y="138" width="180" height="76" rx="8"/>
<text class="tx" x="570" y="158">③ 命中后按偏移取字节</text>
<text class="tx" x="570" y="176">进该块的第 5 个字节</text>
<text class="tx" x="570" y="194">（从 0 数起）</text>
</svg>
<figcaption>未命中时：整块换入第 26 行并赶走原块；行里存的标记=主存块号÷256 的商，所以“标记 10 占着 26 行”对应主存块 10×256+26=2586。</figcaption>
</figure>

第三步，把主存块号对账（自验，防止切错）：块号 = 高 15 位 = 标记与行号拼接 = `0001001`+`00011010` = 2330；检查 2330 = 9×256 + 26 ✓（商 9 就是标记，余 26 就是行号）。

第四步，**同一地址 0x12345 换到另外两种映射再走一遍**，体会“只有中间两段的分法在变，偏移永远不动”：

| 映射 | 切法（标记｜中｜偏移） | 各段值 | 去哪找 |
|---|---|---|---|
| 直接映射 | 7｜8｜5 | 9｜26｜5 | 第 26 行一行，比一次标记 |
| 2 路组相联（8 KB÷32B÷2=128 组） | 8｜7｜5 | 18｜26｜5 | 第 26 组内 2 路**并行比**标记（2330=18×128+26 ✓） |
| 全相联 | 15｜—｜5 | 2330｜—｜5 | 没有中字段，标记=块号本身，整个 Cache 同时比 |

**反例演示（易错）**：把偏移从左边数起，或者按十六进制“1｜23｜45”直接切段，是最常见的两种错法——偏移永远在**最低位**。另一个高频陷阱：题目说“Cache 共 256 个存储块，4 路分组”时，组数是 256÷4=64，组号 6 位，不是拿 256 直接当组数取 8 位。

**冲突代价也能量化**：块 2330 和块 2586 在主存里差 256 个块，却都映射到第 26 行，直接映射下只能互相踢——这就是“直接映射冲突高”的具体含义；组相联每多一路，同行竞争者多一批坑位。

**应试动作**：Cache 题先圈出“命中时间/主存时间/未命中总时间”字样再选模型；答案必须做范围检查。切字段按固定顺序：**偏移先切（题给块大小）、行号/组号再切（Cache 容量÷块大小÷路数）、剩下的全归标记**。映射题背“冲突率：直接＞组相联＞全相联；复杂度反过来”。

---
