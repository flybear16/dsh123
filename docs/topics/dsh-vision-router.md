# dsh-vision-router —— 免费识图路由

> 给纯文本的 DSH agent 装上"眼睛"：内置一条免 key 的免费视觉链 + 14 个像素级视觉工具，图像回合按普通工具调用工作。数据复核 2026-11-17。

**热度**：鱼皮 2026-11-06 盘点实用组第 3（「类似 ModLens 但内置了一条免费的识图通道，装上就能直接用，新手友好；实测识图准确靠谱」）。

## 是什么

[ysr666/dsh-vision-router](https://github.com/ysr666/dsh-vision-router)（⭐1.3k，v3.3.0，2026-11-16 发版）：MIT；QQ 群 1105463028；AtomGit 有中国镜像；收录徽章 dsh-recommend certified / dshbase install-tested。核心思路：**视觉模型只是"眼睛"，DeepSeek 始终是"大脑"**——图像回合不被一次性答案劫持，DeepSeek 拿到视觉结果后继续推理。

## 能力速览

| 类别 | 能力 |
|---|---|
| 路由 | capability-aware Auto 路由（绝不凭模型名猜能力）；routingPreference balanced/quality/speed/local |
| 基准 | Test Vision 单请求验证；Quick(~3 请求)/Full(~6 请求) 基准 |
| 分辨率 | 原图分辨率回答（像素预算 4,000,000，超限自动降采样） |
| 容错 | 分类故障自动 failover（region/tos/quota/429/context/network），429 立即切下一后端并按 Retry-After 冷却 |
| 记忆 | 图像答案按内容哈希缓存（TTL 3600s、上限 200 条） |
| 像素闭环 | `vision_html_screenshot` → `vision_pixel_diff` 可验证 UI 改动（README 示例差异 2.54% = 32,939/1,296,000 像素，阈值 16/通道） |
| 工具 | 14 个常驻注册（bootstrap/describe/materialize/ground/detect/crop/present/pixel_diff/colors/ocr/trace/extract_foreground/html_screenshot/long_screenshot_ocr）+ 可选 vision_screenshot（隐私开关）——启动即注册全部以保持稳定 tool schema，不打爆 KV/prefix cache |

## 免费通道与安装

- **fallback 链**：用户视觉模型 → 本地 Ollama → LM Studio → 自定义 httpProviders → **内置匿名 OVH 兜底**（Qwen3.5-397B-A17B → Qwen2.5-VL-72B-Instruct → Qwen3.6-27B → Qwen3.5-9B）。OVH 匿名限额 2 请求/分钟/IP/模型，四模型独立桶理论约 8 RPM——免费但别当生产吞吐用。
- 安装：`npx @deepseek-ai/dsh plugin --profile web add dsh-vision-router`（Desktop 换 `--profile desktop`）。要求 DSH >=0.2.1-rc.5 <0.3.0-0（推荐 0.2.2-rc.1）、**Node >=24.9.0**；Chrome/Chromium/Edge 仅 `vision_html_screenshot` 需要。排错：`npx dsh-vision-router repair --profile web` / `doctor`。
- 配置在 Settings → Vision Router 或 cordis.patch.yml，均有默认值（默认 vision-http / ovh/Qwen2.5-VL-72B-Instruct，textProvider 默认 deepseek-official/deepseek-v4-pro；`freeFallback true`）。管线基于 sharp / VTracer / tesseract / 系统 Chrome。

## 风险（README 加粗警告）

- **"Data leaves your machine by default"**——免 key ≠ offline：默认链路的图像要出机器到云端视觉模型，**机密/涉密材料勿走云链**；要严格本地需开 Local-only vision 并配本地 chat 模型。
- 旧式手动 cordis.patch.yml 与 `dsh plugin add` 混装会双重注册导致启动失败；与 dsh-web-ui 同装需关 interceptImageSend；图像内文字一律视为不可信证据（提示注入面）。
- Mistral Small 3.2 已于 2026-11-04 退役；Oh-DSH ≤0.1.5 需装 v1.4.2+。

## CC 对照

- 社区 modlens 复用本地 Claude Code/Codex/OpenCode/Pi 登录当视觉引擎；本项目自带 provider 链、不依赖任何其它本地 CLI。设计源流致谢 Anionex/agent-vision-toolkit。
- CC 本体已有原生视觉；这个插件补的是 **DeepSeek 文本模型 + 免费视觉后端**的组合——对[成本与模型选择](dsh-cost-and-model-selection.md)路线是"识图不花钱"的抓手。

## 出处

- https://github.com/ysr666/dsh-vision-router（README，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 盘点 · 本站《[12 个超火插件盘点](dsh-top12-plugins.md)》
