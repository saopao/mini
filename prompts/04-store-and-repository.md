# 04. Pinia Store 与本地持久化

请先阅读：

- `AGENTS.md`
- `docs/05-data-model-and-formulas.md`
- `docs/10-test-cases.md`

任务：

实现本地优先的数据层。

需要创建：

```txt
src/services/repository/types.ts
src/services/repository/localStorageRepo.ts
src/stores/shop.ts
src/stores/ledger.ts
src/stores/report.ts
src/services/analytics/events.ts
```

要求：

1. 使用 Pinia。
2. `shop` store 管理当前店铺模型。
3. `ledger` store 管理收入/支出记录。
4. `report` store 基于 shop 和 ledger 计算报告/看板数据。
5. repository 层封装 `uni.getStorageSync / uni.setStorageSync`。
6. 页面不直接调用 uni storage。
7. 预留未来切换云同步的接口。
8. 实现新增、编辑、删除记录。
9. 实现清空本地数据。
10. 实现基础埋点方法，可以先 console 或本地记录。

验收：

- 保存模型后重开仍存在。
- 新增记录后看板数据可计算。
- 删除记录后累计数据能回滚。
- 修改模型后报告、看板、实验室基线能重算。

完成后输出：

- Store 方法说明。
- Repository 方法说明。
- 本地验证方式。
- 是否有数据迁移注意事项。
