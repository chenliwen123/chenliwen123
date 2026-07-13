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
- `assets/`：各主题的本地音频资源。
- `public/models/`：3D 模型资源。
- `public/theme-intros/`：可选主题入场视频资源。

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

