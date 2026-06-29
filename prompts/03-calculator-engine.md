# 03. 经营测算公式引擎

请先阅读：

- `AGENTS.md`
- `docs/05-data-model-and-formulas.md`
- `docs/10-test-cases.md`

任务：

实现经营测算核心逻辑，不写 UI。

需要创建：

```txt
src/services/calculator/types.ts
src/services/calculator/formulas.ts
src/services/calculator/riskRules.ts
src/services/calculator/reportBuilder.ts
src/services/calculator/simulate.ts
src/utils/number.ts
src/utils/format.ts
src/utils/date.ts
src/constants/industryModels.ts
src/constants/categories.ts
```

核心公式：

```txt
每月目标利润 = 前期投入 / 回本周期
月毛利目标 = 每月固定支出 + 每月目标利润
月流水目标 = 月毛利目标 / 毛利率
日流水目标 = 月流水目标 / 营业天数
日单量目标 = 日流水目标 / 客单价
日固定成本摊销 = 月固定支出 / 营业天数
今日估算利润 = 今日收入 * 毛利率 - 日固定成本摊销 - 今日其他支出
回本进度 = 累计估算利润 / 前期投入
```

要求：

1. 所有函数必须是纯函数。
2. 所有输入参数必须有 TypeScript 类型。
3. 处理 NaN、Infinity、0、负数等边界值。
4. 风险规则返回 `success / warning / danger`。
5. 行业模型至少包含 8 个首发行业。
6. 给出至少 10 组测试样例，可以先用普通函数或注释方式表达。
7. 不写页面代码。
8. 不引入第三方计算库。

完成后输出：

- 实现文件。
- 公式说明。
- 测试样例结果。
- 边界值处理方式。
