# 02. 设计系统与基础组件

请先阅读：

- `AGENTS.md`
- `docs/02-reference-board.md`
- `docs/03-design-system.md`
- `docs/12-cross-platform-ui-consistency.md`
- `reference/design-reference-v1.png`

任务：

实现项目基础设计系统，不实现具体业务页面。

需要创建：

```txt
src/styles/tokens.scss
src/styles/global.scss
src/components/base/AppPage.vue
src/components/base/AppHeader.vue
src/components/base/AppCard.vue
src/components/base/AppButton.vue
src/components/base/AppInput.vue
src/components/base/AppAmountInput.vue
src/components/base/AppSegmented.vue
src/components/base/AppChip.vue
src/components/base/AppEmpty.vue
src/components/base/AppToast.vue
```

需要创建业务组件骨架：

```txt
src/components/business/IndustryCard.vue
src/components/business/MetricCard.vue
src/components/business/MetricGrid.vue
src/components/business/RiskTag.vue
src/components/business/ReportConclusion.vue
src/components/business/ProgressCard.vue
src/components/business/TrendChart.vue
src/components/business/ScenarioCompare.vue
```

要求：

1. 所有颜色来自 `tokens.scss`。
2. 所有圆角、间距、字号来自 `tokens.scss`。
3. Wot Design Uni 是主 UI 框架，先完成 `wot-design-uni` 依赖、easycom 和类型声明。
4. `AppButton`、`AppInput`、弹窗、Toast、选择器等通用控件优先封装 Wot Design Uni。
5. Wot Design Uni 未覆盖的业务展示组件才使用自定义 SCSS。
6. 基础组件关键自定义样式必须有静态 fallback，再用 token 覆盖。
7. `tokens.scss` 的 CSS 变量必须同时挂到 `:root` 和 `page`。
8. `global.scss` 必须 reset 小程序端 `button / input / textarea` 默认样式。
9. `AppButton` 支持 `primary / secondary / ghost / danger`。
10. `AppCard` 支持 `default / emphasis / warning / danger`。
11. `AppInput` 支持错误提示。
12. `AppAmountInput` 支持金额输入和两位小数。
13. 不实现业务页面。
14. 不引入 Wot Design Uni 之外的通用 UI 库。
15. 不新增未定义颜色。

完成后输出：

- 组件清单。
- 每个组件的 props。
- 如何在页面中使用。
- 是否有兼容注意事项。
