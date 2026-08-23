# DeepSeek Harness（dsh）专题概览

> 调研时间：2026-08-23 · 信息来源：官方 GitHub + 多家媒体报道

## 一、是什么

**DeepSeek Harness（dsh）** 是 DeepSeek 于 2026-08-13 晚开源的首款 Agent 框架（v0.1 Developer Preview，MIT 协议）。

- 官方定位公式：**Model + Harness = Agent**——模型负责思考推理，Harness 负责执行调度
- 背景：对标 Claude Code，"做 DeepSeek Code Harness"（DeepSeek 资深研究员陈德里）
- 同期发布：DeepSeek-V4-Pro-0813 正式版（Agent 能力对标 Claude Opus 4.8 / Fable 5）

## 二、核心设计："一切皆插件"

基于 **Cordis 插件元框架**构建：
- 模型、工具、技能、会话、沙箱、存储、循环、调度、UI **全部是插件**
- Cordis 只管插件加载/卸载和依赖关系，所有组件通过服务与事件协作
- 配置层自由组装，无需改源码

## 三、四种运行模式

| 模式 | 用途 |
|------|------|
| Standard | 全套工具，通用开发 |
| PTC（Programmatic Tool Calling） | 模型生成代码编排多轮工具链 |
| Minimal | 仅 Shell + 文件编辑，最小环境基线测试 |
| Creative | 运行时检查、内存调试插件、自定义新模式 |

## 四、快速上手

环境要求：Node.js 22.19+ 或 24+，npm/npx

```bash
# Web UI 一键启动（默认 http://127.0.0.1:3080）
npx @deepseek-ai/dsh web

# 源码方式
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness && pnpm install && pnpm run build && pnpm dsh web
```

Python SDK（Python 3.10+）：

```python
from deepseek_harness import DeepSeekHarness
with DeepSeekHarness(provider="deepseek-official", model="deepseek-v4-flash", ...) as h:
    h.run("检查仓库并修复失败的测试。")
```

API Key 申请：https://platform.deepseek.com

## 五、注意事项

- ⚠️ v0.1 开发者预览版，接口会有 breaking changes
- ⚠️ DeepSeek API 8/17 起峰谷定价（V4-Pro 高峰输出 ¥27/M tokens），学习期建议用 v4-flash
- 插件开发链路：apply → inject → ctx.tools.register(defineTool) → patch 挂载
- 排错三板斧：`--dump-config` + Trajectory + 检查 next()/effect

## 六、关键链接

- GitHub：https://github.com/deepseek-ai/deepseek-harness
- 官网：https://www.deepseek.com/harness/
- 架构文档：https://deepseek-harness.github.io/deepseek-harness/reference/
- 第一个插件教程：https://deepseek-harness.github.io/deepseek-harness/develop/basic/
- Cordis 教程：https://deepseek-harness.github.io/deepseek-harness/develop/cordis-tutorial/
- 社区插件：https://github.com/topics/dsh-plugin
