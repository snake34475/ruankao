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
| 修改 `tools/`、构建、导航、HTML 路由或 `docs/` | [`.agents/html-build.md`](.agents/html-build.md) |
| 拆分、合并或迁移课程文件 | [`.agents/course-splitting.md`](.agents/course-splitting.md) |
| 任何内容或代码变更的交付前检查 | [`.agents/verification.md`](.agents/verification.md) |
| 处理用户“记住/以后都这样”的记忆声明 | [`.agents/memory-management.md`](.agents/memory-management.md) |

## 唯一真源

- 学习进度只认 `软考学习/00-总览与进度.md` 的 checkbox，不在其他文件复制勾选状态。
- 考点范围以 `软件设计师考点大纲.md` 为准，非必要不改。
- `软考学习/**/*.md` 与大纲是内容真源；`docs/` 是构建产物，禁止手工修改。
- 课程、章节与梯队结构只在 `tools/build_html.mjs` 中维护，不另建会漂移的副本。
- 修改课程 Markdown 或 `tools/` 后必须运行 `npm run build`，并按构建细则检查产物。

## 项目红线

- 全文使用简体中文；代码和必要术语保留英文。
- 不删除或擅自改写用户的进度勾选状态，不改已完成课件编号。
- 不把多个独立考点重新合并进一个大文件；课程内部允许按既定分章结构拆分。
- `pdf/*.pdf` 是本地版权参考资料，禁止提交；不得照搬材料或在仓库内容中出现资料品牌名。
- `.refs/` 是本地参考仓库和验收工具目录，禁止提交其中内容。
- 仓库内链接使用相对路径，不写本机绝对路径。
- 不确定的教材结论宁可核实或不写，不得编造。
- 年份、报名、政策和考试日期等信息注明“以官方通知为准”。

## 提交与推送

- 每次提交前先运行 `npm run build`，确认 136 个页面产物与源码一致，不提交失败或不完整的构建产物。
- 本体仓库配置了双远端：`origin`（Gitee，gitee.com:wang-tengyao/ruankao-software-designer）与 `github`（GitHub，git@github.com:snake34475/ruankao.git）。
- 提交后必须推送到两个远端：`git push`（推 origin）后，再 `git push github main`，两者缺一不可。

## 仓库结构

```text
├── AGENTS.md                  # 本文件：全局规则与任务路由
├── .agents/                   # 按任务拆分的详细协作规范
├── README.md                  # 面向读者的仓库首页
├── 软件设计师考点大纲.md       # 全局考点范围
├── 软考学习/                  # Markdown 内容真源
├── tools/                     # 构建、样式和交互源码
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
