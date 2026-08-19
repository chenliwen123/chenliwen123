# 陈立文的多主题个人主页

一个基于 React、Vite、Less 构建的个人主页项目。页面支持默认个人主页与多个游戏主题切换，并包含独立音乐播放器、滚动显现动画、主题数据面板和可选的主题入场视频。

## 技术栈

- React 19
- Vite 8
- Less
- Three.js / React Three Fiber

## 本地开发

前任聊天不依赖 Vite 代理。先把 `.env.example` 复制为 `.env.local`，填写 `OPENAI_API_KEY`，然后运行：

```bash
npm install
npm run dev
```

Vite 不配置任何 `proxy`。开发时，`/api/ex-chat` 由 Vite 中间件直接处理，因此只需要运行一个 `npm run dev`；留言、站点统计和更新日志仍需要实际部署平台提供对应的 `/api/*`。

## 常用命令

```bash
npm run dev      # 启动开发服务
npm run build    # 构建生产产物
npm run preview  # 预览生产构建
```

## 目录说明

- `src/App.jsx`：主页主题数据、主题切换、入场视频与页面主体结构。
- `src/components/MusicPlayer.jsx`：独立音乐播放器，支持主题联动、自由播放、播放列表与音量记忆。
- `src/components/ExChatWidget.jsx`：前任聊天窗口、完整聊天记录和长期记忆的本地持久化。
- `src/components/HeroCharacter.jsx`：默认主页的 3D 人物展示模块。
- `src/components/AbstractVisuals.jsx`：数据环、标签云、状态点等抽象视觉组件。
- `src/styles/main.less`：全站样式与多主题视觉变量。
- `public/audio/`：各主题的本地音频资源，以静态文件方式提供，不进入 JS 打包。
- `public/models/`：3D 模型资源。
- `public/theme-intros/`：可选主题入场视频资源。
- `public/ex-persona.md`：前任人物档案，可直接修改基础信息、性格、共同回忆和说话方式。

## 前任聊天与记忆

- 人物档案从 `public/ex-persona.md` 加载；文件读取失败时，组件会使用内置的默认档案。
- 服务端会从人物档案各分区摘取关键条目组成紧凑提示，避免兼容接口因长提示迟迟不返回；修改姓名、性格、关系、共同回忆和说话方式仍会生效。
- 每条用户和助手消息都会保存到浏览器 `localStorage`，刷新页面或下次打开时会恢复完整记录。
- 模型每轮会返回一组精简的长期记忆，保存用户明确表达的称呼、喜好、近况、共同约定和关系边界。
- 请求模型时只携带长期记忆和最近 12 条消息，完整记录仍保留在本地，避免上下文随着聊天无限增长或触发兼容接口超时。
- 点击聊天窗口右上角的清空按钮，会同时删除完整聊天记录和长期记忆。
- 当前持久化只作用于同一浏览器和同一域名，不会自动跨设备同步。

浏览器只请求同源 `/api/ex-chat`，再由服务端连接 DeepSeek/OpenAI 兼容接口。它不是 Vite 代理，也不会把 API Key 放进前端构建。需要在 `.env.local` 中配置：

- `OPENAI_API_KEY`：必填，聊天模型 API 密钥。
- `OPENAI_MODEL`：可选，默认 `deepseek-v4-flash`。
- `OPENAI_BASE_URL`：可选，默认 `https://api.deepseek.com`，也可填写 Chat Completions 兼容地址。
- `OPENAI_PROXY_URL`：可选，服务端访问模型时使用的 HTTP/HTTPS CONNECT 代理，例如 `http://127.0.0.1:7890`。适用于浏览器或 PowerShell 能访问模型、但 Node 直连失败的本地网络环境。
- `OPENAI_ALLOW_INSECURE_TLS`：可选，默认 `false`。仅当自签名代理由你控制且完全可信时设为 `true`；它会在正常证书校验失败后关闭校验重试，正式环境优先更换为有效 HTTPS 证书。

如果使用的本地代理会在约 15 秒没有收到上游数据时断开连接，优先选择响应更快的轻量模型；当前本机配置使用 `gpt-5.4-mini`。代理链路遇到连接复位或超时时，服务端会自动重试一次。

为了兼容已有配置，开发接口也能读取旧的 `VITE_OPENAI_*` 变量，但建议迁移到不暴露给浏览器的 `OPENAI_*` 变量。修改 `.env.local` 后需要重新启动 `npm run dev`。

如果本机 DNS 把 `api.deepseek.com` 解析到不可达节点，聊天服务会组合可信 DNS 和已验证的 DeepSeek CDN 候选节点，逐个发起保持 Host/SNI 与证书校验的请求，并短期缓存成功节点，不需要修改系统 DNS。

