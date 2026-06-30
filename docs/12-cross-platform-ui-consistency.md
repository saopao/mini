# H5 与小程序 UI 一致性规范

## 目标

同一套 uni-app + Vue 3 + SCSS + Wot Design Uni 代码在 H5 和微信小程序端应保持接近一致的视觉结果。H5 可以用于快速功能闭环，但视觉通过标准必须同时看 H5 和小程序端，尤其是卡片、按钮、输入框、页面背景和底部安全区。

Wot Design Uni 是当前主 UI 框架。跨端一致性优先通过 Wot Design Uni 组件、项目 `App*` 二次封装、设计 token 三层共同保证；页面不得为 H5 或小程序端分别复制一套通用样式。

## 已知差异来源

以下差异不是业务设计差异，属于跨端兼容风险：

- 小程序端 `button`、`input`、`textarea`、`picker` 有平台默认样式，必须 reset。
- `:root` 在小程序端不如 `page` 稳定，CSS 变量必须同时挂到 `page`。
- 只写 `var(--token)` 时，如果某端变量失效，整条声明可能失效；关键样式必须先写静态 fallback，再写 token 覆盖。
- `radial-gradient`、多层 `background`、复杂 `box-shadow`、`filter`、`backdrop-filter`、`position: fixed + env()` 在 H5 和小程序端可能不一致。
- `display: grid`、`gap`、`minmax()` 可用于 H5，但小程序端必须截图确认；核心表单和操作区优先使用 flex 或单列布局。
- `scoped` 样式下的 `:deep()` 在不同端编译后选择器可能不同，基础组件状态优先在组件内部实现。

## 基础原则

1. 基础视觉只能来自 `src/styles/tokens.scss`、Wot Design Uni 和项目基础组件。
2. 按钮、输入框、弹窗、Toast、选择器等通用控件优先来自 Wot Design Uni 的项目封装。
3. 卡片、空状态、指标卡等业务展示组件不允许在页面里临时重写一套样式。
4. 页面级背景使用纯色 token，不在 `AppPage` 放复杂渐变。
5. 装饰性渐变只允许出现在业务组件或重点结论卡，并且必须 H5/小程序双端截图通过。
6. 所有自定义关键声明必须使用 fallback 写法。
7. H5 视觉通过不等于小程序通过。

## Token 写法

`tokens.scss` 必须同时输出到 `:root` 和 `page`：

```scss
:root,
page {
  --color-bg-page: #f7faf8;
}
```

关键组件样式必须先写静态值，再写 token：

```scss
.app-card {
  border: 1px solid #e5eee9;
  border-color: var(--color-border);
  border-radius: 12px;
  border-radius: var(--radius-lg);
  background: #fff;
  background: var(--color-bg-card);
}
```

不允许只写：

```scss
.app-card {
  border-color: var(--color-border);
}
```

## 全局 Reset

`global.scss` 必须覆盖以下平台默认样式：

- `view`、`text`、`button`、`input`、`textarea` 使用 `box-sizing: border-box`。
- `button` 清除 margin、padding、border、默认背景和 `button::after` 边框。
- `button` 必须继承字体和颜色。
- `input`、`textarea` 清除默认边框、背景、padding，并继承字体。

禁止页面直接依赖平台默认 `button`、`input` 外观。

## 组件规则

### AppPage

- 背景只使用 `color.bg.page`。
- 不使用 `radial-gradient` 或多层背景。
- Tab 页底部必须预留 `env(safe-area-inset-bottom)`。

### AppCard

- 卡片必须用 `AppCard`。
- 默认白底、浅边框、统一圆角和轻阴影。
- 不允许卡片嵌套卡片。
- 页面如果需要强调卡片，优先使用 `variant`，不要写临时 class 覆盖核心样式。

### AppButton

- 所有主要操作使用 `AppButton`。
- `AppButton` 必须优先封装 Wot Design Uni 按钮能力，再叠加项目 token 和业务状态。
- 固定高度不小于 48px。
- 按钮文字必须在 320px 宽度不裁切；三按钮横排必须在 360px 以下降为单列。

### AppInput / AppAmountInput

- 输入能力优先封装 Wot Design Uni 输入/表单组件。
- 输入框右侧单位必须固定宽度或不挤压输入值。
- 行式输入在 320px 下必须检查标签、值、单位、箭头不重叠。
- 金额和百分比字段不允许用页面临时 input 样式。

## CSS 使用分级

### 可直接使用

- `display: flex`
- `border`
- `border-radius`
- `background-color` / 单色 `background`
- `box-shadow` 轻阴影
- `padding` / `margin`
- `font-size` / `font-weight`

### 可使用但必须双端截图

- `display: grid`
- `gap`
- `position: fixed`
- `env(safe-area-inset-bottom)`
- `linear-gradient`
- 多列按钮布局
- `:deep()` 修改子组件样式

### 默认禁止

- `filter`
- `backdrop-filter`
- 大面积或多层装饰渐变
- 依赖 hover 的交互
- 页面内随机颜色
- 为单页复制一套卡片、按钮、输入框样式

## 双端验收要求

每次 UI 改动至少检查：

- H5：320px、375px、414px。
- 微信小程序：iPhone 320/375/414 等效机型或开发者工具模拟器。

检查项：

- 页面背景颜色一致。
- 卡片白底、边框、圆角、阴影一致。
- 按钮高度、圆角、颜色一致。
- 输入框标签、值、单位不重叠。
- 底部按钮和 Tab 不被安全区遮挡。
- 没有 H5 正常、小程序端文字裁切或样式丢失。

如果 H5 和小程序差异明显，优先修基础组件或 token，不在页面里做平台分叉。

如果 Wot Design Uni 默认样式与项目 token 冲突，优先在基础组件封装层调整，不在页面内覆盖组件内部选择器。

## 允许的平台条件编译

只有在以下情况允许使用条件编译：

- 平台安全区 API 差异。
- 小程序端原生组件必须单独 reset。
- H5 与小程序端某 CSS 特性确认无法一致。

条件编译必须写注释说明原因，并同步记录到视觉 Review。
