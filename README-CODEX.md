# 开店避坑助手 AI 工程说明

## 目的

本文件用于说明后续如何让 Codex 参与项目。当前项目已经建立 uni-app 初版代码工程，并以 H5 页面优先验证功能闭环；后续仍需按文档、验收闸门和逐项回归推进。

核心目标：让 Codex 按“文档对齐 -> 技术确认 -> 工程骨架 -> 设计系统 -> 公式引擎 -> 数据层 -> 逐页实现 -> 视觉验收 -> 代码 review -> 全链路回归”的顺序工作。

## 必读文件

每个任务开始前至少读取：

- `AGENTS.md`
- `docs/08-codex-workflow.md`
- 当前任务相关文档

产品和页面相关：

- `docs/00-project-brief.md`
- `docs/01-product-positioning.md`
- `docs/06-page-acceptance.md`
- `docs/07-interaction-rules.md`

视觉相关：

- `docs/02-reference-board.md`
- `docs/03-design-system.md`
- `docs/09-visual-review.md`
- `docs/12-cross-platform-ui-consistency.md`
- `reference/design-reference-v1.png`

工程相关：

- `docs/05-data-model-and-formulas.md`
- `docs/10-test-cases.md`
- `prompts/`
- `docs/11-launch-checklist.md`

参考素材：

- `reference/design-reference-v1.png`
- `reference/source-deep-analysis.md`
- `reference/source-prototype-prd.md`

## 推荐执行顺序

```text
00-before-start
01-bootstrap-project
02-design-system-components
03-calculator-engine
04-store-and-repository
05-page-welcome
06-page-industry
07-page-calculate
08-page-report
09-page-dashboard
10-page-ledger
11-page-lab
12-page-profile
13-visual-review
14-code-review
15-final-regression
```

## 工作规则

- 不要一次性让 Codex 做完整项目。
- 每次只做一个阶段或一个页面。
- 每个页面完成后先运行、截图、视觉 review，再进入下一页。
- 低于验收标准不要进入下一阶段。
- 不让 Codex 自由发挥产品范围、颜色、组件、公式和页面结构。
- 需求变更先改文档，再改实现。

## 当前技术栈

当前初版代码工程已采用：

- uni-app
- Vue 3
- TypeScript
- Pinia
- SCSS
- Wot Design Uni
- 微信小程序优先

如果改用其他技术栈，必须先更新：

- `docs/05-data-model-and-formulas.md`
- `docs/08-codex-workflow.md`
- `AGENTS.md`

## 一句话目标

把“开店避坑助手”做成一个新手老板能在 3 分钟内完成测算、10 秒内看懂今天是否达标、10 秒内记一笔，并能通过实验室看清调整方向的跨端小程序。