## 主题指挥台

顶部主题栏右侧有一个“指挥台”入口，也可以使用快捷键打开：

- `Ctrl + K` / `⌘ + K`：打开或关闭主题指挥台。
- `1` - `6`：在指挥台中快速切换对应主题。
- `R`：随机传送到一个不同主题。
- `Esc`：关闭指挥台。

指挥台会展示当前主题状态、音乐联动开关、主题雷达和所有可启动主题，适合在演示页面时快速切换氛围。

指挥台里还集成了三组交互功能：

- **音乐可视化 HUD**：播放音乐后，左下角 HUD、节拍柱和页面光效会进入声波同步状态。
- **主题成就系统**：打开指挥台、切换主题、播放音乐、浏览到底部等操作会解锁成就，并保存到本地。
- **自定义主题工坊**：可以启用自定义能量色、切换预设、调节光效强度，设置会通过 `localStorage` 保存。
- **背景环境切换**：可在星云深空、赛博雨夜、战术网格、熔火余烬之间切换，并保存到本地。

## 游戏化扩展

- **页面启动 Boot Loader**：首次进入页面会显示游戏启动器式加载界面，之后通过 `localStorage` 记住已看过。
- **主题任务简报**：每次切换主题都会展示对应的任务简报卡，按 `Esc` 或点击按钮关闭。
- **鼠标粒子拖尾与星空背景**：鼠标移动时会产生主题色粒子，音乐播放时粒子和星光更活跃。
- **访客留言墙**：留言会通过 Vercel Serverless API 直接写入 GitHub Issues，页面会读取 `chenliwen123/chenliwen123` 中带 `homepage-message` 标签的公开 Issue，并支持成功弹窗、加载更多、相对时间、头像、置顶和本地防刷。
- **访客计数与点赞**：`api/site-stats.js` 会把总访问、今日访问和点赞数同步到 GitHub Issues 中的隐藏统计 Issue。
- **今日状态与时间线**：主页展示当前状态、最近更新和后续 Roadmap。
- **自动节日彩蛋**：按北京时间自动匹配节日日期，显示节日氛围卡和主题预览入口。
- **精准天气同步**：访客授权浏览器定位后，页面会用 Open-Meteo 获取实时天气、日出和日落，并按天气/昼夜自动切换主题氛围。
- **自动更新日志**：`api/changelog.js` 会读取 GitHub 最近提交，主页自动展示仓库更新。
- **隐藏彩蛋**：页面非输入框状态下键入 `CHEN`，会触发星轨彩蛋动画。

## Vercel 接口

页面内留言、统计和更新日志依赖 `api/guestbook.js`、`api/site-stats.js`、`api/changelog.js`，需要在 Vercel 项目里配置环境变量：

- `GITHUB_TOKEN`：GitHub Fine-grained token，至少需要目标仓库 Issues 的读写权限。
- `GITHUB_OWNER`：可选，默认 `chenliwen123`。
- `GITHUB_REPO`：可选，默认 `chenliwen123`。
- `GITHUB_GUESTBOOK_LABEL`：可选，默认 `homepage-message`。

推荐创建 Fine-grained token，只授权 `chenliwen123/chenliwen123` 一个仓库，并开启 `Issues: Read and write`。接口会自动创建 `homepage-message` 和 `homepage-stats` 标签；如果 token 权限不足，也可以手动在仓库里创建对应标签。

天气同步不需要服务端密钥。浏览器定位只在访客本机授权后使用，经纬度会直接请求 Open-Meteo，不会写入 GitHub Issues 或项目后端。

## 音乐资源

音乐文件放在 `public/audio/`，播放器通过 `/audio/*.mp3` 静态路径加载。这样构建后的 JS 里不会混入大体积 mp3，也方便你直接替换同名文件更新背景音乐。

当前使用的文件名：

- `lol-theme.mp3`
- `delta-theme.mp3`
- `cs2-theme.mp3`
- `overwatch-theme.mp3`
- `valorant-theme.mp3`

## 主题入场视频

如果希望切换到游戏主题时自动播放全屏入场视频，把视频放到 `public/theme-intros/` 并使用以下文件名：

- `lol-intro.mp4`
- `delta-intro.mp4`
- `cs2-intro.mp4`
- `overwatch-intro.mp4`
- `valorant-intro.mp4`

项目会先检测对应文件是否存在，存在时才展示入场视频；没有视频文件时会直接切换主题。

## 性能说明

默认主页的 3D 人物模块体积较大，项目会在浏览器空闲后再加载它，并在用户开启省流量或减少动态效果时保留轻量介绍卡片，避免拖慢首屏显示。

