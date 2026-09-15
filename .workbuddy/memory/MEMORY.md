# 项目长期备忘（软考软件设计师资料库）

> 规范类内容一律以 `AGENTS.md` 为准（它是项目规范真源）；本文件只记「跨会话需要记住、但 AGENTS.md 不适合承载」的状态与结论。

## 仓库与平台

- **origin 指向 Gitee**：`https://gitee.com/wang-tengyao/ruankao-software-designer.git`（非 GitHub）。
- **Gitee Pages 已被官方下线**（Gitee 官方 issue `oschina/git-osc#IC6I0L` 明确答复「该功能已下线」；网上大量 CSDN 问答声称"仍正常"，是过时/AI 生成内容，不要采信）。→ **在线阅读一律走 GitHub Pages**。
- 仓库已入库范围包含 `.workbuddy/`（会话记忆）与 `design/`（设计样张）——用户 2026-09-14 明确要求入库，**不要把它们加回 `.gitignore`**。
- **`讲义扩充规划.md`（仓库根）是工作文档，不进 `docs/`**：构建脚本 `tools/build_html.mjs` 的 `pageSources` 只含 `软件设计师考点大纲.md` + `软考学习/*.md`，根目录其他 md 不会被转换。所以「规划 / 设计 / 说明」类文档一律放仓库根，**不要放 `软考学习/`**——放进去会被当成 lesson 页混进索引卡片与梯队导航。
- 课件体检的固定判据（2026-09-15 建立，可复用）：① 逐条核对大纲「学习范围」；② 深度自检六条（有结论无演算 / 公式缺三件套 / 缺反例 / 缺应试动作 / 一句话带过学不懂 / 对比表缺列）；③ 在 `pdf/text/` 检索该考点章节找漏点；④ 抽 3~5 道计算题**亲自复算**（用第二种方法）。分组并行派只读子智能体做前三条，主会话复核关键点。
- 参考资料来源两处：`pdf/text/`（辅导资料 OCR 文本，随仓库提交）＋ `.refs/`（开源项目克隆，如 hello-algo，**只留本地、已 gitignore，绝不提交**）。补写/校准讲义时用 `.refs/` 对照章节划分找"讲得不周全"的漏点，但**考点范围一律以大纲与 `pdf/text/` 为准**（开源项目覆盖面更宽，不考的别搬）。

## 提交约定

- 提交信息用**简体中文**，与历史提交保持一致。
- 拆提交按「内容层 / 工程层」分开：讲义 md 与产物 HTML 的 UI 改动不要混在一个 commit 里。
- **作者身份不一致（未解决）**：仓库 `git config` 是 `wangtengyao <1098834475@qq.com>`，但历史提交里出现过 `snake34475 <snake34475@users.noreply.github.com>`（疑似用户的 GitHub 账号）。提交前留意用哪个身份。
- `LF will be replaced by CRLF` 警告在本机是 `core.autocrlf` 的正常行为，仓库内存 LF，无需处理。

## 部署

- **推送已改走 SSH**：`origin` = `git@gitee.com:wang-tengyao/ruankao-software-designer.git`，密钥 `~/.ssh/id_ed25519`（ed25519，空密码短语）。**不要再改回 HTTPS** —— 本环境的凭据弹窗无法交互，HTTPS 会卡住。这把公钥也可复用到 GitHub。
- `docs/` 就是发布目录，**GitHub Pages 不需要 Actions**：Settings → Pages → Deploy from a branch → `main` + `/docs`。
- **每次改完 md 必须本地 `npm run build` 并把 `docs/` 一起提交**——Pages 只发布提交上去的内容，它不跑构建。
- `docs/.nojekyll` 由 `tools/build_html.mjs` 生成（**不手改 docs/**），用于跳过 Jekyll；若丢失重跑构建即可恢复。
- 部署步骤的完整说明在 `README.md` 的「在线部署（GitHub Pages）」小节。

## 界面改动的验收流程

改 `tools/` 下任何文件后：`npm run build` → 用无头 Chrome 按 **1440（三栏）/ 1140（两栏）/ 880（抽屉）** 三档宽度截图核对 → 深色主题另注一次 `data-theme='dark'` 截图。详见 `AGENTS.md`「HTML 阅读版」节的验收动作条目。
