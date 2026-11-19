# dsh-ppt —— 一句话做 PPT

> 一句话或一篇 Markdown → HTML 网页放映 + 可编辑 PPTX 三件套：5 套主题、7 种页型、转场动画、演讲者备注。纯 Node 零运行时依赖。数据复核 2026-11-17。

**热度**：STARDUSTLC666/dsh-ppt ⭐37、npm `dsh-ppt`、Awesome DSH Plugin 收录；MIT。鱼皮实测：「同时交付网页版和可编辑 PPTX，含演讲者备注，全程仅 **2 毛钱**；有小瑕疵（标题断字）需手动微调」。

## 是什么

DSH 演示文稿**技能+工具**插件：`ppt_create` 把 Markdown/结构化 slides 变成 `*.html` + `*.pptx` + `*.json` 三件套，`ppt_themes` 列主题。在 `@deepseek-ai/dsh@0.1.2-alpha.3` 上全量冒烟验证（2026-09-01）。

| 能力 | 说明 |
|---|---|
| 7 种页型 | 封面 / 章节 / 要点 / 核心观点 / 金句 / 表格 / 结束页 |
| 演讲者备注 | `<!-- 备注: ... -->` 或 `notes` 字段：HTML 按 `S` 呼出，PPTX 原生备注页（演示者视图） |
| 动效 | 默认开：HTML 页间淡入+要点逐条入场；PPTX 原生转场+点击显现；`motion: 'off'` 产纯静态 |
| Markdown 规则 | 第一个 `#` → 封面；`##` → 一页；只有一句话 → 自动生成「封面→核心观点→结束页」三页最小结构 |
| 跨 harness | `skills/dsh-ppt/` 复制到 Claude Code / Cursor / Gemini CLI / Codex 即可裸用（同一 deck-core 引擎，效果一致） |

## 安装与使用

```bash
dsh plugin --profile web add dsh-ppt    # 重启后 ppt_create / ppt_themes 生效
```

```
ppt_themes                       # 看 5 套主题
ppt_create { title, content, theme, lang }
```

- **5 套主题**：`data` 数据漂移（默认，AI/技术发布）/ `swiss` 瑞士脉冲（数据/SaaS）/ `velvet` 天鹅绒标准（高管汇报/融资）/ `soft` 柔和信号（品牌/培训）/ `bold` 极繁大字（产品发布/活动）。视觉引擎复用 hyperframes 风格库，HTML 与 PPTX 同源同色。
- HTML 放映键：方向键/滚轮/触屏翻页，`F` 全屏，`G` 总览，`P` 打印/另存 PDF。
- 可选配置：`outputDir`（默认会话工作目录）、`maxSlides`（默认 60，3–120）、`defaultTheme`、`defaultLang`（zh/en/bilingual）；环境变量 `DSH_PPT_OUTPUT_DIR`。

## 工程质量与已知限制

- 纯 Node 零运行时依赖：OOXML 与 zip 手写（node:zlib），无 eval / child_process / 密钥，产物只写指定目录；技能与工具共用一个引擎，不会"DSH 一个效果、裸技能另一个效果"。
- 已知限制（README 自述）：PPTX 用空白版式+文本框实现（可编辑文字，但无智能母版占位符）；`bilingual` 只双语化播放器界面、不翻译内容；**暂不支持图表与图片**（v0.2+ 规划）——鱼皮看到的"标题断字"这类小瑕疵需手动微调。
- 卸载：`dsh plugin --profile web remove dsh-ppt` 后重启 Web 服务。

## CC 对照

- CC 无官方 PPT 技能；本插件提供**裸 SKILL.md 形态**可直接搬进 CC 技能目录——same engine，跨 harness 一致。作者还有同族插件：dsh-hyperframes（HTML 视频）、dsh-remotion（React 视频）、dsh-email。
- 本站视角：交付"网页放映 + 可编辑 PPTX"双产物、2 毛钱级别的成本，属于[成本与模型选择](dsh-cost-and-model-selection.md)里"便宜量足"的典型工具；正式汇报前仍建议人工过一遍版式。

## 出处

- https://github.com/STARDUSTLC666/dsh-ppt（README，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 盘点 · 本站《[12 个超火插件盘点](dsh-top12-plugins.md)》
