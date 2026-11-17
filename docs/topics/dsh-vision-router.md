# dsh-vision-router —— 免费识图通道

> 给纯文本的 DSH agent 装眼睛：内置免费视觉链（免 key 免 Python）+ 14 个像素级视觉工具。数据复核 2026-11-17。

## 是什么

[ysr666/dsh-vision-router](https://github.com/ysr666/dsh-vision-router)（⭐1,282）。官方一句话：Eyes for text-only DeepSeek Harness agents——DeepSeek 负责思考，视觉链负责看。装后在输入框模型选择器旁出现 **👁 Vision** 开关，图片轮次像普通工具调用轮次一样工作（grounded、可度量、可复现）。

14 个深度工具：视觉问答、grounding、裁剪、像素 diff、取色、OCR、SVG 描摹、抠图、截图等。

## 安装

```sh
npx @deepseek-ai/dsh plugin --profile web add dsh-vision-router
```

- 版本要求严：DSH `>=0.2.1-rc.5 <0.3.0-0`、Node ≥ 24.9.0
- 升级 v3.4.0 前按仓库指引做 profile 备份 + 只读 `doctor --upgrade-preflight`，保留 v3.3.0 可回滚

## 实测（鱼皮 11-06）

截了一张面试鸭首页题库列表，问：Java 后端求职、最多两周准备，图里题库优先刷哪 3 个？30 秒后回答：准确数出 9 个题库、5 个与 Java 后端直接相关、4 个 AI 向，推荐 Java 热门面试题 200 / Java 并发 / JVM。靠谱。

## ⚠️ 数据出境（README 原文 CAUTION）

- **默认数据出机**：走云视觉模型时，图片（或衍生裁剪）、视觉提示与请求元数据会发给该 provider
- 新装默认启用**匿名 OVHcloud 视觉兜底**——「免费、免 key」**不等于**离线
- 机密/合规/涉密材料**不要**走云链；需严格本地方案时开 strict local-only，或 opt-in 本地 OCR（复用系统 Tesseract `chi_sim`+`eng`，或按需装 SHA 校验的 Tesseract.js/WASM 引擎）

## 对照与注意事项

- **ModLens**（此前流行的识图插件）同思路但要自备视觉模型 API Key；vision-router 胜在开箱即用，代价是数据出境默认开
- 徽章：dsh-recommend 认证 + dshbase install-tested + DeepGuard 审计（注意：审计对应历史 v2.0.1，不代表当前版本）

## 出处

- https://github.com/ysr666/dsh-vision-router（README，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 实测，见《[Top 12 总表](dsh-top12-plugins.md)》
