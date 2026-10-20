# 项目长期备忘（软考软件设计师资料库）

> 规范真源是 `AGENTS.md`（任务路由表，细则在 `.agents/`）；本文件只记跨会话状态与结论，与 `.agents/` 冲突时以后者为准。

## 仓库与远端

- 双远端：`origin` → Gitee（wang-tengyao/ruankao-software-designer）、`github` → GitHub（snake34475/ruankao）。**推送必须两边都推**：`git push origin main && git push github main`。
- 推送走 SSH（`~/.ssh/id_ed25519`，两远端同一把钥），**别改回 HTTPS**（凭据弹窗会卡死）。本机无 gh CLI，查 GitHub 状态用 `git ls-remote` / `ssh -T`。
- GitHub Pages 已启用：<https://snake34475.github.io/ruankao/>，只读 GitHub 仓库的 `/docs`（Deploy from branch，无 Actions）。Gitee Pages 已官方下线，别信网上"仍可用"的说法。
- **每次改完 md 必须本地 `npm run build` 并把 `docs/` 一起提交**；正文页面数以 `tools/postbuild_vitepress.mjs` 动态汇总为准（现为 137）。`interactive/` 静态页不计入该数。
- 仓库入库范围含 `.workbuddy/` 与 `design/`（用户明确要求），别加回 `.gitignore`。`.refs/`（本地参考克隆与验收脚本）绝不提交。
- 根目录「规划/设计/说明」类 md 不进 `软考学习/`（会被当 lesson 页混进索引），也不参与构建。
- 课程文件已按课号拆子目录：真源 `软考学习/NN-课名/MM-小节名.md`，无整课单文件。

## 构建环境坑（2026-10-08 定案）

1. Git Bash 构建必须**大写盘符 cd**（`cd C:/...`），否则 VitePress 渲染报 `Cannot read properties of undefined (reading 'imports')`。别往缓存方向排查。
2. prepare 整删 `site-src` 会被删除保护壳拦截：构建时加 `CODEBUDDY_SAFE_DELETE_ENABLED=0 npm run build`。
3. 构建后 `git status` 报一批假 M（autocrlf + 无 .gitattributes 的 stat 假象，diff 实为空）：`git add --renormalize .` 消除，**不要 `git checkout -- .`**。构建幂等，可用来核验产物是否漏提交。

## 提交约定

- 提交信息简体中文；内容层（讲义 md）与工程层（HTML UI）分开提交。
- 仓库 config 是 `wangtengyao <1098834475@qq.com>`，GitHub 显示同名而非 snake34475——邮箱一致，不算问题，不改。

## Markdown 写作铁律（渲染实测教训）

- `**` 紧跟标点后（如 `。**` 后接汉字）不是闭合标记，会字面露出 `**`；括号/引号移到加粗之外。
- 数字范围一律全角 `～`（`0～255`）；ASCII `~` 同段 ≥2 个会触发删除线。
- 竖排表格唯一可靠判据：某格单行宽度 > 可用宽度且换行后每行 ≤1.5 字（真竖排全仓库仅 3 张）；优先改措辞而非删表。
- **「全角 `｜` 拼列的伪表格」已实测否决（比例字体不可能对齐），别再试**；横向对齐的比较信息留在表格里。
- 站内指向 `interactive/` 的链接必须带 `target`，否则被 VitePress router 拦成 404（修法见 `.agents/html-build.md`）。

## 阅读版性能事实（实测，勿凭猜想）

- 判断页面轻重看 DOM 节点数与 JS 堆，别拿进程总内存当指标；每开一个标签 = 独立渲染进程（唯一数量级杠杆）。
- 顶栏毛玻璃（backdrop-filter）已移除，**勿改回**；字重只用 500/600/700（100 整数倍）。
- `content-visibility` 已实测否决（小节高度差异大导致首屏高度失真），**勿再试**。
- `file://` 下 localStorage 跨页共享是正常行为，不是 bug。

## 错题本（2026-10-09）

- 独立 HTML 看板：`interactive/mistake-book/`（数据全在 `app.js` 的 MISTAKES/WEAK 数组），构建时拷进 `docs/interactive/`。**不要做成 md 页**。
- 条目约定：我的答案 / 正确答案 / 错因（指向具体规则）/ 知识点 / 下次回炉；错因只说现象不算过关。
- 用户做错、蒙对、犹豫的题都要同步记入，不留在对话里。

## 出题与批改（2026-10-20 用户明确要求）

- 检验题**优先用题库原题**（课后题 / 精华题 / 模拟卷），自拟题只在概念入门那一步用来建立直觉；用户会追问「这是不是近几年考点」，答完讲解就要上原题。
- 题库不标年份来源，**不能声称某题是某年真题**；回答时必须区分「考点属大纲高频」与「题目来源可考」，不可为安抚而编造年份。
- 批改时逐项对位置与单项数值，尤其**求和项数**：分子项数必须等于元素个数（ASL 等平均量通用）。

## 冲刺与进度

- 学习执行以 `interactive/sprint-plan/index.html` 当前冲刺日卡为准；讲解练习聚焦高频考点、易混辨析、直接得分题，不扩展低频背景。
- sprint-plan 支持 JSONBin 云端同步：bin `6acb855cffd5d160536166d7`，key 内嵌于源码 `CLOUD_EMBEDDED_KEY`（以源码现值为准）。`record.state` 键为 `日.任务下标`；与 `00-总览与进度.md` checkbox 是两套并行口径。
- 2026-10-19 实测：云端 bin 只有 legacy 键、updatedAt 10/16；本机 localStorage 搜不到 `ruskprint`。多设备勾选来源未查明，用户叫停——别重复挖 leveldb。

## 验收工具（都在 `.refs/`，gitignore）

- 截图：`shots.mjs`（多宽度×主题）、`shot-region.mjs`（按正文文字定位截块）；布局回归 `measure.mjs`、`verify.mjs`；表格体检 `table-probe.mjs` / `table-sweep.mjs`；粗体/波浪号审计 `audit-bold.mjs` / `patch-markdown-defects.mjs`。
- 界面改动验收：1440/1140/880 三档宽度截图 + 深色主题（localStorage `vitepress-theme-appearance`）。
- 大课扩写走分片-拼接流水线（`.refs/parts/` + `patch<NN>.mjs`），脚本用精确标题锚点 + 命中断言。
