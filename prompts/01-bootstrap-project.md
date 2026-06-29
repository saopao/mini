# 01. 初始化项目结构与路由

请先阅读：

- `AGENTS.md`
- `docs/00-project-brief.md`
- `docs/04-information-architecture.md`

任务：

基于当前 uni-app + Vue3 + TypeScript 项目，完成基础目录结构和页面路由配置。

需要创建页面：

- `src/pages/welcome/index.vue`
- `src/pages/industry/index.vue`
- `src/pages/calculate/index.vue`
- `src/pages/report/index.vue`
- `src/pages/dashboard/index.vue`
- `src/pages/ledger/index.vue`
- `src/pages/lab/index.vue`
- `src/pages/profile/index.vue`

需要创建目录：

```txt
src/components/base
src/components/business
src/stores
src/services/calculator
src/services/repository
src/constants
src/styles
src/utils
```

要求：

1. 配置 `pages.json`。
2. 首启页面为 `pages/welcome/index`。
3. tabBar 只包含：看板、记账、实验室、我的。
4. 每个页面先只放页面标题和基础占位内容。
5. 不写业务逻辑。
6. 不写复杂样式。
7. 不引入第三方 UI 库。
8. 不实现登录、支付、云同步。

完成后输出：

- 修改文件列表。
- 如何运行验证。
- 是否有不确定事项。
