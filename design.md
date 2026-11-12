# 液态玻璃 — 风格参考

> 玻璃让背景透过、在边缘微微弯折，随触碰轻轻回弹。

**Theme:** mixed

液态玻璃由清晰背景、薄透的中性色表面、细小的定向边缘高光和克制的折射共同构成。把它留给悬浮导航、搜索、播放控件和临时菜单；正文与信息卡保持稳定、易读。支持的环境必须默认使用 SVG 位移滤镜，让背景在玻璃边缘产生可见弯折；纯透明白加 blur 只是降级，不是完整液态玻璃。曲面边缘使用折射曲线与平坦中心，可保留极轻色散。深浅背景都须照顾文字对比；点击时短促压缩，拖动时轻微伸展，释放后约 420ms 平顺回到原位。

## Reference

参考链接：<https://developer.apple.com/design/human-interface-guidelines/materials>

## Colors

| Name | Value | Token | Role |
|---|---|---|---|
| Paper | `#F3F2ED` | `--color-paper` | 安静、低对比的主页面底色，使悬浮玻璃和文字保持清楚。 |
| Graphite Ink | `#202929` | `--color-ink` | 标题、正文和浅色背景控件中的主要文字颜色。 |
| Deep Sea Scene | `#25414A` | `--color-glass-scene` | 玻璃需要透过和折射的照片、色调或线条背景；深色浮层在此处使用白字。 |
| Salt Mist | `#E4EFEB` | `--color-glass-mist` | 轻量的蓝绿色表面色，用于着色材质的柔和底片，而非外发光。 |
| Glancing Light | `#FFFFFF` | `--color-glass-glint` | 沿玻璃上缘或受光侧的一像素高光，显出曲面方向。 |
| Sage Focus | `#557B79` | `--color-focus` | 浅色背景控件的焦点环及少量操作状态提示，维持足够对比。 |

## Typography

### System UI — 使用平台系统字体保持自然亲切；标题以字号、留白和中等字重建立层级，不使用描边或发光。

- **Substitute:** -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Weights:** 400, 500, 600
- **Sizes:** 12, 14, 16, 20, 28, 40, 56
- **Line height:** 1.05 (display), 1.18 (headings), 1.55 (body)
- **Letter spacing:** -0.045em on display, 0.025em on uppercase labels

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|---|---|---|---|---|---|---|
| display | — | 500 | 56px | 1.05 | -0.045em | `--text-display` |
| heading-lg | — | 500 | 40px | 1.12 | -0.035em | `--text-heading-lg` |
| heading | — | 600 | 28px | 1.2 | — | `--text-heading` |
| subheading | — | 500 | 20px | 1.35 | — | `--text-subheading` |
| body-lg | — | 400 | 16px | 1.55 | — | `--text-body-lg` |
| body | — | 400 | 14px | 1.5 | — | `--text-body` |
| label | — | 500 | 12px | 1.35 | 0.025em | `--text-label` |

## Spacing & Layout

**Base unit:** 8px
**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
|---|---|---|
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 48 | 48px | `--spacing-48` |
| 64 | 64px | `--spacing-64` |
| 88 | 88px | `--spacing-88` |

### Border Radius

| Element | Value |
|---|---|
| buttons and navigation | 999px |
| search and segmented controls | 999px |
| cards | 24px |
| menus and sheets | 28px |

- **Page max-width:** 1120px
- **Section gap:** 88px
- **Card padding:** 24px
- **Element gap:** 16px

## Components

### Floating Glass Bar

**Role:** 主导航与场景切换

胶囊底栏高 56–64px，可触区域至少 44px。放在有色照片或内容上：清透状态使用低浓度表面染色、默认启用的真实背景位移折射和一像素定向高光。中心保持平坦，折射集中在约 8–24px 的曲面边带；允许克制的色散。深色场景上用白色图标和文字；明亮场景则加中性着色，避免标签消失。选中片随拖动横向移动，按下压到 0.96，拖动时轻微拉宽，释放后约 420ms 回弹到位。键盘焦点使用清楚的双像素焦点环。

- **Sizes:** 56–64px overall height; at least 44px per hit area; capsule radius
- **States:** Idle; 110ms press compression; drag with slight horizontal stretch; 420ms spring settle; keyboard focus; disabled

### Clear Glass Button

**Role:** 照片或媒体上方的轻量操作

胶囊形，至少 44px 高，使用低浓度表面、真实边缘折射和极细上缘高光；仅在不支持折射时使用轻柔模糊。优先用深场景上的白色标签；亮背景上切换到深色标签和中性着色表面。按下约 110ms 轻压至 0.96，松开以 420ms 左右弹性过渡恢复；尊重减少动态效果偏好。避免在没有可见背景内容时使用清透款。

