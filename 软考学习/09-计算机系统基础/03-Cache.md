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

**应试动作**：Cache 题先圈出“命中时间/主存时间/未命中总时间”字样再选模型；答案必须做范围检查。映射题背“冲突率：直接＞组相联＞全相联；复杂度反过来”。

---
