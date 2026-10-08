# HTML 构建与阅读版规范

适用于 `tools/`、`docs/`、样式、交互、导航、课程卡片和路由修改。

## 真源与构建

- `软考学习/**/*.md` 和 `软件设计师考点大纲.md` 是内容真源。
- `.vitepress/` 是阅读版配置和主题源码；`tools/site-map.mjs` 提供课程结构，`tools/prepare_vitepress.mjs` 从内容真源生成临时输入，`tools/postbuild_vitepress.mjs` 验收产物。
- `docs/` 完全由 `npm run build` 生成，禁止直接修改其中任何文件。
- `site-src/` 是被忽略的临时输入目录，不能当作内容真源。跨文件 `.md` 链接由准备脚本映射为 VitePress 路由。
- `docs/.nojekyll` 必须由构建生成并随产物提交。

## 导航与布局

- 课程顺序、梯队和导航的唯一结构定义放在 `tools/site-map.mjs`，不要在样张或其他文件写第二套课程清单。
- 页面保持三栏语义：左侧课程目录、中间正文、右侧本页大纲。窄屏可隐藏右栏或把左栏变为抽屉，但导航内容必须仍可访问。
- 分章课程应具有稳定的课程入口页；子章节既可作为目录子项，也可拥有独立 HTML 路由。
- 当前页面、当前章节、已学状态和组内进度应从同一份结构数据推导。
- 构建产物不请求 CDN 或外部字体。离线双击 `docs/index.html` 时静态正文与链接应可阅读；学习状态、搜索等脚本交互以 `npm run preview` 的本地服务验收。

## 本机构建环境注意（2026-10-08 实测定案）

- **Git Bash 里必须用大写盘符进入仓库再构建**：`cd C:/Users/.../ruankao-software-designer` 后再 `npm run build`。若 cwd 是小写 `c:/`，VitePress 渲染阶段会报 `Cannot read properties of undefined (reading 'imports')`（bundle 内 `facadeModuleId` 是大写 `C:/`，与 `config.srcDir` 严格相等比较失败，全部页面找不到 chunk）。清 `.vitepress/cache` 无效，别往缓存方向排查。
- **WorkBuddy 会话内构建需关闭删除保护壳**：prepare 脚本每次整删重建 `site-src`（约 140 个文件），会被批量删除确认拦截（后台运行直接抛 `SAFE_DELETE_BULK_CONFIRM_REQUIRED`）。用 `CODEBUDDY_SAFE_DELETE_ENABLED=0 npm run build` 跳过；`site-src` 是 gitignore 的生成目录，删除安全。
- 构建成功标志：末行输出「验收：136 个正文页面，13 个旧入口兼容页」。

## 构建后验收

1. 运行 `npm run build`，确认无错误。
2. 确认 136 个正文页面、13 个兼容页、样式、脚本、数学公式和 `.nojekyll` 已生成。
3. 检查所有站内页面和资源链接，没有断链；验证旧入口跳转。
4. 至少以 1440、1140、880 三档宽度检查：三栏、两栏和移动抽屉布局。
5. 额外检查一次深色主题。
6. 对修改过的长表格、ASCII 图、折叠答案和代码块做真实渲染抽查。

如果 `.refs/preview.mjs` 存在，可用它抽取小节预览。使用前确保样式和脚本已同步；标题顺序号会随内容变化，每次重新确认范围，且起止编号不能相同。

## 设计约束

- 保持构建后的阅读站点离线可用、零外部网络请求；新增依赖前必须有明确必要性。
- `design/styleguide.html` 只用于历史组件样张，不参与 VitePress 构建。
- 构建成功不代表渲染正确，必须完成浏览器检查后才能交付。
