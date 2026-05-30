# AI 协同开发全流程记录

> 本文件为"分水·寻伞"项目的 AI 协同合规材料，记录 AI 工具的应用场景、
> prompt 原文索引、AI 生成内容说明，以及**团队对 AI 产出的修改迭代对比**。
> 对应作业要求：留存 prompt 原文、AI 生成内容、团队修改迭代的对比代码。

---

## 一、AI 工具与应用场景总览

| 环节 | 工具 | 场景 | 团队后续处理 |
|---|---|---|---|
| 内容策划 | 对话式 AI | 非遗主题调研、板块拆解、文案初稿 | 核对史实、改写为最终文案 |
| 素材生成 | **GPT Image 2** | 25 张正式主题配图 | 筛选、构图复核、合规标注 |
| 前端开发 | 对话式 AI | Bootstrap 布局、JS 交互逻辑、注释 | 通读理解、修 bug、重构优化 |
| 测试文档 | 对话式 AI | 兼容性自查、README / 记录整理 | 浏览器实测、补充细节 |

---

## 二、图片素材 AI 生成记录（GPT Image 2）

- 生成工具：GPT Image 2（OpenAI 兼容接口）
- 生成数量：25 张，统一落盘于 `images/`
- **prompt 原文**：逐张完整保存于 [`docs/prompts/`](prompts/)，正式配图与文件名一一对应，另含 1 个未采用的 logo 备选 prompt
- 生成参数：Hero / 轮播 / 分隔带 / 纹理为 `1536x1024`，作品 / 工序 / 细部为 `1024x1024`，`quality=high`

| 图片 | 用途 | prompt 文件 |
|---|---|---|
| hero.png | 首页主视觉 | prompts/hero.md |
| hero-2.png | 影像分隔带 | prompts/hero-2.md |
| carousel-1/2/3.png | 光影轮播 | prompts/carousel-*.md |
| work-{peony,lotus,landscape,plum,crane,dragonphoenix}.png | 伞面影像墙 6 图（正面平视） | prompts/work-*.md |
| craft-{1-bamboo,ribs,2-thread,paste,3-paint,4-oil}.png | 工序标本 6 图 | prompts/craft-*.md |
| detail-{hub,ribs,brushes}.png | 材料细部 3 图 | prompts/detail-*.md |
| work-vine / work-bao.png | 伞面影像墙补充（缠枝莲 / 八宝） | prompts/work-vine.md / work-bao.md |
| bg-origin / bg-dark.png | 缘起 / 问答 沉浸式板块背景 | prompts/bg-origin.md / bg-dark.md |
| texture-paper.png | 宣纸纹理叠层背景 | prompts/texture-paper.md |

> **合规标注**：上述图片均为 AI 生成的**示意性艺术图像**，非真实历史照片；
> 不使用 AI 人物肖像，仅以材料、动作与纹理体现技艺本身。

> **建议补充**：答辩前在本节插入 1~2 张"prompt 输入 + 生成结果"的操作截图
> （文件放入 `docs/screenshots/`），以完整呈现 AI 生成过程。

---

## 三、团队修改迭代对比（AI 初稿 → 团队优化）

以下为开发过程中**真实发生**的若干次迭代，体现"AI 生成内容必须经团队审核、修改、优化"。

### 迭代 1 · 修复问答结算函数的拼接错误（功能性 bug）

**问题**：AI 初稿在 `renderQuizResult()` 中字符串拼接残留多余引号，并重复设置
`innerHTML`，导致结算页出现乱码文本、按钮绑定混乱。

**AI 初稿（有缺陷）：**
```js
quizBody.innerHTML =
  '<div class="quiz-result">' +
  '<div class="quiz-score">' + quizScore + " / " + quizData.length + "</div>" +
  '<p class="quiz-medal">' + medal + "</p>" +
  '<button class="btn btn-cinnabar" id="quizRetry">再答一次</button>" +' +   // ← 多余的 " +
  "</div>";
quizBody.querySelector(".quiz-result").innerHTML = /* …重复设置，逻辑冗余… */ ;
bindRetry();
```

**团队优化后：**
```js
quizBody.innerHTML =
  '<div class="quiz-result">' +
    '<div class="quiz-score">' + quizScore + " / " + quizData.length + "</div>" +
    '<p class="quiz-medal">' + medal + "</p>" +
    '<button class="btn btn-cinnabar" id="quizRetry">再答一次</button>' +
  "</div>";
// 结算后直接绑定“再答一次”，去掉冗余的二次 innerHTML 与多余函数
var retry = document.getElementById("quizRetry");
retry.addEventListener("click", function () { quizIndex = 0; quizScore = 0; renderQuiz(0); });
```
**结果**：结算页正确显示"3 / 3 · 非遗小达人"，再答按钮可用，浏览器控制台无报错。