- **Sizes:** 44px minimum hit target; capsule radius; 12–16px horizontal inset
- **States:** Rest; hover edge glint; compress on press; visible focus; disabled at readable opacity

### Tinted Glass Menu

**Role:** 短菜单和临时选项

22–28px 圆角，以更不透明的暖白或灰绿色层承载短标签、选项和图标。背景模糊控制在适中范围，外投影轻柔，顶部只留一条细高光。菜单内文字始终使用墨色；长说明和复杂设置另放在稳定的实色内容面板。

- **Sizes:** 22–28px radius; 8–16px item spacing; menu rows at least 44px high
- **States:** Resting; focused or selected row; open; dismiss; keyboard navigation

### Glass Search Field

**Role:** 照片和有色场景上的搜索

圆角胶囊、至少 44px 高，外层略着色并提供柔和模糊；输入与结果文字使用深墨色，避免空心或低对比占位符。边缘高光保持静态，焦点用独立的高对比灰绿色外环表达，不以发光代替焦点反馈。

- **Sizes:** 44–52px height; capsule radius; 12–16px horizontal inset
- **States:** Empty; editing; focus-visible; clear action; results; no results; disabled

### Solid Reading Card

**Role:** 说明正文、表格与长内容

使用稳定的暖白实色面板、22–24px 圆角和 24px 内边距。最多配一条低对比中性分隔线和轻柔外阴影，不做玻璃折射，以免滚动背景干扰阅读。

- **Sizes:** 22–24px radius; 24px padding; generous text measure
- **States:** Stable reading surface; optional subtle hover when interactive

## Do's and Don'ts

### Do

- 仅把清透玻璃放在确有内容可透过的导航和控件上
- 根据亮暗背景选择白色或墨色标签，保证文字清楚
- 用一像素定向高光和轻微位移表达玻璃曲面
- 让菜单等短内容稍着色以提升对比
- 保持正文、表格和复杂信息在稳定的实色面上
- 按下约 110ms 轻压，拖动略伸展，松开约 420ms 回弹
- 尊重减少动态和减少透明度等辅助偏好
- 在无法实时折射的浏览器保留可读的磨砂表面和细高光

### Don't

- 不要用彩虹边、霓虹描边标题或彩色发光模拟折射
- 不要把清透玻璃铺满卡片、正文和整个页面
- 不要在无细节的纯色背景上铺清透玻璃
- 不要让细高光和折射损害文字、图标或焦点状态的对比
- 不要持续随机改变边框圆角；液态反馈应由交互触发
- 不要把滤镜支持视为所有浏览器一致

## Surfaces

| Level | Name | Value | Purpose |
|---|---|---|---|
| 0 | Paper canvas | `#F3F2ED` | Stable reading and content surface |
| 1 | Clear glass | `rgba(255, 255, 255, 0.12)` | Floating controls on a rich, darker scene |
| 2 | Tinted glass | `rgba(239, 245, 242, 0.86)` | Menus and short labels over a bright or detailed scene |
| 3 | Solid content | `#FCFCFA` | Long-form copy, data, and controls requiring steady contrast |

## Elevation

- **Floating control:** `0 8px 24px rgba(19, 37, 41, 0.12), inset 0 1px 0 rgba(255,255,255,0.72)`
- **Transient panel:** `0 16px 40px rgba(19, 37, 41, 0.18), inset 0 1px 0 rgba(255,255,255,0.78)`

## Imagery

给清透玻璃提供可见的背景细节：照片、低对比地貌线、色调变化或几何网格都可以。把纹理放在悬浮控制下方，让直线和细节在玻璃边缘发生轻微位移，中心则保持平静。不要用彩虹渐变、霓虹字或只靠模糊的空白单色底充当折射。

## Layout

用温暖浅纸面组织页面，以明亮细节照片、等高线或网格作为预览画布，验证深浅背景。内容按「稳定正文 → 玻璃操作层」建立层级；导航和短菜单少量悬浮，信息主体保留清晰实色底。桌面居中展示场景和底栏，窄屏将同一底栏保持为可触的胶囊控件并为系统安全区留白。

## Agent Prompt Guide

### Implementation Contract

- 以用户请求中的页面、用户任务和真实内容为依据，只实施指定范围；标明缺失的业务信息，不编造数据或能力。
- 先检查现有项目、技术栈与组件；沿用项目结构、路由和依赖，复用已有组件，不重建未要求的页面或功能。
- 沿用项目断点，调整窄屏与桌面的网格和留白；保留信息层级，避免意外横向溢出。
- 对本次涉及的交互，处理键盘焦点与减少动态效果；补齐适用的禁用、加载、空内容与错误状态。
- 完成后按项目现有脚本检查，仅报告实际运行的测试与视觉检查，并列出未验证项。

