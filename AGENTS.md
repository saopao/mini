# AGENTS.md

## 项目身份

你正在协助建设“开店避坑助手”跨端小程序。

产品定位：帮助准备开店和刚开店的新手老板，用最少的数据看清这个店能不能开、今天有没有跑偏、调一个变量会不会更健康。

当前状态：项目已经建立 uni-app 初版代码工程，正在以 H5 页面优先验证功能闭环和文档一致性。仓库包含工程文档、Codex prompts、原始参考素材和 `src/` 代码。

## 权威输入

当前仓库使用三类正式输入：

- `docs/`：产品、设计、交互、数据、测试和发布规范。
- `prompts/`：分阶段 Codex 执行提示词。
- `reference/`：原始 PRD、深度分析报告和设计参考图。

必须优先读取：

- `README-CODEX.md`
- `docs/08-codex-workflow.md`
- 本文件

产品与页面：

- `docs/00-project-brief.md`
- `docs/01-product-positioning.md`
- `docs/02-reference-board.md`
- `docs/06-page-acceptance.md`
- `docs/07-interaction-rules.md`

设计与视觉：

- `docs/03-design-system.md`
- `docs/09-visual-review.md`
- `docs/12-cross-platform-ui-consistency.md`
- `reference/design-reference.png`

工程与测试：

- `docs/10-test-cases.md`
- `docs/05-data-model-and-formulas.md`
- `prompts/`
- `docs/11-launch-checklist.md`

参考来源：

- `reference/source-prototype-prd.md`
- `reference/source-deep-analysis.md`
- `reference/design-reference.png`

## 当前硬约束

- 未经用户明确允许，不初始化代码工程。
- 未经用户明确允许，不写业务代码。
- 不擅自扩大 V1 范围。
- 不在用户未确认前加入登录、支付、云同步、多店铺、AI 输出、库存、CRM、课程或社区。
- 不让页面直接写公式。
- 不让页面直接读写平台 storage。
- 不使用未定义颜色和临时样式体系。
- 不绕过 Wot Design Uni 和项目基础组件另写一套页面 UI 体系。
- 不为了跑通页面硬编码业务结果。
- 不使用“稳赚”“包回本”“保证收益”等承诺文案。

## 当前技术路线

当前初版代码工程已采用：

- uni-app
- Vue 3
- TypeScript
- Pinia
- SCSS
- Wot Design Uni 作为主 UI 组件框架
- 微信小程序优先，保留跨端能力

如果后续改用其他技术栈，必须先更新：

- `docs/05-data-model-and-formulas.md`
- `docs/08-codex-workflow.md`
- 本文件

当前实现按上述技术栈继续推进。若需改技术栈或替换主 UI 框架，先暂停并同步文档。

## V1 必须做

- 欢迎页。
- 行业选择页。
- 开店测算页。
- 经营报告页。
- 今日看板页。
- 快速记账页。
- 实验室页。
- 我的页。
- 本地持久化。
- 公式计算。
- 风险判断。
- 模型修改。
- 免责声明。
- 基础埋点接口。

## V1 暂不做

- 登录。
- 云同步。
- 支付。
- 会员。
- 库存。
- 员工管理。
- 发票税务。
- 自动对账。
- 店铺 CRM。
- 多店铺管理。
- 复杂报表后台。
- 面向用户的不透明 AI 经营承诺。

## AI 工程流程

后续必须按 `docs/08-codex-workflow.md` 的阶段执行：

1. 文档对齐。
2. 技术路线确认。
3. 项目骨架。
4. 设计系统与基础组件。
5. 计算引擎。
6. Store 与 Repository。
7. 逐页实现。
8. 页面截图视觉 Review。
9. 多角色代码 Review。
10. 全链路回归。
11. 内测准备。

每次只做一个阶段或一个页面。低于验收标准不进入下一阶段。

## 推荐实现架构

后续实现时遵循：

```text
页面 -> Store -> Service -> Repository -> 平台存储
```

模块边界：