---

### 迭代 2 · 工艺序号定位（视觉缺陷）

**问题**：AI 初稿把大号金色序号"壹贰叁肆"绝对定位在卡片右下，
与右侧描述文字重叠，影响可读性。

**AI 初稿：**
```css
.craft-step {
  position: absolute;
  top: calc(75% - 28px); right: 18px;   /* 压住了描述文字 */
  font-size: 2.4rem;
  color: var(--tung);
  text-shadow: 0 2px 12px rgba(0,0,0,.6);
}
```

**团队优化后：** 改为图片左上角的金色圆形徽标，既醒目又不占用文字区域。
```css
.craft-step {
  position: absolute; top: 14px; left: 14px;
  width: 46px; height: 46px;
  display: flex; align-items: center; justify-content: center;
  background: var(--tung); border-radius: 50%;
  font-family: var(--font-serif); font-size: 1.5rem; color: var(--ink);
  box-shadow: 0 4px 14px rgba(0,0,0,.35);
}
```
**结果**：四张工艺卡序号清晰统一，与正文无重叠。

---

### 迭代 3 · 站点 Logo 方案（素材合规 + 稳定性）

**问题**：原计划用 AI 生成透明背景 Logo，但接口多次返回 `fetch failed`；
且位图 Logo 缩放后边缘不够锐利。

**AI 初稿（HTML）：**
```html
<img src="images/logo.png" alt="标志" class="brand-logo" />
```

**团队优化后**：改用**内联 SVG 矢量图标**自绘油纸伞标记，矢量清晰、随主题色变化，
并彻底消除 `ERR_FILE_NOT_FOUND` 控制台报错；favicon 同步改为 SVG data-URI。
```html
<svg class="brand-logo" viewBox="0 0 48 48" width="32" height="32" aria-hidden="true">
  <path d="M24 5C12 5 4 14 3 23h42C44 14 36 5 24 5Z" fill="currentColor" />
  <path d="M3 23q3 5 6 0t6 0 6 0 6 0 6 0 6 0" fill="currentColor" />
  <path d="M24 5v31q0 6-6 6q-4 0-4-3" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" />
</svg>
```
**结果**：导航与浏览器标签页图标正常显示，控制台零报错。

---

### 迭代 4 · 健壮性与无障碍增强（AI 初稿未覆盖）

团队在 AI 基础代码上主动补充了以下细节：

| 增强项 | 说明 |
|---|---|
| `escapeHtml()` | 对用户留言做 HTML 转义，防止内容破坏页面结构 |
| `prefers-reduced-motion` | 尊重系统"减少动效"偏好，关闭揭示动画与 Hero 缩放 |
| 移动端导航 | 点击导航项后自动收起折叠菜单，避免遮挡内容 |
| `IntersectionObserver` 降级 | 不支持时直接显示全部内容，保证可用性 |

---

### 迭代 5 · 作品伞面图穿模修正（AI 图像缺陷）

**问题**：作品图初版采用"竖立产品图"构图，GPT Image 2 反复把伞的中轴 / 伞柄
渲染在**伞面前方且悬空**（穿模），末端凭空截断，结构明显错误。

**AI 初稿 prompt（构图导致穿模）：**
```
…a single fully-open umbrella displayed upright and centered…
（竖立 + 侧光 → 模型把伞柄画到伞面前方且悬空）
```

**团队优化后 prompt（正面平视，伞柄藏于伞后）：**
```
…viewed PERFECTLY HEAD-ON from directly in front, so the round canopy faces
the camera and fills the frame as a clean perfect circle. The shaft and handle
point directly away from the camera and are completely hidden behind the canopy —
ONLY the small central metal finial is visible. NO pole / NO handle in front of the canopy…
```
**结果**：6 张伞面均为干净的正圆伞面，仅露中心顶尖，无伞柄穿模，风格统一如博物馆图鉴。

---

### 迭代 6 · 传承人板块去 AI 人像（真实性与伦理）

**问题**：初版用 AI 生成"传承人肖像"，但虚构人物不宜代表真实非遗传承人，
且与"内容真实、尊重传承人权益"的要求相悖。

**调整**：
- 删除 `master-portrait.png`，改用**无人物的工坊场景** `workshop.png`（挂满成品伞、竹骨、颜料）。
- 页面文字客观引述真实传承人"毕六福"，但**不展示其肖像**。
- 引言改为"老师傅常念叨的一句话"，标注为民间通用说法，不冒充特定个人的原话。

**结果**：板块视觉依旧丰富，且完全规避虚构真人形象的合规风险。

---

