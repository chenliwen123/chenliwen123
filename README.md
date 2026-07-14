# 陈立文的多主题个人主页

一个基于 React、Vite、Less 构建的个人主页项目。页面支持默认个人主页与多个游戏主题切换，并包含独立音乐播放器、滚动显现动画、主题数据面板和可选的主题入场视频。

## 技术栈

- React 19
- Vite 8
- Less
- Three.js / React Three Fiber

## 本地开发

```bash
npm install
npm run dev
```

## 常用命令

```bash
npm run dev      # 启动开发服务
npm run build    # 构建生产产物
npm run preview  # 预览生产构建
```

## 目录说明

- `src/App.jsx`：主页主题数据、主题切换、入场视频与页面主体结构。
- `src/components/MusicPlayer.jsx`：独立音乐播放器，支持主题联动与自由播放模式。
- `src/components/HeroCharacter.jsx`：默认主页的 3D 人物展示模块。
- `src/components/AbstractVisuals.jsx`：数据环、标签云、状态点等抽象视觉组件。
- `src/styles/main.less`：全站样式与多主题视觉变量。
- `public/audio/`：各主题的本地音频资源，以静态文件方式提供，不进入 JS 打包。
- `public/models/`：3D 模型资源。
- `public/theme-intros/`：可选主题入场视频资源。

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
- **鼠标粒子拖尾**：鼠标移动时会产生主题色粒子，音乐播放时粒子更活跃。
- **访客留言墙**：留言会通过 Vercel Serverless API 直接写入 GitHub Issues，页面会读取 `chenliwen123/chenliwen123` 中带 `homepage-message` 标签的公开 Issue。

## Vercel 留言接口

页面内直接留言依赖 `api/guestbook.js`，需要在 Vercel 项目里配置环境变量：

- `GITHUB_TOKEN`：GitHub Fine-grained token，至少需要目标仓库 Issues 的读写权限。
- `GITHUB_OWNER`：可选，默认 `chenliwen123`。
- `GITHUB_REPO`：可选，默认 `chenliwen123`。
- `GITHUB_GUESTBOOK_LABEL`：可选，默认 `homepage-message`。

推荐创建 Fine-grained token，只授权 `chenliwen123/chenliwen123` 一个仓库，并开启 `Issues: Read and write`。接口会自动创建 `homepage-message` 标签；如果 token 权限不足，也可以手动在仓库里创建该标签。

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
