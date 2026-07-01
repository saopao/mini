# 13. 页面截图视觉 Review

请先阅读：

- `docs/02-reference-board.md`
- `docs/03-design-system.md`
- `docs/09-visual-review.md`
- `docs/12-cross-platform-ui-consistency.md`
- `reference/design-reference-v1.png`

任务：

对比设计参考图和当前页面截图，只做视觉分析，先不要改代码。

请我提供：

- 设计参考图：`reference/design-reference-v1.png` 或 `screenshots/design/页面名.png`
- 当前实现截图：`screenshots/actual/页面名-v1.png`

分析维度：

1. 页面层级
2. 间距
3. 字体大小
4. 卡片圆角
5. 阴影
6. 颜色一致性
7. 按钮位置
8. 数据突出程度
9. 与设计系统一致性
10. 是否通过 Wot Design Uni 和项目基础组件统一通用控件
11. H5 与微信小程序端卡片、按钮、输入框、背景和安全区一致性
12. 微信小程序可用性

输出格式：

```md
# 视觉 Review：页面名

## 总分
xx / 100

## 通过项
- xxx

## 最大的 5 个问题
1. 问题：xxx
   影响：xxx
   修改建议：xxx

## 不建议修改
- xxx

## 下一轮修复清单
- [ ] xxx
- [ ] xxx
```

限制：

- 不要建议新增颜色。
- 不要建议引入 Wot Design Uni 之外的通用 UI 库。
- 不要建议改业务范围。
- 不要泛泛地说“更高级”，必须给具体修改点。
