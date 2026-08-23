# 全网都在推 DeepSeek Harness 插件！skill 还有必要装吗？

> 来源：WaytoAGI 飞书文档（AI早高峰 摘要转载，2026-08-21）
> 原文：https://mp.weixin.qq.com/s/-lYVYxeSozbZKbQ3fu0ZqQ
> 存档时间：2026-08-23

## 前言

最近 dsh 非常火，开源不到 48 小时就破了 10 万 Star，创下 GitHub 史上最快涨星纪录💹

DeepSeek Harness（简称 dsh）是 DeepSeek 于 2026 年 8 月 13 日开源的 Agent 框架，口号是「一切皆插件」。

截至目前，全网都是 dsh 相关教程的文章，火了大半年的「必装 skill」文章，被「dsh 必装插件」取而代之。好像 skill 被「插件」这个词吞掉了。那么：

- dsh 中 skill 还存在吗？
- 现在以什么形式存在？
- 以前给别的 agent 装的 skill，dsh 还能用吗？

## 01 · 先聊聊 dsh 的能力缺口在哪？

「一切皆插件」的意思是：开箱状态下，这是个**毛坯房**，没有冰箱彩电（丰富的插件），还不能让你「拎包入住」（直接上手用）。所有插件和能力靠你自己组装，比如需要看图片、换皮肤、有记忆、连浏览器。一装一个不吱声。

Agent 框架前辈们（WorkBuddy、Codex、Claude Code 等），都是**集成好的产品**，模型、工具、执行循环、UI 耦合在一起，你拿到手的是厂商配好的那一套。

然而 DeepSeek Harness 把这件事推到尽头，它的插件能替换的，包括核心模型、工具箱、规则、甚至整个 UI。别的产品是「在核心外面加东西」，它是「连核心本身都能换」。

（02 节核心结论）因此，DSH 中的 skill 依然存在，但它**不是插件，也不是与插件并列的另一套执行机制**。它更接近于插件生态中的**指令层**：由插件系统负责发现、注册、加载，并在需要时提供给模型。

所以，插件和 skill 并不冲突，而是**互补关系**：

- **插件**：解决「能做什么」——提供能力和运行时
- **skill**：解决「怎么做」——提供流程、指令和使用规范

## 03 · dsh 的 skill 格式有什么不同？

dsh 的 skill 也是一个带 YAML frontmatter 的 Markdown 文件，和 Anthropic 给 Claude Code 定义的是**同一套契约**。

两种合法的 skill 形态：

```text
skills/
  kimi-webbridge/
    SKILL.md    ← 目录包，主文件加 references/、scripts/
  quick-note.md ← 扁平文件，单文件技能
```

⚠️ 注意事项：按官方 skills 子系统文档的说明，**确定不支持递归发现**。dsh 只认根目录下的子目录和扁平文件，把技能藏进二级子目录就找不到了——这是一个容易被忽略的细节。

## 04 · skill 安装在哪？

| 优先级 | 路径 | 什么时候用它 |
|:---:|------|------|
| 200 | 项目/.agents/skills | 技能只属于这一个仓库，需要随仓库一起走 |
| 500 | ~/.agents/skills | 技能是你个人使用的，其他 Agent 框架也要用 |

最快的落地方式：把技能目录放进 `~/.agents/skills/`，dsh 启动时**自动扫到，不需要任何配置**。而且安装一份 skill，两个 agent 都能看见——这就是 skill 比插件灵活的地方。

## 05 · 以前用过的 skill，dsh 能用吗？

放心，**无脑迁移**～

例：装了 kimi-webbridge skill 在 `~/.claude/skills/kimi-webbridge`，想让 dsh 也用上：

```bash
mkdir -p ~/.agents/skills
cp -r ~/.claude/skills/kimi-webbridge ~/.agents/skills/
```

拷贝完成，重启 dsh。输入 kimi-webbridge 就出现在命令面板的 Skills 分组里。

实用规则：在 Claude Code / Codex 写过的 skill，**原样丢给 dsh 试一遍**，大概率不用修改。

## 06 · 彩蛋 · 亲测好用的 9 个 dsh 插件

先装 **dsh-plugin-store**（装插件的插件，也是唯一要敲命令的）：

```bash
dsh plugin --profile web add github:0xKcyzz/dsh-plugin-store
```

装好后设置里就有插件商店，剩下 8 个全在商店搜名字一键装。优先级三档：

1. **最该先装**：插件商店、better-sidebar（日常工作的台子）、modlens（给纯文本模型配眼睛）
2. **用到再装**：dsh-office、dsh-turn-rewind 这类
3. **最后**：皮肤、宠物这些花活

⚠️ 装完记得重启。如果没生效，重启 dsh 或强刷新页面。

## 写在最后

「一切皆插件」并没有吞掉 skill，它只是**换了个地方继续发光**。插件解决能力，skill 沉淀流程，插件生态再热闹，也替代不了你验证过的那套打法。

**skill 不是过时资产，是现成的弹药库。** 全网都在装插件的时候，把你吃灰的 skill 搬进 dsh，可能是性价比最高的一步。

---

*关键词：#DeepSeek #DeepSeekHarness #DSH #dsh*