- `pages`：页面交互和展示编排。
- `components/base`：通用 UI 组件。
- `components/business`：业务展示组件。
- `stores`：状态和派生数据入口。
- `services/calculator`：经营测算公式、风险判断、报告构建、实验室模拟。
- `services/repository`：本地存储封装和未来同步接口。
- `constants`：行业模板和分类。
- `utils`：日期、数字、格式化。
- `styles`：设计 token 和全局样式。

页面组件不得直接散落业务公式。公式变化必须集中修改并有测试覆盖。

## 公式口径

V1 默认公式：

```text
每月目标利润 = 前期投入 / 回本周期
月毛利目标 = 每月固定支出 + 每月目标利润
月流水目标 = 月毛利目标 / 毛利率
日流水目标 = 月流水目标 / 每月营业天数
日单量目标 = 日流水目标 / 客单价
日固定成本摊销 = 每月固定支出 / 每月营业天数
今日估算利润 = 今日收入 * 毛利率 - 日固定成本摊销 - 今日其他支出
回本进度 = 累计估算利润 / 前期投入
```

如需调整公式，必须同步更新：

- `docs/02-reference-board.md`
- `docs/07-interaction-rules.md`
- `docs/10-test-cases.md`
- `docs/05-data-model-and-formulas.md`

## 设计规则

- 主色为经营感绿色。
- 页面背景使用浅灰或极浅绿。
- 核心指标优先于解释文字。
- 卡片不嵌套卡片。
- 通用控件优先使用 Wot Design Uni 的项目基础组件封装。
- 所有移动端内容必须在 320px-414px 宽度内可读。
- 底部按钮和 Tab 必须适配安全区。
- 不使用大面积炫技渐变或无意义装饰。
- H5 和微信小程序端 UI 必须按 `docs/12-cross-platform-ui-consistency.md` 保持一致。
- 页面完成后必须按 `docs/09-visual-review.md` 截图评分。

## 测试规则

实现任务完成后至少执行相关测试或人工回归：

- 公式模块：覆盖 `docs/10-test-cases.md` 的公式用例。
- 页面模块：覆盖 `docs/06-page-acceptance.md` 的页面验收和空状态。
- 记账模块：覆盖新增、编辑、删除、聚合刷新。
- 存储模块：覆盖关闭重开后数据仍存在。
- UI 模块：检查 320px、375px、414px 视口。
- 跨端 UI 模块：同一页面必须检查 H5 与微信小程序端卡片、按钮、输入框、背景和安全区是否一致。
- 全链路：按 `docs/11-launch-checklist.md` 回归。

如果无法运行测试，最终回复必须说明原因和未覆盖风险。

## 任务输出格式

每个任务完成后必须输出：

```md
## 修改文件
- xxx

## 完成内容
- xxx

## 未做事项
- xxx

## 自查结果
- 是否符合 V1 范围：
- 是否符合设计系统：
- 是否覆盖空状态和异常状态：
- 是否影响公共组件或公式：

## 验证方式
- xxx

## 需要用户确认
- xxx
```

## 停止条件

遇到以下情况必须暂停并询问用户：

- 需要新增 V1 范围外功能。
- 需要引入 Wot Design Uni 之外的新 UI 库。
- 需要改技术栈。
- 需要接入云服务、登录、支付。
- 需要面向用户输出 AI 经营建议。
- 公式口径不明确。
- 设计系统无法覆盖当前需求。
- 文档之间出现冲突。

## 文档同步规则

- 新增页面：更新 `docs/06-page-acceptance.md`。
- 修改交互：更新 `docs/07-interaction-rules.md`。
- 修改设计 token：更新 `docs/03-design-system.md`。
- 修改视觉验收：更新 `docs/09-visual-review.md`。
- 修改测试口径：更新 `docs/10-test-cases.md`。
- 修改技术架构：更新 `docs/05-data-model-and-formulas.md`。
- 修改 AI 工作流：更新 `docs/08-codex-workflow.md`、`prompts/` 和本文件。