QUICK COLOR REFERENCE:

- text: `#202929`
- background: `#F3F2ED`
- scene: `#25414A`
- glassTint: `rgba(255, 255, 255, 0.12)`
- glint: `rgba(255, 255, 255, 0.72)`
- focus: `#557B79`

EXAMPLE COMPONENT PROMPTS:

1. 设计一套清透液态玻璃导航：把圆角胶囊底栏悬浮在有细线和明暗变化的照片上。使用低浓度中性表面、一像素方向高光和默认启用的 SVG 背景位移折射。由曲面法线与折射曲线生成窄边带，中心保持平坦；允许极轻色散，但不要画彩虹边框。选项至少 44px 高，文字颜色随明暗背景保持清楚。点击轻压，拖动时略微横向伸展，松开约 420ms 弹性归位；添加键盘焦点反馈并遵守减少动态效果。正文和信息卡留在暖白实色面上，菜单用更不透明的浅灰绿着色材质。实时背景折射只在 Chromium 使用，其他浏览器保留相同表面和磨砂反馈。不要使用彩虹边、霓虹文字或连续自动形变。

## Similar Brands

- **Apple Style** (`apple-style`) — 共用系统字体、克制层级与留白；液态玻璃额外加入边缘折射和跟手反馈。
- **macOS Vibrancy** (`macos-vibrancy`) — 同样让背景通过控件可见；液态玻璃在边缘加入更明确的光学曲率与弹性操作反馈。

## 必需的光学实现与参考源码

支持环境中，导航、按钮、搜索和浮层必须通过真实的背景折射渲染器显示边缘弯折，不能只输出 backdrop-blur。StyleKit 使用 components/liquid-glass/liquid-glass.tsx 与 lib/liquid-glass/optics.ts：Snell 曲面边缘、解析圆角法线、中性中心、按控件尺寸限制位移、可选微量色散以及随指针变化的细边高光。可复制的 CSS recipe 是降级外观，须搭配该渲染器。用同一位置的清透/磨砂切换和网格比较验证效果；取消手势恢复起点，键盘能完成同一操作。参考固定版本：rdev https://github.com/rdev/liquid-glass-react/tree/ac48eab18d1f7f444ae30002d240cae29c863a21；glassy https://github.com/9und30/glassy-liquid/tree/2361eb1f03979703db988180028ccc6d5fc23fe5；shuding https://github.com/shuding/liquid-glass/tree/a2d2e847f793430e3409a52927af815a23f4d372。代码均为 MIT，复制或改编须保留完整署名；StyleKit 的曲面 profile 已包含 glassy 的 MIT notice。Safari/Firefox 的实时页面 SVG backdrop 不可等同于普通 blur 支持；需要真实折射时采用显式 scene 渲染，未实现时明确降级。

## Quick Start

```css

:root {
  /* Colors */
  --color-paper: #F3F2ED;
  --color-ink: #202929;
  --color-glass-scene: #25414A;
  --color-glass-mist: #E4EFEB;
  --color-glass-glint: #FFFFFF;
  --color-focus: #557B79;

  /* Typography — Font Families */
  --font-sans: 'System UI', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --text-display: 56px;
  --leading-display: 1.05;
  --tracking-display: -0.045em;
  --text-heading-lg: 40px;
  --leading-heading-lg: 1.12;
  --tracking-heading-lg: -0.035em;
  --text-heading: 28px;
  --leading-heading: 1.2;
  --text-subheading: 20px;
  --leading-subheading: 1.35;
  --text-body-lg: 16px;
  --leading-body-lg: 1.55;
  --text-body: 14px;
  --leading-body: 1.5;
  --text-label: 12px;
  --leading-label: 1.35;
  --tracking-label: 0.025em;

  /* Typography — Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* Spacing */
  --spacing-unit: 8px;
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-48: 48px;
  --spacing-64: 64px;
  --spacing-88: 88px;

  /* Layout */
  --page-max-width: 1120px;
  --section-gap: 88px;
  --card-padding: 24px;
  --element-gap: 16px;
  --density: comfortable;

  /* Border Radius */
  --radius-buttons-and-navigation: 999px;
  --radius-search-and-segmented-controls: 999px;
  --radius-cards: 24px;
  --radius-menus-and-sheets: 28px;

  /* Surfaces */
  --surface-paper-canvas: #F3F2ED;
  --surface-clear-glass: rgba(255, 255, 255, 0.12);
  --surface-tinted-glass: rgba(239, 245, 242, 0.86);
  --surface-solid-content: #FCFCFA;
}

```
