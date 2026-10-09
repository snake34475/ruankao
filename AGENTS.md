# AGENTS.md — AI 协作入口

本仓库是一套「软考中级·软件设计师」自学资料库。用户不看视频，以本仓库为唯一学习资料，目标为 2026 年 10 月考试两科均不低于 45 分。讲义必须自足、通俗、可靠。

本文件只保存对所有任务都生效的规则。开始工作前，必须按“任务路由”阅读对应细则；被链接文件中的要求与本文件具有同等约束力。

## 开始工作

1. 先读 `软考学习/00-总览与进度.md`，确认真实学习进度。
2. 涉及课程内容时，再读 `软件设计师考点大纲.md` 的对应范围。
3. 根据下表读取细则；一个任务涉及多类工作时，相关细则都要读。

| 任务类型 | 必须阅读 |
|---|---|
| 修改或新增讲义、题目、答案 | [`.agents/course-authoring.md`](.agents/course-authoring.md) |
| 修改 Markdown，或排查渲染异常 | [`.agents/markdown-rendering.md`](.agents/markdown-rendering.md) |
| 新增或修改图示（SVG / ASCII 图 / 交互页） | [`.agents/figure-design.md`](.agents/figure-design.md) |
| 修改 `tools/`、构建、导航、HTML 路由或 `docs/` | [`.agents/html-build.md`](.agents/html-build.md) |
| 拆分、合并或迁移课程文件 | [`.agents/course-splitting.md`](.agents/course-splitting.md) |
| 任何内容或代码变更的交付前检查 | [`.agents/verification.md`](.agents/verification.md) |
| 处理用户"记住/以后都这样"的记忆声明 | [`.agents/memory-management.md`](.agents/memory-management.md) |

## 唯一真源

- 学习进度只认 `软考学习/00-总览与进度.md` 的 checkbox，不在其他文件复制勾选状态。
- 考点范围以 `软件设计师考点大纲.md` 为准，非必要不改。
- `软考学习/**/*.md` 与大纲是内容真源；`docs/` 是构建产物，禁止手工修改。
- 课程、章节与梯队结构由 `tools/site-map.mjs` 提供，VitePress 配置与构建准备脚本从这里读取，不另建会漂移的副本。
- 修改课程 Markdown 或 `tools/` 后，以真源文件为准；只有用户明确要求构建时才运行 `npm run build` 并按构建细则检查产物。未构建时须说明 `docs/` 尚未同步。

## 项目红线

- 全文使用简体中文；代码和必要术语保留英文。
- 不删除或擅自改写用户的进度勾选状态，不改已完成课件编号。
- 不把多个独立考点重新合并进一个大文件；课程内部允许按既定分章结构拆分。
- `pdf/*.pdf` 是本地版权参考资料，禁止提交；不得照搬材料或在仓库内容中出现资料品牌名。
- `.refs/` 是本地参考仓库和验收工具目录，禁止提交其中内容。
- 仓库内链接使用相对路径，不写本机绝对路径。
- 不确定的教材结论宁可核实或不写，不得编造。
- 年份、报名、政策和考试日期等信息注明“以官方通知为准”。

## 构建、提交与推送

- 默认不自动构建、提交或推送。用户分别明确要求后才执行对应动作；要求提交不等于要求构建或推送。
- 构建时确认 136 个正文页面与 13 个旧入口兼容页完整；未构建时不把旧 `docs/` 当作本次内容的验收结果，也不将不同步的 `docs/` 纳入提交。
- 本体仓库配置了双远端：`origin`（Gitee，gitee.com:wang-tengyao/ruankao-software-designer）与 `github`（GitHub，git@github.com:snake34475/ruankao.git）。
- 用户明确要求推送时，先 `git push`（推 origin），再 `git push github main`，保持两个远端同步。

## 仓库结构

```text
├── AGENTS.md                  # 本文件：全局规则与任务路由
├── .agents/                   # 按任务拆分的详细协作规范
├── README.md                  # 面向读者的仓库首页
├── 软件设计师考点大纲.md       # 全局考点范围
├── 软考学习/                  # Markdown 内容真源
├── .vitepress/                # VitePress 配置与主题源码
├── tools/                     # 内容映射、构建准备与产物验收
├── interactive/               # 讲义配套交互演示源码（构建时拷入 docs/）
├── docs/                      # HTML 构建产物，勿手改
├── design/                    # 设计组件样张
├── pdf/                       # 本地参考原件及 OCR 文本
└── .refs/                     # 本地开源参考与验收工具
```

## 工作边界

- 用户说“下一课”时，先检查进度表和现有文件。12 课及模拟卷均已生成时，应转为修订、补题或答疑，不重复创建课程。
- 修订已有内容时直接改对应真源；发现题目或答案错误必须同步修正解析。
- 新增文件或改变结构后，同步更新 README 的目录说明和所有受影响的相对链接。
- 若本次反馈暴露新的通用错误类型，把规则补充到最匹配的 `.agents/*.md`；只有对所有任务都适用的规则才写回本文件。