### 迭代 7 · 整站升级为"摄影作品集 × 档案馆"（视觉系统重构）

**反馈来源**：团队评审认为初版"作品集感"不足、伞作产品图穿模、传承板块依赖图片。

**重构要点**：
- 引入**等宽字体（IBM Plex Mono）标签系统**：区块编号、Fig. 图注、英文材料证据、档案编号 Ⅷ-140，全面提升编辑/档案质感。
- 工序板块改为**左侧吸顶索引 + 右侧大图/文字左右交错记录**（含 Fig. 图注、点击放大），并从 4 道扩充为 **6 道工序**（新增制骨、裱面）。
- 作品板块由均匀卡片网格改为**错落影像墙**（feature/std/third 多尺寸拼贴）。
- 传承板块改为**纯文字 + 折叠面板**，去除人物图。
- 新增**材料细部 3 帧 + 影像分隔带 + 宣纸纹理叠层**，并加入**阅读进度条**。
- 新增 Bootstrap **Accordion** 组件；图片总数阶段性由 15 增至 21（后续迭代继续增至 25）。

**结果**：整体呈现独立摄影师作品集的高级质感，控制台零报错，全部交互实测通过。

---

### 迭代 8 · 注入氛围感 + 重设计照搬板块（视觉深化）

**反馈来源**：团队评审认为"除首页外其余板块偏朴素、缺氛围"，且早期"档案索引"板块过于贴近参考版、属照搬。

**改动要点**：
- **重设计"缘起"板块**：弃用照搬的卷宗表格，原创为**沉浸式暗场开场**——晨雾晾伞庭院大图作背景 + 玻璃质感"档案要点"卡（Ⅷ-140 / 2008 / 90+ / 有子）+ 朱砂"伞"字水印，文案全部重写。
- **问答板块改暗调沉浸**：以暗调光影大图为背景，打破中段连续浅色、建立明暗呼吸节奏。
- **轮播接入点击放大灯箱**；**影像墙由 6 帧扩充至 8 帧**（新增缠枝莲、八宝，含 feature/std/third/wide 多尺寸）。
- 新增 2 张沉浸式背景图（bg-origin / bg-dark）+ 2 张伞面，图片总数 21 → 25。

**结果**：明暗交替、虚实结合，氛围感不再只集中于首页；照搬痕迹消除，板块版式与文案均为原创。

---

### 迭代 9 · 板块过渡柔化（视觉连贯性优化）

**反馈来源**：团队评审认为各板块之间虽然内容完整，但滚动时部分边界仍显得生硬；
首次尝试把中间过场压缩为较短"薄雾桥"后，又发现板块被压短、内容节奏受影响。

**AI 初稿（有缺陷）：**
```css
.chapter-bridge.bridge-mist {
  min-height: clamp(150px, 24vh, 260px);
  margin: -34px 0 -126px;
}
.chapter-bridge.bridge-mist + .section {
  padding-top: clamp(48px, 7vw, 96px);
}
.bridge-mist .bridge-inner p {
  display: none;
}
```

**团队优化后：** 保留原有章节高度和文案层级，只在板块顶部/底部叠加暗色渐变，
并对部分过场背景加轻微虚化与雾化遮罩，让内容衔接更柔和，但不压缩任何板块。
```css
.section::before {
  height: clamp(70px, 9vw, 150px);
  background: linear-gradient(180deg, rgba(16, 11, 8, 0.86), transparent);
}
.section::after {
  height: clamp(80px, 11vw, 190px);
  background: linear-gradient(180deg, transparent, rgba(16, 11, 8, 0.88));
}
.chapter-bridge.bridge-mist {
  min-height: clamp(320px, 48vh, 540px);
  margin: -1px 0 -56px;
}
.bridge-mist .bridge-bg {
  filter: saturate(0.7) brightness(0.46) blur(1px);
  opacity: 0.62;
}
```

**结果**：板块尺寸、文案信息量与滚动节奏保持不变；边界从硬切变为暗场渐变，
桌面端与移动端均无横向溢出，浏览器控制台无报错。

---

## 四、合规自查清单

- [x] 留存全流程 prompt 原文（`docs/prompts/`，26 份：25 张正式配图 + 1 个 logo 备选）
- [x] 记录 AI 生成内容与生成参数
- [x] 提供团队修改迭代的前后对比代码（迭代 1~9）
- [x] AI 生成图片标注为示意性素材，不冒充真实照片 / 个人
- [x] 核心代码逻辑全员可讲解（JS 已逐块中文注释）
- [ ] 答辩前补充 AI 操作过程截图至 `docs/screenshots/`（待补）

> AI 仅作为辅助开发工具，不替代核心学习过程；本项目所有交互逻辑与样式细节
> 团队均能逐行解释。
