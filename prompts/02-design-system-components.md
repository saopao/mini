# 02. 设计系统与基础组件

请先阅读：

- `AGENTS.md`
- `docs/02-reference-board.md`
- `docs/03-design-system.md`
- `reference/design-reference.png`

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
3. `AppButton` 支持 `primary / secondary / ghost / danger`。
4. `AppCard` 支持 `default / emphasis / warning / danger`。
5. `AppInput` 支持错误提示。
6. `AppAmountInput` 支持金额输入和两位小数。
7. 不实现业务页面。
8. 不引入大型 UI 库。
9. 不新增未定义颜色。

完成后输出：

- 组件清单。
- 每个组件的 props。
- 如何在页面中使用。
- 是否有兼容注意事项。
