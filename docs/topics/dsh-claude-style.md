# dsh-claude-style —— 把 DSH 变成 Claude

> 为 DeepSeek Harness Web/桌面复刻 Claude Code Desktop 的风格与交互：配色、字体、输入框、模型选择器、像素螃蟹，一比一照搬。数据复核 2026-11-17。

**热度**：Nwflower/dsh-claude-style ⭐619；npm `dsh-claude-style`；代码 MIT。鱼皮点评：「这也太像了吧；作者调侃总有种账号随时可能被封的恐惧感」。要求 dsh ≥ 0.1.7。

## 是什么

主题皮肤插件，安装即全局生效。官方口号："在 DSH 里，就是 Claude Code Desktop 的样子。"

**三档品牌**（设置页「修改品牌标识」切换，亮暗跟随系统）：

| 档 | 亮色画布 | 暗色画布 | 强调色 | 输入框上的吉祥物 |
|---|---|---|---|---|
| Claude | 象牙白 `#FCFCFB`（侧栏 `#FBFBF9`） | 暖黑 `#141413` | 陶烬橙 `#D97757` | Claude Code 像素螃蟹 |
| DeepSeek | 天蓝亮白 `#F7FAFF`（侧栏 `#F3F7FE`） | 蓝黑 `#13161D` | 品牌蓝 `#4D6BFE` | 像素小鲸鱼 Deepy |

**复刻的交互细节**（部分）：权限分段控件（只读/编辑/自动/Yolo，档位取自宿主权限目录，第三方插件注册的档位自动出现，切换时高亮块平滑滑动）；两级模型选择器弹层+推理等级推条；「进行中/已归档」工作区分段；侧栏搜索面板（桌面 Ctrl+K / Web Ctrl+Alt+K，搜会话内容/项目/插件/Skill/快捷键，命中句加粗）；像素螃蟹的钓鱼动画逐帧照搬 Claude Code；DeepSeek 档的 Deepy 小鲸鱼 20 个动画跟随智能体工作状态（思考冒云、写码敲键盘、双会话戴耳机、三会话戴安全帽砌砖、压缩上下文吸碎片、失败冒烟、完成空翻撒彩纸、闲一分钟戴睡帽睡觉）。

**工作台用量面板**：新会话页 480px 窄栏——六数字格 + 26 周按天热力图 + 按模型堆叠柱状排行；用量超一本书时出现「倍数趣味行」（书目 65 本，从《道德经》到《追忆似水年华》）。数据来源：装了 [dsh-cost-meter](dsh-cost-meter.md) 就直接读它的账本缓存（只读），否则读本机会话日志自己算并增量缓存。

## 安装与停用

```bash
dsh plugin --profile web add dsh-claude-style            # npm 包（推荐）
dsh plugin --profile web add Nwflower/dsh-claude-style   # GitHub 源
```

同一时刻只启用一个主题；装完**重启 `dsh web`** 刷新生效。临时停用（不停用安装）在 `~/.dsh/profiles/web/cordis.patch.yml` 加：

```yaml
- id: ui-skin-claude-style
  disabled: true
```

保存约 1 秒热生效，刷新页面回到原生外观。卸载 `dsh plugin --profile web remove dsh-claude-style`。

## 风险与版权边界（重要）

- **Anthropic 字体不随 npm 分发**：Anthropic Sans/Serif 版权归 Anthropic，仓库 `fonts/` 供下载、「仅供个人使用，不适用 MIT 许可」；JetBrains Mono（代码字体）无此问题。要装就手动放系统或插件 `fonts/` 目录。
- 复刻的是**界面观感**，不涉及 Claude 模型或服务；但把 DSH 伪装成 Claude 产品对外展示（截图发帖、商用演示）的商标/商誉风险自担——鱼皮那句"账号随时可能被封"是玩笑，边界意识是真的。
- 皮肤层与宿主 UI 耦合深（输入框/侧栏/标题栏都重做）——DSH 大版本升级后主题可能短期错位，看作者更新节奏。
- 同作者生态：dsh-skin-manager（多主题一键切换）、dsh-chat-import（把 Claude Code/Codex 会话历史导入 DSH 接着聊）。

## CC 对照

本身就是"CC 对照本尊"：想给同事演示"Claude Code 长什么样"或从 CC 迁移过来找熟悉感（见[迁移实战](dsh-migration-from-claude-code.md)），装它最快；功能上 DSH 该是什么还是什么，主题只换皮不换芯。

## 出处

- https://github.com/Nwflower/dsh-claude-style（README，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 盘点 · 本站《[12 个超火插件盘点](dsh-top12-plugins.md)》
