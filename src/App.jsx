import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MusicPlayer from './components/MusicPlayer';
import RevealSection from './components/RevealSection';
import { DataRing, GeoIndicator, ModeVisual, FloatingTagCloud } from './components/AbstractVisuals';
import ExChatWidget from './components/ExChatWidget';

const HeroCharacter = lazy(() => import('./components/HeroCharacter'));

const publicAsset = (path) => `${import.meta.env.BASE_URL}${path}`;

const themes = {
  default: {
    key: 'default',
    badge: 'PERSONAL HOMEPAGE / WARM WEB PRESENCE',
    title: '陈立文',
    titleSub: '把前端页面做得更有温度，也更有记忆点。',
    lead:
      '我目前在长春，喜欢把内容表达、视觉节奏和交互细节放进同一张网页里。这个主页延续暖色调与杂志感，同时我把音乐模块独立出来，方便后续扩展更多游戏主题。',
    modeLabel: '默认主页',
    spotlightTitle: '做一个能代表自己的主页',
    spotlightDesc: '不是一张普通的资料卡，而是一张带有氛围、节奏和个性的数字名片。',
    spotlightMeta: [
      ['关键词', '表达感 / 细节 / 节奏'],
      ['气质', '暖色、克制、带一点戏剧性'],
    ],
    modeCardTitle: '默认主页 / Personal Base',
    modeCardDesc: '这是你的基础主场，适合承载个人介绍、作品表达和后续所有主题的入口切换。',
    modeCardMeta: [
      ['切换方式', '顶部 Theme Switch'],
      ['内容节奏', '温暖、舒展、偏杂志感'],
    ],
    aboutTitle: '让网页像自我介绍一样，有重点，也有气氛。',
    aboutCards: [
      ['01', '内容优先', '我喜欢先想清楚页面要表达什么，再决定排版、层次和动效，而不是只堆组件。'],
      ['02', '细节驱动体验', '从留白、字重、按钮反馈到动线安排，真正让页面有记忆点的，往往是这些细小部分。'],
      ['03', '愿意让作品更完整', '一个主页不只是一段文字和链接，也可以有音乐、氛围和更鲜明的情绪表达。'],
    ],
    focusTitle: '我更在意这些方向。',
    focusPanels: [
      ['VISUAL NOTES', '有温度的颜色关系。', '页面以深酒红、焦糖橙、奶油白和一点橄榄绿为主，让整体更像一本正在展开的个人作品集。', true],
      ['INTERACTION', '动效克制，但不无聊', '保留渐入、悬浮、唱片旋转和节拍条动画，让页面在安静里有节奏。'],
      ['MUSIC', '播放器组件化', '音乐控制与主题内容解耦，后续增加更多游戏主题时不用重复改播放器。'],
    ],
    tags: ['Personal Branding', 'Motion Details', 'Warm Editorial Layout', 'Interactive Music', 'Responsive Experience', 'Frontend Presence'],
  },
  lol: {
    key: 'lol',
    badge: 'LEAGUE OF LEGENDS / SUMMONER PROFILE',
    title: '英雄联盟',
    titleSub: '把峡谷热血、排位目标和个人偏好，做成一张更有冲击力的主题主页。',
    lead:
      '这是你的游戏主题主页雏形：我保留音乐模块独立运行，同时把主视觉切换成更锋利的光效、金属边框与能量冲击，让切换瞬间更有“进入另一个世界”的感觉。',
    modeLabel: 'LOL 主题',
    spotlightTitle: '召唤师名片 / 峡谷主场',
    spotlightDesc: '从常用位置、英雄池、排位态度，到喜欢的游戏氛围，都可以逐步扩展成一个系列化主题。',
    spotlightMeta: [
      ['主题气质', '史诗感 / 冲击感 / 金色能量'],
      ['扩展能力', '后续可接更多游戏主页'],
    ],
    modeCardTitle: '峡谷主页 / Rift Mode',
    modeCardDesc: '切进这个世界时，视觉语言会更锋利、更明亮，也更像真正进入一张游戏主题名片。',
    modeCardMeta: [
      ['切换方式', '顶部 Theme Switch'],
      ['内容节奏', '冲击、发光、偏战场感'],
    ],
    aboutTitle: '这个主题页先展示你的英雄联盟主场介绍。',
    aboutCards: [
      ['01', '主打冲击感', '通过高对比冷金配色、发光描边与大幅背景能量层，建立强烈的切换落差。'],
      ['02', '内容可持续扩展', '后续可以继续接入常玩英雄、段位记录、赛季目标、战绩入口等模块。'],
      ['03', '音乐与内容解耦', '无论切到哪个游戏主题，播放器都保持同一位置与状态，不会中断体验。'],
    ],
    focusTitle: '英雄联盟主题的首批展示方向。',
    focusPanels: [
      ['RIFT STYLE', '像进入召唤师峡谷一样切换', '切换时叠加能量扫光、景深缩放和高光边缘，让转场更有爆发力。', true],
      ['PROFILE', '你可以展示自己的打法标签', '例如：偏好分路、主玩英雄、开黑风格、擅长团战还是运营。'],
      ['SERIES', '为后续更多游戏主题预留结构', '现在先做 LOL，后面可以平滑扩展到无畏契约、原神、CS、独立游戏等主题。'],
    ],
    tags: ['League of Legends', 'Summoner Intro', 'Game Theme System', 'Impact Transition', 'Theme Switch', 'Expandable Structure'],
  },
  delta: {
    key: 'delta',
    badge: 'DELTA FORCE / TACTICAL DROP ZONE',
    title: '三角洲',
    titleSub: '把战术推进、压迫感和现代作战氛围，做成一张更硬朗的个人游戏主页。',
    lead:
      '这个主题会更偏军事战术感：界面层次更利落，色彩更克制，强调压迫感、机动性和任务目标，像进入一次真正的战区部署。 ',
    modeLabel: '三角洲主题',
    spotlightTitle: '战区名片 / Deployment Mode',
    spotlightDesc: '适合展示你的打法偏好、协同风格、常用配置和更偏现代战术的视觉表达。',
    spotlightMeta: [
      ['主题气质', '冷硬 / 战术 / 压迫推进'],
      ['扩展能力', '可接武器配置、常用小队、任务记录'],
    ],
    modeCardTitle: '战术主页 / Delta Mode',
    modeCardDesc: '切进这个世界时，节奏会更紧凑，像 HUD 和简报一起展开，适合做现代军事风格主题。',
    modeCardMeta: [
      ['切换方式', '顶部 Theme Switch'],
      ['内容节奏', '克制、推进、战术感'],
    ],
    aboutTitle: '这个主题页先展示你的三角洲主场介绍。',
    aboutCards: [
      ['01', '像战术面板一样展开', '页面会更强调结构和信息感，像任务面板逐块落位，而不是纯展示型海报。'],
      ['02', '适合承载打法记录', '后续可以继续加入常用枪械、战术偏好、擅长地图和小队角色分工。'],
      ['03', '音乐仍然稳定驻留', '即使主题切换到更硬核的战术世界，右下角播放器依然保持不掉线。'],
    ],
    focusTitle: '三角洲主题的首批展示方向。',
    focusPanels: [
      ['TACTICAL UI', '像进入作战界面一样切换', '转场可以强化扫描线、推进感和目标标记，让内容像作战 HUD 一样进场。', true],
      ['LOADOUT', '很适合扩装备和配置', '比如常用枪械、倍镜、战术背包、协同风格和推进习惯。'],
      ['MISSION', '适合作为系列化战术主题模板', '后面加别的现代战争类主题时，也能沿用这一套更冷硬的骨架。'],
    ],
    tags: ['Delta Force', 'Tactical Theme', 'Loadout Profile', 'Mission UI', 'Combat Atmosphere', 'Game Theme System'],
  },
  cs2: {
    key: 'cs2',
    badge: 'COUNTER-STRIKE 2 / SITE EXECUTION PROFILE',
    title: 'CS2',
    titleSub: '把枪线纪律、道具配合和残局判断，做成一张更冷静也更有压迫感的竞技主页。',
    lead:
      '这个主题会更偏工业战术感：配色更克制，节奏更紧，像赛前战术板和回合内语音一起展开，适合展示你的地图理解、默认站位和残局处理。',
    modeLabel: 'CS2 主题',
    spotlightTitle: '战术档案 / Bombsite Entry',
    spotlightDesc: '从常打地图、默认架枪位、烟闪配合到残局思路，都可以慢慢扩成一整套 FPS 主题档案。',
    spotlightMeta: [
      ['主题气质', '冷硬 / 工业 / 回合压迫感'],
      ['扩展能力', '可接地图池、准星、道具点位'],
    ],
    modeCardTitle: '爆点主页 / CS2 Mode',
    modeCardDesc: '切进这个世界时，界面会更像战术面板和观战 HUD，一眼就能感觉到竞技 FPS 的压迫节奏。',
    modeCardMeta: [
      ['切换方式', '顶部 Theme Switch'],
      ['内容节奏', '克制、紧绷、偏战术执行'],
    ],
    aboutTitle: '这个主题页先展示你的 CS2 主场介绍。',
    aboutCards: [
      ['01', '强调回合感', '通过烟雾灰、钢蓝和高温橙的对比，做出“准备开局”那种冷静但危险的氛围。'],
      ['02', '适合承载地图与枪法偏好', '后续可以继续加入常打地图、默认位、主力枪械、道具习惯和残局倾向。'],
      ['03', '音乐模块继续独立', '即使主题切到更硬核的竞技 FPS，右下角播放器也保持同样的位置和状态。'],
    ],
    focusTitle: 'CS2 主题的首批展示方向。',
    focusPanels: [
      ['SITE TAKE', '像一次爆弹进点那样切换', '转场可以强化烟雾扩散、准星锁定和战术指令感，让页面像回合开始一样推进。', true],
      ['MAP POOL', '很适合展示你的主场地图', '比如 Mirage、Inferno、Ancient 的站位理解、进攻习惯和常用道具线路。'],
      ['CLUTCH', '方便继续扩展残局档案', '后面加残局偏好、队内分工、枪械风格和集锦入口都会非常自然。'],
    ],
    tags: ['Counter-Strike 2', 'Tactical FPS Theme', 'Map Pool', 'Utility Setup', 'Clutch Profile', 'Game Theme System'],
  },
  overwatch: {
    key: 'overwatch',
    badge: 'OVERWATCH / HERO ROSTER PROFILE',
    title: '守望先锋',
    titleSub: '把队伍协作、英雄风格和高能色彩，做成一张更有速度感的英雄主题主页。',
    lead:
      '这个主题会更偏明亮和动势，像英雄入场页一样更有速度、更有舞台感，适合展示你常玩的定位、英雄池和团队风格。',
    modeLabel: '守望先锋主题',
    spotlightTitle: '英雄档案 / Hero Roster',
    spotlightDesc: '这类主题适合做成“人物选择界面”的感觉，把你的团队定位和战斗节奏展示出来。',
    spotlightMeta: [
      ['主题气质', '速度感 / 英雄感 / 团队协作'],
      ['扩展能力', '可接主玩位置、英雄池、开黑阵容'],
    ],
    modeCardTitle: '英雄主页 / Overwatch Mode',
    modeCardDesc: '切进这个世界时，视觉会更亮、更快、更有动势，像英雄镜头推到你面前一样。',
    modeCardMeta: [
      ['切换方式', '顶部 Theme Switch'],
      ['内容节奏', '轻快、明亮、英雄化'],
    ],
    aboutTitle: '这个主题页先展示你的守望先锋英雄主场介绍。',
    aboutCards: [
      ['01', '更像英雄选择界面', '通过强对比亮色、倾斜切角和更快的视觉节奏，建立明显的风格跳转。'],
      ['02', '适合展示团队角色', '后续可以继续加入输出/坦克/辅助定位、主玩英雄和开黑默契配置。'],
      ['03', '和音乐模块天然兼容', '守望先锋的主题节奏更轻快，但播放器仍独立保留在右下角，体验不断层。'],
    ],
    focusTitle: '守望先锋主题的首批展示方向。',
    focusPanels: [
      ['HERO ENTRY', '像英雄登场一样切换', '可以强化斜切、发光描边和快速滑入，让页面更有角色登场的爽感。', true],
      ['ROLE', '用来展示你的团队职责', '比如偏主辅、坦克前压、后排保护、爆发切入或机动拉扯。'],
      ['SQUAD', '适合继续扩充小队协作内容', '后续可以自然接入常开黑朋友、常用组合和语音配合风格。'],
    ],
    tags: ['Overwatch', 'Hero Theme', 'Role Profile', 'Team Play', 'Fast Motion', 'Game Theme System'],
  },
  valorant: {
    key: 'valorant',
    badge: 'VALORANT / AGENT STRIKE PROFILE',
    title: '瓦罗兰特',
    titleSub: '把特工气质、准星纪律和攻防节奏，做成一张更锐利的竞技主题主页。',
    lead:
      '这个主题会更偏切割感和竞技压迫感，视觉更干净但更尖锐，适合展示你的特工偏好、站位习惯和比赛感受。',
    modeLabel: '瓦罗兰特主题',
    spotlightTitle: '特工档案 / Agent Profile',
    spotlightDesc: '这类主题适合更强调竞技秩序、信息差和瞬时爆发力，像一张极简但锋利的比赛档案。',
    spotlightMeta: [
      ['主题气质', '锐利 / 竞技 / 特工感'],
      ['扩展能力', '可接主玩特工、地图偏好、准星配置'],
    ],
    modeCardTitle: '特工主页 / Valorant Mode',
    modeCardDesc: '切进这个世界时，版面会更干练、更斜切，也更像进入一张准备开赛的战术介绍卡。',
    modeCardMeta: [
      ['切换方式', '顶部 Theme Switch'],
      ['内容节奏', '锐利、竞技、切割感'],
    ],
    aboutTitle: '这个主题页先展示你的瓦罗兰特竞技主场介绍。',
    aboutCards: [
      ['01', '更偏竞技感和压缩感', '通过高反差红黑体系、锐角切面和更克制的排版，建立比赛前的紧绷气氛。'],
      ['02', '适合展示特工与地图偏好', '后续可以加入主玩特工、常用站位、枪法风格、地图手感和开局节奏。'],
      ['03', '维持统一的系统骨架', '就算主题视觉差异很大，播放器、切换逻辑和内容结构仍然保持统一。'],
    ],
    focusTitle: '瓦罗兰特主题的首批展示方向。',
    focusPanels: [
      ['AGENT UI', '像比赛前情报面板一样切换', '转场可以强化切割斜线和锐利扫光，让内容像特工卡片一样弹出。', true],
      ['AIM', '适合展示你的竞技偏好', '例如偏好突破、控图、补枪、信息位还是残局处理。'],
      ['MATCH', '方便继续扩展战术类模块', '后续加地图池、特工池、比分记录、集锦入口都会很自然。'],
    ],
    tags: ['Valorant', 'Agent Theme', 'Competitive Profile', 'Sharp Motion', 'Match Intro', 'Game Theme System'],
  },
};

const themeOptions = [
  { key: 'default', label: '主页' },
  { key: 'lol', label: '英雄联盟' },
  { key: 'delta', label: '三角洲' },
  { key: 'cs2', label: 'CS2' },
  { key: 'overwatch', label: '守望先锋' },
  { key: 'valorant', label: '瓦罗兰特' },
];

const trackLibrary = [
  { id: 'lol-theme', title: 'Rift Anthem', subtitle: '英雄联盟主题 BGM', src: publicAsset('audio/lol-theme.mp3'), type: 'audio' },
  { id: 'delta-theme', title: 'Tactical Advance', subtitle: '三角洲主题 BGM', src: publicAsset('audio/delta-theme.mp3'), type: 'audio' },
  { id: 'cs2-theme', title: 'Site Entry', subtitle: 'CS2 主题 BGM', src: publicAsset('audio/cs2-theme.mp3'), type: 'audio' },
  { id: 'overwatch-theme', title: 'Hero Relay', subtitle: '守望先锋主题 BGM', src: publicAsset('audio/overwatch-theme.mp3'), type: 'audio' },
  { id: 'valorant-theme', title: 'Night Protocol', subtitle: '瓦罗兰特主题 BGM', src: publicAsset('audio/valorant-theme.mp3'), type: 'audio' },
];

const trackMap = Object.fromEntries(trackLibrary.map((track) => [track.id, track]));

const themeTrackMap = {
  default: trackLibrary.map((track) => ({ trackId: track.id })),
  lol: [{ trackId: 'lol-theme' }],
  delta: [{ trackId: 'delta-theme' }],
  cs2: [{ trackId: 'cs2-theme' }],
  overwatch: [{ trackId: 'overwatch-theme' }],
  valorant: [{ trackId: 'valorant-theme' }],
};

const themeIntroMap = {
  lol: {
    src: publicAsset('theme-intros/lol-intro.mp4'),
    kicker: 'RIFT HIGHLIGHTS',
    title: '峡谷高光回放',
    description: '切入主题前，先用一段精彩操作把情绪拉满。',
  },
  delta: {
    src: publicAsset('theme-intros/delta-intro.mp4'),
    kicker: 'TACTICAL ENTRY',
    title: '战区部署集锦',
    description: '先看推进、协同和正面作战的关键镜头，再进入主题页。',
  },
  cs2: {
    src: publicAsset('theme-intros/cs2-intro.mp4'),
    kicker: 'SITE EXECUTION',
    title: '残局与爆点操作',
    description: '先用高光镜头建立竞技 FPS 的压迫感，再展开完整页面。',
  },
  overwatch: {
    src: publicAsset('theme-intros/overwatch-intro.mp4'),
    kicker: 'HERO MOMENTS',
    title: '英雄入场高能片段',
    description: '开场先放一段英雄集锦，让主题切换更像角色登场。',
  },
  valorant: {
    src: publicAsset('theme-intros/valorant-intro.mp4'),
    kicker: 'AGENT CLUTCH',
    title: '特工关键击杀集锦',
    description: '在进入页面之前，先看一段更利落的比赛片段。',
  },
};

const themeMetricsMap = {
  default: {
    title: '这个主页目前最适合展示的核心数据。',
    description: '默认主页先用“个人表达与内容完成度”的方式展示数据，后面切到游戏主题时再切成更具体的战绩指标。',
    cards: [
      { label: 'THEME COUNT', value: '05', note: '当前已接入的主题数量' },
      { label: 'MOTION PASS', value: '18+', note: '页面里已落地的动效节点' },
      { label: 'MODULES', value: '3', note: '角色、音乐、主题系统三块骨架' },
      { label: 'EXPANDABLE', value: 'READY', note: '后续继续接更多主题不需要重写结构' },
    ],
  },
  lol: {
    title: '英雄联盟主题数据展示方向。',
    description: '这里先用示意战绩结构做骨架，后续你可以直接替换成自己真实的赛季数据。',
    cards: [
      { label: 'KDA', value: '4.8', note: '最近 30 场排位综合表现' },
      { label: 'DPM', value: '742', note: '分均伤害 / 团战输出能力' },
      { label: 'KP', value: '69%', note: '参团率 / 团队影响力' },
      { label: 'CS/MIN', value: '7.3', note: '分均补刀 / 对线节奏' },
    ],
  },
  delta: {
    title: '三角洲主题数据展示方向。',
    description: '这类主题更适合放作战风格、推进效率和生存表现，信息感会更像战术简报。',
    cards: [
      { label: 'K/D', value: '2.1', note: '最近战局击杀生存比' },
      { label: 'HEADSHOT', value: '31%', note: '爆头率 / 精准度' },
      { label: 'EXTRACT', value: '68%', note: '撤离成功率 / 节奏判断' },
      { label: 'SUPPORT', value: '5.4', note: '场均战术支援次数' },
    ],
  },
  cs2: {
    title: 'CS2 主题数据展示方向。',
    description: '竞技 FPS 更适合用 ADR、KAST、首杀成功率这种能直接体现回合价值的指标。',
    cards: [
      { label: 'ADR', value: '86', note: '平均每回合伤害' },
      { label: 'HEADSHOT', value: '48%', note: '爆头率 / 枪线质量' },
      { label: 'KAST', value: '74%', note: '回合存活与贡献综合率' },
      { label: 'ENTRY', value: '57%', note: '首杀成功率 / 进点效率' },
    ],
  },
  overwatch: {
    title: '守望先锋主题数据展示方向。',
    description: '守望先锋更适合把团队参与、输出效率和关键技能命中拆开看，像人物面板一样展示。',
    cards: [
      { label: 'ELIMS / 10', value: '24.6', note: '每 10 分钟消灭数' },
      { label: 'DMG / 10', value: '9,480', note: '每 10 分钟输出量' },
      { label: 'DEATHS / 10', value: '7.9', note: '站位与容错能力' },
      { label: 'SKILL HIT', value: '63%', note: '关键技能命中率' },
    ],
  },
  valorant: {
    title: '瓦罗兰特主题数据展示方向。',
    description: '瓦更适合展示 ACS、首杀、残局和爆头率，整体会更像赛前数据面板。',
    cards: [
      { label: 'ACS', value: '252', note: '平均战斗评分' },
      { label: 'KDA', value: '1.42', note: '击杀 / 助攻 / 存活表现' },
      { label: 'FIRST BLOOD', value: '55%', note: '首杀成功率' },
      { label: 'HEADSHOT', value: '31%', note: '爆头率 / 枪法稳定度' },
    ],
  },
};

const storageKeys = {
  theme: 'chenliwen-active-theme-v1',
  achievements: 'chenliwen-achievements-v1',
  customTheme: 'chenliwen-custom-theme-v1',
  visitedThemes: 'chenliwen-visited-themes-v1',
  visitedEnvironments: 'chenliwen-visited-environments-v1',
  visitedPresets: 'chenliwen-visited-presets-v1',
  environment: 'chenliwen-environment-v1',
  bootSeen: 'chenliwen-boot-seen-v1',
  lastGuestbookSubmit: 'chenliwen-guestbook-last-submit-v1',
  likedHomepage: 'chenliwen-liked-homepage-v1',
  visitSession: 'chenliwen-visit-session-v1',
};

const githubIssueConfig = {
  owner: 'chenliwen123',
  repo: 'chenliwen123',
  label: 'homepage-message',
  pinnedLabel: 'homepage-message-pinned',
  pinnedNumbers: [1],
};

const guestbookCooldownMs = 60 * 1000;

const siteMood = {
  label: '今日状态',
  value: '在线学习中',
  note: '保持输入、保持迭代，今天也在给主页加新模块。',
};

const timelineItems = [
  { date: '2026.07', label: 'Guestbook', title: 'GitHub Issues 留言墙上线', desc: '页面内留言、公开 Issue 展示、头像、置顶与加载更多整合完成。' },
  { date: '2026.07', label: 'Interaction', title: '访客计数与点赞模块', desc: '用 Vercel API 写入统计 Issue，展示总访问、今日访问和主页喜欢数。' },
  { date: '2026.07', label: 'Visual', title: '主题和音乐体验增强', desc: '根据时间推荐主题，播放器加入歌单、音量记忆和更完整的移动端体验。' },
  { date: 'Next', label: 'Roadmap', title: '继续沉淀个人作品线', desc: '后续可以接入项目卡片、学习记录、真实游戏数据和更多彩蛋。' },
];

const festivalRules = [
  { id: 'new-year', month: 1, day: 1, title: '元旦快乐', emoji: '🎆', tone: '新的一年，主页基地重新点火。', theme: 'default' },
  { id: 'valentine', month: 2, day: 14, title: '情人节彩蛋', emoji: '💌', tone: '今天适合给留言墙留下一句温柔的话。', theme: 'default' },
  { id: 'april-fool', month: 4, day: 1, title: '愚人节信号', emoji: '🃏', tone: '指挥台检测到一条不太正经的频道。', theme: 'valorant' },
  { id: 'labor-day', month: 5, day: 1, title: '劳动节充能', emoji: '⚙️', tone: '给认真打磨页面的人一点掌声。', theme: 'delta' },
  { id: 'children-day', month: 6, day: 1, title: '童心模式', emoji: '🧸', tone: '今天允许主页多一点好奇和玩心。', theme: 'overwatch' },
  { id: 'national-day', month: 10, day: 1, title: '国庆特别模式', emoji: '🇨🇳', tone: '节日频道开启，祝今天热闹又顺利。', theme: 'lol' },
  { id: 'halloween', month: 10, day: 31, title: '万圣夜频道', emoji: '🎃', tone: '深夜特工频道上线，小心隐藏彩蛋。', theme: 'valorant' },
  { id: 'christmas', month: 12, day: 25, title: '圣诞快乐', emoji: '🎄', tone: '主页飘来一点冬日亮光。', theme: 'overwatch' },
];

const weatherCodeMap = {
  0: ['晴朗', '☀️'],
  1: ['大部晴朗', '🌤️'],
  2: ['局部多云', '⛅'],
  3: ['阴天', '☁️'],
  45: ['有雾', '🌫️'],
  48: ['雾凇', '🌫️'],
  51: ['小毛毛雨', '🌦️'],
  53: ['毛毛雨', '🌦️'],
  55: ['强毛毛雨', '🌧️'],
  61: ['小雨', '🌧️'],
  63: ['中雨', '🌧️'],
  65: ['大雨', '🌧️'],
  71: ['小雪', '🌨️'],
  73: ['中雪', '🌨️'],
  75: ['大雪', '❄️'],
  80: ['阵雨', '🌦️'],
  81: ['强阵雨', '🌧️'],
  82: ['暴雨', '⛈️'],
  95: ['雷暴', '⛈️'],
  96: ['雷暴冰雹', '⛈️'],
  99: ['强雷暴冰雹', '⛈️'],
};

const environmentPresets = [
  { key: 'nebula', label: '星云深空', desc: '柔和星云、慢速浮光，适合默认主页。' },
  { key: 'rain', label: '赛博雨夜', desc: '雨线与霓虹反光，适合 FPS 主题。' },
  { key: 'grid', label: '战术网格', desc: '扫描网格和作战坐标，适合三角洲/CS2。' },
  { key: 'ember', label: '熔火余烬', desc: '暖色火花和低频呼吸光，适合更热血的主题。' },
];

const briefingMap = {
  default: {
    kicker: 'PERSONAL BRIEFING',
    title: '主页基地区域已上线',
    objective: '把个人介绍、主题切换、音乐和互动模块整合成一个有记忆点的数字名片。',
    intel: ['默认主题会优先展示暖色编辑感', '3D 人物会在浏览器空闲后加载', '指挥台可随时切换模式'],
    cta: '开始浏览',
  },
  lol: {
    kicker: 'RIFT MISSION',
    title: '峡谷入场简报',
    objective: '进入召唤师主题，展示你的峡谷偏好、英雄气质和排位节奏。',
    intel: ['金色能量层强化史诗感', '数据面板适合替换成真实赛季数据', '音乐联动会自动锁定 LOL 曲目'],
    cta: '进入峡谷',
  },
  delta: {
    kicker: 'TACTICAL BRIEF',
    title: '战区部署指令',
    objective: '切入更硬朗的战术视觉，突出推进效率、生存判断和支援能力。',
    intel: ['建议搭配战术网格环境', '指标更偏撤离率与 K/D', '适合加入装备与地图模块'],
    cta: '开始部署',
  },
  cs2: {
    kicker: 'SITE EXECUTE',
    title: '爆点执行简报',
    objective: '用竞技 FPS 的回合价值指标展示枪线质量、进点效率与残局压迫感。',
    intel: ['ADR / KAST / ENTRY 已预留', '橙灰配色偏工业竞技感', '后续可加入地图池与准星配置'],
    cta: '执行进点',
  },
  overwatch: {
    kicker: 'HERO DEPLOYMENT',
    title: '英雄出动简报',
    objective: '突出团队参与、角色定位和英雄高光，让页面更像英雄档案。',
    intel: ['橙色能量更偏英雄登场', '适合扩展常用英雄和职责', '音乐状态会联动 HUD 节拍'],
    cta: '英雄就位',
  },
  valorant: {
    kicker: 'AGENT DOSSIER',
    title: '特工行动简报',
    objective: '进入锐利、干练、压迫感更强的竞技档案，展示特工偏好和比赛节奏。',
    intel: ['红黑切割感更强', '适合加入特工池和地图站位', '可以搭配赛博雨夜环境'],
    cta: '锁定特工',
  },
};

const achievementList = [
  { id: 'deck_operator', title: '指挥台上线', desc: '第一次打开主题指挥台', icon: '⌘' },
  { id: 'keyboard_commander', title: '快捷键指挥官', desc: '使用 Ctrl / ⌘ + K 打开指挥台', icon: '⌨' },
  { id: 'first_jump', title: '主题跃迁', desc: '切换到任意非默认主题', icon: '◆' },
  { id: 'homecoming', title: '回到主场', desc: '体验其他主题后回到默认主页', icon: '⌂' },
  { id: 'random_warp', title: '随机跃迁', desc: '在指挥台执行一次随机主题切换', icon: '🎲' },
  { id: 'theme_collector', title: '全主题巡航', desc: '访问全部 6 个主题', icon: '✦' },
  { id: 'fps_route', title: 'FPS 路线侦察', desc: '访问三角洲、CS2 和瓦罗兰特主题', icon: '⌖' },
  { id: 'hero_route', title: '英雄路线集合', desc: '访问英雄联盟和守望先锋主题', icon: '⚔' },
  { id: 'music_ignition', title: '声波点火', desc: '启动一次页面音乐', icon: '♪' },
  { id: 'playlist_unlocked', title: '自由播放模式', desc: '关闭主题音乐联动，解锁完整歌单', icon: '♫' },
  { id: 'deep_scroll', title: '读到底部', desc: '浏览到页面底部区域', icon: '↓' },
  { id: 'workshop_tuned', title: '调色工程师', desc: '启用一次自定义主题工坊', icon: '◎' },
  { id: 'palette_collector', title: '调色收藏家', desc: '试过全部 4 套工坊配色', icon: '◍' },
  { id: 'overdrive_glow', title: '光效过载', desc: '把工坊光效强度推到 80% 以上', icon: '✺' },
  { id: 'guestbook_signal', title: '访客信号', desc: '打开一次 GitHub 留言入口', icon: '✉' },
  { id: 'environment_shift', title: '环境切换', desc: '切换一次背景环境氛围', icon: '☄' },
  { id: 'environment_collector', title: '环境采样员', desc: '体验全部 4 种背景环境', icon: '◌' },
  { id: 'briefing_reader', title: '简报已阅', desc: '关闭一次任务简报并进入页面', icon: '▣' },
  { id: 'intro_clear', title: '高光入场', desc: '观看或跳过一次主题入场视频', icon: '▶' },
  { id: 'completionist', title: '全成就制霸', desc: '解锁除本项外的所有成就', icon: '🏆' },
];

const achievementMap = Object.fromEntries(achievementList.map((achievement) => [achievement.id, achievement]));

const customThemePresets = [
  { key: 'ember', label: '熔火橙', accent: '#ff9654', deep: '#d85b35', soft: '#ffe0b7', text: '#251116', rgb: '255, 150, 84' },
  { key: 'neon', label: '霓虹蓝', accent: '#69d7ff', deep: '#3d88ff', soft: '#d9f5ff', text: '#04131d', rgb: '105, 215, 255' },
  { key: 'toxic', label: '战术绿', accent: '#a8ff78', deep: '#5f9b45', soft: '#e1ffd3', text: '#0d1a0a', rgb: '168, 255, 120' },
  { key: 'crimson', label: '特工红', accent: '#ff6e7a', deep: '#c4284d', soft: '#ffd0d5', text: '#26070b', rgb: '255, 110, 122' },
];

const defaultCustomTheme = {
  enabled: false,
  preset: 'ember',
  intensity: 62,
};

function readStorageValue(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.warn(`无法读取本地配置：${key}`, error);
    return fallback;
  }
}

function writeStorageValue(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`无法保存本地配置：${key}`, error);
  }
}

function formatRelativeTime(dateValue) {
  const timestamp = new Date(dateValue).getTime();
  if (Number.isNaN(timestamp)) {
    return '刚刚';
  }

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSeconds < 60) return '刚刚';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}小时前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;

  return new Date(dateValue).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function getIssueVisitorName(issue) {
  const body = String(issue?.body ?? '');
  const match = body.match(/访客：(.+)/);
  return match?.[1]?.trim() || issue?.user?.login || 'visitor';
}

function getInitials(name) {
  const cleanName = String(name || '访客').trim();
  return Array.from(cleanName).slice(0, 2).join('').toUpperCase() || '访';
}

function isPinnedIssue(issue) {
  const labels = Array.isArray(issue?.labels) ? issue.labels.map((label) => label.name) : [];
  return labels.includes(githubIssueConfig.pinnedLabel) || githubIssueConfig.pinnedNumbers.includes(issue?.number);
}

function normalizeIssue(issue) {
  const visitor = getIssueVisitorName(issue);
  return {
    ...issue,
    visitor,
    isPinned: isPinnedIssue(issue),
  };
}

function sortIssues(issues) {
  return [...issues].sort((leftIssue, rightIssue) => {
    if (leftIssue.isPinned !== rightIssue.isPinned) {
      return leftIssue.isPinned ? -1 : 1;
    }

    return new Date(rightIssue.created_at).getTime() - new Date(leftIssue.created_at).getTime();
  });
}

function getTimeBasedTheme() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'default';
  if (hour >= 11 && hour < 17) return 'overwatch';
  if (hour >= 17 && hour < 22) return 'lol';
  return 'valorant';
}

function getVisitSessionKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function getTodayFestival() {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date());
  const valueMap = Object.fromEntries(parts.map((part) => [part.type, Number(part.value)]));
  return festivalRules.find((festival) => festival.month === valueMap.month && festival.day === valueMap.day) ?? null;
}

function getWeatherLabel(code) {
  return weatherCodeMap[code] ?? ['未知天气', '◌'];
}

function getSunPhase({ sunrise, sunset }) {
  const now = Date.now();
  const sunriseTime = new Date(sunrise).getTime();
  const sunsetTime = new Date(sunset).getTime();

  if (!Number.isFinite(sunriseTime) || !Number.isFinite(sunsetTime)) {
    return 'unknown';
  }

  const hour = 60 * 60 * 1000;
  if (now < sunriseTime) return 'night';
  if (now < sunriseTime + hour) return 'sunrise';
  if (now < sunsetTime - hour) return 'day';
  if (now < sunsetTime + hour) return 'sunset';
  return 'night';
}

function getThemeForWeatherPhase(weatherCode, phase) {
  if ([45, 48, 51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode)) {
    return { theme: 'valorant', environment: 'rain' };
  }

  if ([71, 73, 75].includes(weatherCode)) {
    return { theme: 'overwatch', environment: 'nebula' };
  }

  if (phase === 'sunrise') return { theme: 'default', environment: 'ember' };
  if (phase === 'sunset') return { theme: 'lol', environment: 'ember' };
  if (phase === 'night') return { theme: 'valorant', environment: 'nebula' };
  return { theme: 'default', environment: 'nebula' };
}

function formatClock(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function SpotlightCard({ theme }) {
  return (
    <article className="feature-card intro-card">
      <span className="card-tag">NOW</span>
      <h2>{theme.spotlightTitle}</h2>
      <p>{theme.spotlightDesc}</p>
      <div className="card-grid">
        {theme.spotlightMeta.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function ThemeIntroOverlay({ intro, onClose }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="theme-intro-overlay" role="dialog" aria-modal="true" aria-label={`${intro.title} 主题入场视频`}>
      <video
        className="theme-intro-video"
        src={intro.src}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={onClose}
        onError={onClose}
      />
      <div className="theme-intro-backdrop" aria-hidden="true" />
      <div className="theme-intro-copy">
        <p className="theme-intro-kicker">{intro.kicker}</p>
        <h2>{intro.title}</h2>
        <p>{intro.description}</p>
      </div>
      <button className="button button-secondary theme-intro-skip" type="button" onClick={onClose}>
        跳过精彩操作
      </button>
    </div>
  );
}

function BootLoader({ onComplete }) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onComplete, 2200);
    return () => window.clearTimeout(timeoutId);
  }, [onComplete]);

  return (
    <div className="boot-loader" role="status" aria-label="页面启动加载中">
      <div className="boot-terminal">
        <p className="boot-kicker">CHENLIWEN.EXE</p>
        <h2>Initializing Theme System</h2>
        <ul>
          <li>Loading visual modules...</li>
          <li>Syncing audio HUD...</li>
          <li>Connecting command deck...</li>
          <li>Preparing mission briefing...</li>
        </ul>
        <div className="boot-progress"><span /></div>
      </div>
    </div>
  );
}

function MissionBriefing({ themeKey, onClose }) {
  const briefing = briefingMap[themeKey] ?? briefingMap.default;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="mission-briefing" role="dialog" aria-modal="true" aria-label={`${briefing.title} 任务简报`}>
      <button className="mission-backdrop" type="button" aria-label="关闭任务简报" onClick={onClose} />
      <section className="mission-card">
        <p className="eyebrow">{briefing.kicker}</p>
        <h2>{briefing.title}</h2>
        <p>{briefing.objective}</p>
        <div className="mission-intel-grid">
          {briefing.intel.map((item, index) => (
            <article key={item}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
        <button className="button button-primary" type="button" onClick={onClose}>{briefing.cta}</button>
      </section>
    </div>
  );
}

function EnvironmentLayer({ environmentKey }) {
  return (
    <div className={`environment-layer environment-${environmentKey}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function CursorParticles({ isActive }) {
  const [particles, setParticles] = useState([]);
  const particleIdRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let lastSpawnTime = 0;
    const handlePointerMove = (event) => {
      const now = performance.now();
      if (now - lastSpawnTime < (isActive ? 28 : 58)) {
        return;
      }

      lastSpawnTime = now;
      const id = particleIdRef.current + 1;
      particleIdRef.current = id;

      setParticles((currentParticles) => [
        ...currentParticles.slice(-22),
        {
          id,
          x: event.clientX,
          y: event.clientY,
          size: Math.round(7 + Math.random() * (isActive ? 18 : 10)),
          driftX: Math.round((Math.random() - 0.5) * 52),
          driftY: Math.round(-18 - Math.random() * 44),
        },
      ]);

      window.setTimeout(() => {
        setParticles((currentParticles) => currentParticles.filter((particle) => particle.id !== id));
      }, 760);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [isActive]);

  return (
    <div className={isActive ? 'cursor-particles is-active' : 'cursor-particles'} aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            '--drift-x': `${particle.driftX}px`,
            '--drift-y': `${particle.driftY}px`,
          }}
        />
      ))}
      {Array.from({ length: 18 }, (_, index) => (
        <i
          key={`star-${index}`}
          className="star-particle"
          style={{
            '--star-left': `${(index * 23) % 100}%`,
            '--star-top': `${(index * 37) % 100}%`,
            '--star-delay': `${index * 0.28}s`,
            '--star-size': `${2 + (index % 4)}px`,
          }}
        />
      ))}
    </div>
  );
}

function GitHubMessages({ onUnlock }) {
  const [messages, setMessages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [status, setStatus] = useState('正在连接 GitHub Issues 留言频道...');
  const [visitorName, setVisitorName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successIssue, setSuccessIssue] = useState(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const issueListUrl = `https://api.github.com/repos/${githubIssueConfig.owner}/${githubIssueConfig.repo}/issues?state=open&labels=${encodeURIComponent(githubIssueConfig.label)}&per_page=30`;
  const newIssueUrl = `https://github.com/${githubIssueConfig.owner}/${githubIssueConfig.repo}/issues/new?labels=${encodeURIComponent(githubIssueConfig.label)}&title=${encodeURIComponent('主页访客留言')}`;
  const visibleMessages = messages.slice(0, visibleCount);
  const hasMoreMessages = messages.length > visibleCount;

  const loadMessages = useCallback(() => {
    let cancelled = false;

    fetch(issueListUrl, { headers: { Accept: 'application/vnd.github+json' } })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`GitHub Issues 请求失败：${response.status}`);
        }

        return response.json();
      })
      .then((issues) => {
        if (cancelled) {
          return;
        }

        const nextMessages = Array.isArray(issues)
          ? sortIssues(issues.filter((issue) => !issue.pull_request).map(normalizeIssue))
          : [];
        setMessages(nextMessages);
        setStatus('已同步公开 GitHub Issues 留言');
      })
      .catch((error) => {
        if (!cancelled) {
          console.warn(error);
          setStatus('暂时无法读取 Issues，可直接打开 GitHub 留言');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [issueListUrl]);

  useEffect(() => loadMessages(), [loadMessages]);

  useEffect(() => {
    const updateCooldown = () => {
      const lastSubmitAt = readStorageValue(storageKeys.lastGuestbookSubmit, 0);
      const remainingSeconds = Math.ceil(Math.max(0, guestbookCooldownMs - (Date.now() - Number(lastSubmitAt))) / 1000);
      setCooldownSeconds(remainingSeconds);
    };

    updateCooldown();
    const intervalId = window.setInterval(updateCooldown, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const submitMessage = async () => {
    const message = messageText.trim();
    if (message.length < 2) {
      setSubmitError('留言至少需要 2 个字符');
      return;
    }

    if (cooldownSeconds > 0) {
      setSubmitError(`刚刚已经提交过啦，${cooldownSeconds} 秒后可以再次留言。`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setStatus('正在写入 GitHub Issues 留言...');

    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor: visitorName.trim(),
          message,
          company: '',
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || '留言提交失败');
      }

      onUnlock?.();
      writeStorageValue(storageKeys.lastGuestbookSubmit, Date.now());
      setCooldownSeconds(Math.ceil(guestbookCooldownMs / 1000));
      setMessageText('');
      setVisitorName('');
      setSuccessIssue(data.issue ?? null);
      setStatus('留言已写入 GitHub Issues，正在刷新留言墙...');
      loadMessages();
    } catch (error) {
      console.warn(error);
      setSubmitError(`${error.message}；你也可以用备用 GitHub 页面提交。`);
      setStatus('页面内提交暂时不可用');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RevealSection className="guestbook theme-transition-panel" id="guestbook">
      <div className="section-stack theme-enter-bottom theme-delay-2">
        <div className="section-heading">
          <p className="eyebrow">GUESTBOOK</p>
          <h2>访客留言墙 / GitHub Issues Channel</h2>
          <p className="section-note">留言会直接写入 GitHub Issues；公开 Issue 会展示在这里。</p>
        </div>

        <div className="guestbook-layout">
          <article className="guestbook-composer">
            <span className="card-tag">WRITE MESSAGE</span>
            <label className="guestbook-field">
              <span>昵称</span>
              <input
                value={visitorName}
                onChange={(event) => setVisitorName(event.target.value)}
                maxLength="40"
                placeholder="可以留空，默认显示访客"
              />
            </label>
            <textarea
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="写一句想留在主页上的话..."
              maxLength="600"
              rows="5"
            />
            <input className="guestbook-trap" tabIndex="-1" autoComplete="off" aria-hidden="true" />
            {submitError ? <p className="guestbook-error">{submitError}</p> : null}
            <div className="guestbook-actions">
              <button className="button button-primary" type="button" onClick={submitMessage} disabled={isSubmitting}>
                {isSubmitting ? '提交中...' : cooldownSeconds > 0 ? `${cooldownSeconds}s 后可留言` : '直接留言'}
              </button>
              <a className="button button-secondary" href={`https://github.com/${githubIssueConfig.owner}/${githubIssueConfig.repo}/issues?q=label%3A${githubIssueConfig.label}`} target="_blank" rel="noreferrer">查看全部留言</a>
              <a className="button button-secondary" href={`${newIssueUrl}&body=${encodeURIComponent(`来自个人主页的访客留言：\n\n${messageText.trim()}`)}`} target="_blank" rel="noreferrer">备用 GitHub 提交</a>
            </div>
            <p className="guestbook-cooldown">为了防刷，同一浏览器提交后会冷却 60 秒。</p>
          </article>

          <div className="guestbook-feed">
            <p className="guestbook-status">{status}</p>
            {visibleMessages.length ? visibleMessages.map((message, index) => (
              <a
                className={message.isPinned ? 'guestbook-message is-pinned' : 'guestbook-message'}
                key={message.id}
                href={message.html_url}
                target="_blank"
                rel="noreferrer"
                style={{ '--message-index': index }}
              >
                <div className="guestbook-avatar" aria-hidden="true">
                  {message.user?.avatar_url ? <img src={message.user.avatar_url} alt="" loading="lazy" /> : <span>{getInitials(message.visitor)}</span>}
                </div>
                <div className="guestbook-message-copy">
                  <span>{message.isPinned ? 'PINNED' : `#${message.number}`}</span>
                  <strong>{message.title}</strong>
                  <small>{message.visitor} · {formatRelativeTime(message.created_at)}</small>
                </div>
              </a>
            )) : (
              <article className="guestbook-message is-empty">
                <div className="guestbook-avatar" aria-hidden="true"><span>INIT</span></div>
                <div className="guestbook-message-copy">
                  <span>INIT</span>
                  <strong>还没有同步到公开留言</strong>
                  <small>可以成为第一条 GitHub Issue 留言。</small>
                </div>
              </article>
            )}
            {hasMoreMessages ? (
              <button className="button button-secondary guestbook-more" type="button" onClick={() => setVisibleCount((count) => count + 6)}>
                查看更多留言（剩余 {messages.length - visibleCount} 条）
              </button>
            ) : null}
          </div>
        </div>

        {successIssue ? (
          <div className="guestbook-success" role="status" aria-live="polite">
            <div>
              <span className="guestbook-success-icon">✓</span>
              <strong>留言已送达</strong>
              <p>已写入 GitHub Issue #{successIssue.number}，刷新后会出现在留言墙里。</p>
            </div>
            <a className="button button-primary" href={successIssue.html_url} target="_blank" rel="noreferrer">查看留言</a>
            <button className="button button-secondary" type="button" onClick={() => setSuccessIssue(null)}>关闭</button>
          </div>
        ) : null}
      </div>
    </RevealSection>
  );
}

function VisitorPulse({ onEgg }) {
  const [stats, setStats] = useState({ totalVisits: 0, todayVisits: 0, likes: 0 });
  const [status, setStatus] = useState('正在同步主页访客信号...');
  const [hasLiked, setHasLiked] = useState(() => readStorageValue(storageKeys.likedHomepage, false));
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const sessionKey = getVisitSessionKey();
    const lastSession = readStorageValue(storageKeys.visitSession, '');
    const shouldCountVisit = lastSession !== sessionKey;

    fetch('/api/site-stats', {
      method: shouldCountVisit ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: shouldCountVisit ? JSON.stringify({ action: 'visit' }) : undefined,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`统计接口请求失败：${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (data.stats) {
          setStats(data.stats);
        }
        if (shouldCountVisit) {
          writeStorageValue(storageKeys.visitSession, sessionKey);
        }
        setStatus(shouldCountVisit ? '今天第一次到访已记录' : '欢迎回来，今天已记录过访问');
      })
      .catch((error) => {
        console.warn(error);
        setStatus('统计接口暂时离线，本地仍可浏览全部内容');
      });
  }, []);

  const likeHomepage = async () => {
    if (hasLiked || isLiking) {
      return;
    }

    setIsLiking(true);
    try {
      const response = await fetch('/api/site-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || '点赞同步失败');
      }

      if (data.stats) {
        setStats(data.stats);
      } else {
        setStats((currentStats) => ({ ...currentStats, likes: currentStats.likes + 1 }));
      }
      setHasLiked(true);
      writeStorageValue(storageKeys.likedHomepage, true);
      setStatus('收到你的喜欢，主页能量 +1');
    } catch (error) {
      console.warn(error);
      setStatus('点赞暂时同步失败，可以稍后再试');
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <RevealSection className="visitor-pulse theme-transition-panel" id="pulse">
      <div className="section-stack theme-enter-bottom theme-delay-1">
        <div className="section-heading">
          <p className="eyebrow">LIVE PULSE</p>
          <h2>访客信号 / 今日状态</h2>
          <p className="section-note">记录访问、喜欢和当前主页状态，让页面更像一个在线基地。</p>
        </div>

        <div className="pulse-grid">
          <article className="pulse-card mood-card">
            <span className="card-tag">{siteMood.label}</span>
            <h3>{siteMood.value}</h3>
            <p>{siteMood.note}</p>
          </article>
          <article className="pulse-card">
            <span className="card-tag">TOTAL VISITS</span>
            <strong>{stats.totalVisits}</strong>
            <p>主页累计访客信号</p>
          </article>
          <article className="pulse-card">
            <span className="card-tag">TODAY</span>
            <strong>{stats.todayVisits}</strong>
            <p>今天已记录访问</p>
          </article>
          <article className="pulse-card like-card">
            <span className="card-tag">LIKES</span>
            <strong>{stats.likes}</strong>
            <button className="button button-primary" type="button" onClick={likeHomepage} disabled={hasLiked || isLiking}>
              {hasLiked ? '已点赞' : isLiking ? '同步中...' : '喜欢这个主页'}
            </button>
          </article>
        </div>

        <div className="pulse-status-row">
          <p>{status}</p>
          <button className="pulse-egg-button" type="button" onClick={onEgg}>输入彩蛋：CHEN</button>
        </div>
      </div>
    </RevealSection>
  );
}

function TimelineSection() {
  return (
    <RevealSection className="timeline theme-transition-panel" id="timeline">
      <div className="section-stack theme-enter-bottom theme-delay-2">
        <div className="section-heading">
          <p className="eyebrow">TIMELINE</p>
          <h2>最近更新 / Project Log</h2>
          <p className="section-note">把主页改动、学习状态和下一步想法整理成时间线。</p>
        </div>

        <div className="timeline-list">
          {timelineItems.map((item) => (
            <article className="timeline-item" key={`${item.date}-${item.title}`}>
              <span>{item.date}</span>
              <div>
                <p>{item.label}</p>
                <h3>{item.title}</h3>
                <small>{item.desc}</small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

function FestivalSurprise({ festival, onActivateTheme }) {
  const fallbackFestival = festivalRules[0];
  const activeFestival = festival ?? fallbackFestival;

  return (
    <RevealSection className={festival ? 'festival-surprise theme-transition-panel is-active' : 'festival-surprise theme-transition-panel'} id="festival">
      <div className="festival-card theme-enter-bottom theme-delay-1">
        <div className="festival-orb" aria-hidden="true">
          <span>{activeFestival.emoji}</span>
          <i />
          <i />
          <i />
        </div>
        <div className="festival-copy">
          <p className="eyebrow">AUTO FESTIVAL MODE</p>
          <h2>{festival ? activeFestival.title : '节日彩蛋已自动待命'}</h2>
          <p>{festival ? activeFestival.tone : `下一个内置节日彩蛋会在 ${fallbackFestival.month} 月 ${fallbackFestival.day} 日自动出现，不需要手动维护。`}</p>
        </div>
        <button className="button button-secondary" type="button" onClick={() => onActivateTheme(activeFestival.theme)}>
          {festival ? '切换节日氛围' : '预览元旦氛围'}
        </button>
      </div>
    </RevealSection>
  );
}

function AutoChangelog() {
  const [commits, setCommits] = useState([]);
  const [status, setStatus] = useState('正在同步 GitHub 最近提交...');

  useEffect(() => {
    let cancelled = false;

    fetch('/api/changelog')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`更新日志请求失败：${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setCommits(Array.isArray(data.commits) ? data.commits : []);
        setStatus(`已同步 ${data.source ?? 'GitHub'} 最近提交`);
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn(error);
        setStatus('暂时无法同步 GitHub 更新日志');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RevealSection className="auto-changelog theme-transition-panel" id="changelog">
      <div className="section-stack theme-enter-bottom theme-delay-2">
        <div className="section-heading">
          <p className="eyebrow">AUTO CHANGELOG</p>
          <h2>自动更新日志</h2>
          <p className="section-note">直接读取 GitHub 最近提交，页面会随仓库更新自动刷新内容。</p>
        </div>

        <p className="changelog-status">{status}</p>
        <div className="changelog-list">
          {commits.length ? commits.map((commit) => (
            <a className="changelog-item" key={commit.sha} href={commit.html_url} target="_blank" rel="noreferrer">
              <span>{commit.shortSha}</span>
              <div>
                <strong>{commit.title}</strong>
                <small>{commit.author} · {formatRelativeTime(commit.date)}</small>
              </div>
            </a>
          )) : (
            <article className="changelog-item is-empty">
              <span>SYNC</span>
              <div>
                <strong>等待 GitHub 返回最近提交</strong>
                <small>如果本地只启动 Vite，需要同时运行 npm run dev:api。</small>
              </div>
            </article>
          )}
        </div>
      </div>
    </RevealSection>
  );
}

function WeatherSyncPanel({ onApplyTheme }) {
  const [status, setStatus] = useState('等待定位授权，授权后会自动同步天气与日出日落。');
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const [isAutoThemeEnabled, setIsAutoThemeEnabled] = useState(true);
  const watchIdRef = useRef(null);

  const syncWeather = useCallback((position) => {
    const nextCoords = {
      latitude: Number(position.coords.latitude.toFixed(4)),
      longitude: Number(position.coords.longitude.toFixed(4)),
      accuracy: Math.round(position.coords.accuracy),
      updatedAt: new Date().toISOString(),
    };
    setCoords(nextCoords);
    setStatus('定位已更新，正在同步天气...');

    const params = new URLSearchParams({
      latitude: String(nextCoords.latitude),
      longitude: String(nextCoords.longitude),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      daily: 'sunrise,sunset',
      timezone: 'auto',
      forecast_days: '1',
    });

    fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`天气接口请求失败：${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        const current = data.current ?? {};
        const daily = data.daily ?? {};
        const weatherCode = Number(current.weather_code ?? -1);
        const [label, icon] = getWeatherLabel(weatherCode);
        const sunrise = daily.sunrise?.[0];
        const sunset = daily.sunset?.[0];
        const phase = getSunPhase({ sunrise, sunset });
        const nextWeather = {
          label,
          icon,
          weatherCode,
          phase,
          temperature: Math.round(Number(current.temperature_2m ?? 0)),
          apparent: Math.round(Number(current.apparent_temperature ?? 0)),
          humidity: Math.round(Number(current.relative_humidity_2m ?? 0)),
          wind: Math.round(Number(current.wind_speed_10m ?? 0)),
          sunrise,
          sunset,
          timezone: data.timezone,
          updatedAt: current.time ?? new Date().toISOString(),
        };

        setWeather(nextWeather);
        setStatus(`天气已同步：${label} · ${nextWeather.temperature}°C`);

        if (isAutoThemeEnabled) {
          onApplyTheme(getThemeForWeatherPhase(weatherCode, phase));
        }
      })
      .catch((error) => {
        console.warn(error);
        setStatus('天气同步失败，请稍后重试。');
      });
  }, [isAutoThemeEnabled, onApplyTheme]);

  const startLocationWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('当前浏览器不支持精准定位。');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setStatus('正在请求浏览器定位授权...');
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setIsWatching(true);
        syncWeather(position);
      },
      (error) => {
        console.warn(error);
        setIsWatching(false);
        setStatus(error.code === error.PERMISSION_DENIED ? '定位授权被拒绝，无法获取精准天气。' : '定位失败，请检查浏览器或系统定位权限。');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5 * 60 * 1000,
        timeout: 15 * 1000,
      },
    );
    watchIdRef.current = watchId;
  }, [syncWeather]);

  const stopLocationWatch = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
    setIsWatching(false);
    setStatus('已停止实时定位，天气信息会保留在当前结果。');
  }, []);

  useEffect(() => () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  }, []);

  return (
    <RevealSection className="weather-sync theme-transition-panel" id="weather-sync">
      <div className="section-stack theme-enter-bottom theme-delay-1">
        <div className="section-heading">
          <p className="eyebrow">LIVE WEATHER SYNC</p>
          <h2>精准定位天气 / 日出日落主题</h2>
          <p className="section-note">授权浏览器定位后，页面会实时获取经纬度天气，并按日出、白天、日落、夜晚自动调整氛围。</p>
        </div>

        <div className="weather-grid">
          <article className="weather-main-card">
            <div className="weather-icon" aria-hidden="true">{weather?.icon ?? '📍'}</div>
            <div>
              <span className="card-tag">{isWatching ? 'LIVE POSITION' : 'LOCATION READY'}</span>
              <h3>{weather ? `${weather.label} · ${weather.temperature}°C` : '等待授权定位'}</h3>
              <p>{status}</p>
            </div>
          </article>

          <div className="weather-metrics">
            <article>
              <span>体感</span>
              <strong>{weather ? `${weather.apparent}°C` : '--'}</strong>
            </article>
            <article>
              <span>湿度</span>
              <strong>{weather ? `${weather.humidity}%` : '--'}</strong>
            </article>
            <article>
              <span>风速</span>
              <strong>{weather ? `${weather.wind} km/h` : '--'}</strong>
            </article>
            <article>
              <span>精度</span>
              <strong>{coords ? `±${coords.accuracy}m` : '--'}</strong>
            </article>
          </div>
        </div>

        <div className="sun-cycle-grid">
          <article>
            <span>日出</span>
            <strong>{weather ? formatClock(weather.sunrise) : '--:--'}</strong>
          </article>
          <article>
            <span>日落</span>
            <strong>{weather ? formatClock(weather.sunset) : '--:--'}</strong>
          </article>
          <article>
            <span>当前时段</span>
            <strong>{weather?.phase ?? '--'}</strong>
          </article>
          <article>
            <span>经纬度</span>
            <strong>{coords ? `${coords.latitude}, ${coords.longitude}` : '未授权'}</strong>
          </article>
        </div>

        <div className="weather-actions">
          <button className="button button-primary" type="button" onClick={startLocationWatch}>
            {isWatching ? '重新同步定位' : '授权并实时同步'}
          </button>
          <button className="button button-secondary" type="button" onClick={stopLocationWatch} disabled={!isWatching}>
            停止实时定位
          </button>
          <button className="button button-secondary" type="button" onClick={() => setIsAutoThemeEnabled((value) => !value)}>
            {isAutoThemeEnabled ? '自动主题已开' : '自动主题已关'}
          </button>
        </div>
      </div>
    </RevealSection>
  );
}

function EasterEggOverlay({ isVisible, onClose }) {
  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    const timeoutId = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timeoutId);
  }, [isVisible, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="easter-egg-overlay" role="status" aria-live="polite">
      <div className="easter-egg-core">
        <span>✦</span>
        <h2>隐藏信号已捕获</h2>
        <p>你触发了 CHEN 彩蛋：主页进入短暂星轨加速模式。</p>
      </div>
    </div>
  );
}

function isEditableTarget(target) {
  const tagName = target?.tagName?.toLowerCase();
  return target?.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
}

function CommandDeck({
  activeTracks,
  achievements,
  activeTheme,
  customTheme,
  environmentKey,
  isOpen,
  musicState,
  isThemeMusicLinked,
  onClose,
  onLaunchRandom,
  onPlaybackChange,
  onSetEnvironment,
  onSelectTheme,
  onSetCustomTheme,
  onToggleCustomTheme,
  onToggleThemeMusic,
}) {
  const activeThemeData = themes[activeTheme];
  const activeMetrics = themeMetricsMap[activeTheme] ?? themeMetricsMap.default;
  const radarTags = activeThemeData.tags.slice(0, 4);
  const unlockedAchievements = achievementList.filter((achievement) => achievements.includes(achievement.id));
  const activePreset = customThemePresets.find((preset) => preset.key === customTheme.preset) ?? customThemePresets[0];
  const isMusicPlaying = musicState.isPlaying;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <div
      className={isOpen ? 'command-deck is-open' : 'command-deck'}
      role={isOpen ? 'dialog' : undefined}
      aria-modal={isOpen ? 'true' : undefined}
      aria-hidden={!isOpen}
      aria-label="主题指挥台"
    >
      <button className="command-deck-backdrop" type="button" aria-label="关闭主题指挥台" onClick={onClose} />

      <section className="command-panel" aria-labelledby="command-deck-title">
        <div className="command-panel-topline">
          <p className="eyebrow">COMMAND DECK / CTRL + K</p>
          <button className="command-close" type="button" onClick={onClose} aria-label="关闭主题指挥台">
            ESC
          </button>
        </div>

        <div className="command-layout">
          <div className="command-copy">
            <h2 id="command-deck-title">主题指挥台</h2>
            <p>
              像选择任务一样切换主页气质：按数字 1-6 直接启动主题，按 R 随机传送，按 ESC 关闭面板。
            </p>

            <div className="command-status-grid">
              <article>
                <span>ACTIVE MODE</span>
                <strong>{activeThemeData.modeLabel}</strong>
              </article>
              <article>
                <span>MUSIC LINK</span>
                <button type="button" onClick={onToggleThemeMusic}>
                  {isThemeMusicLinked ? '主题联动' : '自由播放'}
                </button>
              </article>
              <article>
                <span>LATEST BADGE</span>
                <strong>{unlockedAchievements.at(-1)?.title ?? '等待解锁'}</strong>
              </article>
            </div>

            <div className="command-actions">
              <button className="button button-primary" type="button" onClick={onLaunchRandom}>
                随机传送主题
              </button>
              <button className="button button-secondary" type="button" onClick={onClose}>
                返回当前页面
              </button>
            </div>
          </div>

          <div className="command-radar" aria-hidden="true">
            <span className="command-radar-ring" />
            <span className="command-radar-ring" />
            <span className="command-radar-sweep" />
            <div className="command-radar-core">
              <strong>{activeThemeData.key.toUpperCase()}</strong>
              <span>{isMusicPlaying ? 'ON' : activeMetrics.cards[0].value}</span>
            </div>
            {radarTags.map((tag, index) => (
              <em key={tag} style={{ '--tag-index': index }}>{tag}</em>
            ))}
          </div>
        </div>

        <div className="command-theme-grid" aria-label="可启动主题">
          {themeOptions.map((option, index) => {
            const optionTheme = themes[option.key];
            const optionMetrics = themeMetricsMap[option.key] ?? themeMetricsMap.default;
            const isActive = option.key === activeTheme;

            return (
              <button
                key={option.key}
                className={isActive ? 'command-theme-card is-active' : 'command-theme-card'}
                type="button"
                onClick={() => onSelectTheme(option.key)}
              >
                <span className="command-theme-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="command-theme-main">
                  <strong>{option.label}</strong>
                  <small>{optionTheme.badge}</small>
                </span>
                <span className="command-theme-stat">
                  {optionMetrics.cards[0].label} · {optionMetrics.cards[0].value}
                </span>
              </button>
            );
          })}
        </div>

        <section className="command-lab-card command-audio" aria-labelledby="command-audio-title">
          <div className="command-lab-heading">
            <span>AUDIO CONTROL</span>
            <strong>{isMusicPlaying ? '声波同步中' : '待机'}</strong>
          </div>
          <h3 id="command-audio-title">音乐与 HUD 控制台</h3>
          <p>播放器和声波 HUD 统一放在指挥台里，页面浏览时不再常驻浮窗。</p>
          <div className="command-audio-grid">
            <AudioVisualizerHud
              activeTheme={activeTheme}
              isPlaying={musicState.isPlaying}
              track={musicState.track}
              unlockedCount={achievements.length}
              className="command-audio-hud"
            />
            <MusicPlayer
              tracks={activeTracks}
              className="command-music-player"
              isThemeLinked={isThemeMusicLinked}
              onPlaybackChange={onPlaybackChange}
              onToggleThemeLinked={onToggleThemeMusic}
            />
          </div>
        </section>

        <div className="command-lab-grid">
          <section className="command-lab-card command-achievements" aria-labelledby="achievement-title">
            <div className="command-lab-heading">
              <span>ACHIEVEMENTS</span>
              <strong>{unlockedAchievements.length}/{achievementList.length}</strong>
            </div>
            <h3 id="achievement-title">成就系统</h3>
            <div className="achievement-grid">
              {achievementList.map((achievement) => {
                const isUnlocked = achievements.includes(achievement.id);
                return (
                  <article key={achievement.id} className={isUnlocked ? 'achievement-chip is-unlocked' : 'achievement-chip'}>
                    <span>{achievement.icon}</span>
                    <strong>{achievement.title}</strong>
                    <small>{achievement.desc}</small>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="command-lab-card command-workshop" aria-labelledby="workshop-title">
            <div className="command-lab-heading">
              <span>THEME WORKSHOP</span>
              <button type="button" onClick={onToggleCustomTheme}>
                {customTheme.enabled ? '已启用' : '启用'}
              </button>
            </div>
            <h3 id="workshop-title">自定义主题工坊</h3>
            <p>选择一个能量配色，并调整光效强度。设置会保存在本地。</p>

            <div className="preset-grid">
              {customThemePresets.map((preset) => (
                <button
                  key={preset.key}
                  className={preset.key === customTheme.preset ? 'preset-chip is-active' : 'preset-chip'}
                  type="button"
                  onClick={() => onSetCustomTheme({ preset: preset.key, enabled: true })}
                  style={{ '--preset-color': preset.accent }}
                >
                  <span />
                  {preset.label}
                </button>
              ))}
            </div>

            <label className="workshop-range">
              <span>光效强度 · {customTheme.intensity}%</span>
              <input
                type="range"
                min="24"
                max="88"
                value={customTheme.intensity}
                onChange={(event) => onSetCustomTheme({ intensity: Number(event.target.value), enabled: true })}
              />
            </label>

            <div className="workshop-preview" style={{ '--preview-color': activePreset.accent }}>
              <span />
              <strong>{activePreset.label}</strong>
              <small>{customTheme.enabled ? '正在覆盖当前主题能量色' : '启用后覆盖当前主题能量色'}</small>
            </div>
          </section>
        </div>

        <section className="command-lab-card command-environments" aria-labelledby="environment-title">
          <div className="command-lab-heading">
            <span>ENVIRONMENT SWITCH</span>
            <strong>{environmentPresets.find((preset) => preset.key === environmentKey)?.label}</strong>
          </div>
          <h3 id="environment-title">背景环境切换</h3>
          <div className="environment-preset-grid">
            {environmentPresets.map((preset) => (
              <button
                key={preset.key}
                className={preset.key === environmentKey ? 'environment-preset-card is-active' : 'environment-preset-card'}
                type="button"
                onClick={() => onSetEnvironment(preset.key)}
              >
                <strong>{preset.label}</strong>
                <small>{preset.desc}</small>
              </button>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function AudioVisualizerHud({ activeTheme, isPlaying, track, unlockedCount, className = '' }) {
  const activeThemeLabel = themes[activeTheme]?.modeLabel ?? '默认主页';
  const hudClassName = `${isPlaying ? 'audio-hud is-active' : 'audio-hud'} ${className}`.trim();

  return (
    <aside className={hudClassName} aria-live="polite">
      <div className="audio-hud-orb" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="audio-hud-copy">
        <p>Audio HUD</p>
        <strong>{track?.title ?? '等待音乐点火'}</strong>
        <small>{isPlaying ? `${activeThemeLabel} · 声波同步中` : `已解锁 ${unlockedCount} 个成就`}</small>
      </div>
      <div className="audio-hud-bars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </aside>
  );
}

function useDeferredHeroCharacter(isEnabled) {
  const [canRenderCharacter, setCanRenderCharacter] = useState(false);

  useEffect(() => {
    if (!isEnabled || canRenderCharacter) {
      return undefined;
    }

    if (typeof window === 'undefined') {
      setCanRenderCharacter(true);
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const connection = navigator.connection ?? navigator.mozConnection ?? navigator.webkitConnection;

    if (prefersReducedMotion || connection?.saveData) {
      return undefined;
    }

    let idleId;
    let timeoutId;
    const renderCharacter = () => setCanRenderCharacter(true);

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(renderCharacter, { timeout: 1600 });
    } else {
      timeoutId = window.setTimeout(renderCharacter, 900);
    }

    return () => {
      if (idleId !== undefined) {
        window.cancelIdleCallback(idleId);
      }

      window.clearTimeout(timeoutId);
    };
  }, [canRenderCharacter, isEnabled]);

  return isEnabled && canRenderCharacter;
}

function App() {
  const [activeTheme, setActiveTheme] = useState(() => readStorageValue(storageKeys.theme, getTimeBasedTheme()));
  const [isThemeMusicLinked, setIsThemeMusicLinked] = useState(true);
  const [isCommandDeckOpen, setIsCommandDeckOpen] = useState(false);
  const [musicState, setMusicState] = useState({ isPlaying: false, track: null });
  const [isBootVisible, setIsBootVisible] = useState(() => !readStorageValue(storageKeys.bootSeen, false));
  const [activeBriefingKey, setActiveBriefingKey] = useState(null);
  const [isEggVisible, setIsEggVisible] = useState(false);
  const briefedThemeRef = useRef(null);
  const eggSequenceRef = useRef('');
  const [environmentKey, setEnvironmentKey] = useState(() => readStorageValue(storageKeys.environment, 'nebula'));
  const [achievements, setAchievements] = useState(() => readStorageValue(storageKeys.achievements, []));
  const [visitedThemes, setVisitedThemes] = useState(() => readStorageValue(storageKeys.visitedThemes, ['default']));
  const [visitedEnvironments, setVisitedEnvironments] = useState(() => readStorageValue(storageKeys.visitedEnvironments, [environmentKey]));
  const [visitedPresets, setVisitedPresets] = useState(() => readStorageValue(storageKeys.visitedPresets, []));
  const [customTheme, setCustomTheme] = useState(() => ({
    ...defaultCustomTheme,
    ...readStorageValue(storageKeys.customTheme, defaultCustomTheme),
  }));
  const [activeIntroKey, setActiveIntroKey] = useState(null);
  const theme = themes[activeTheme];
  const todayFestival = useMemo(() => getTodayFestival(), []);
  const themeMetrics = themeMetricsMap[activeTheme] ?? themeMetricsMap.default;
  const shouldRenderHeroCharacter = useDeferredHeroCharacter(activeTheme === 'default');
  const unlockAchievement = useCallback((achievementId) => {
    if (!achievementMap[achievementId] || achievements.includes(achievementId)) {
      return;
    }

    setAchievements((currentAchievements) => {
      if (currentAchievements.includes(achievementId)) {
        return currentAchievements;
      }

      return [...currentAchievements, achievementId];
    });
  }, [achievements]);
  const openCommandDeck = useCallback(() => {
    setIsCommandDeckOpen(true);
    unlockAchievement('deck_operator');
  }, [unlockAchievement]);
  const closeCommandDeck = useCallback(() => setIsCommandDeckOpen(false), []);
  const closeThemeIntro = useCallback(() => {
    setActiveIntroKey(null);
    unlockAchievement('intro_clear');
  }, [unlockAchievement]);
  const closeMissionBriefing = useCallback(() => {
    setActiveBriefingKey(null);
    unlockAchievement('briefing_reader');
  }, [unlockAchievement]);
  const toggleThemeMusicLinked = useCallback(() => {
    setIsThemeMusicLinked((value) => {
      if (value) {
        unlockAchievement('playlist_unlocked');
      }

      return !value;
    });
  }, [unlockAchievement]);
  const selectTheme = useCallback((themeKey) => {
    setActiveTheme(themeKey);
    setIsCommandDeckOpen(false);
    if (themeKey !== 'default') {
      unlockAchievement('first_jump');
    } else if (visitedThemes.some((visitedTheme) => visitedTheme !== 'default')) {
      unlockAchievement('homecoming');
    }
  }, [unlockAchievement, visitedThemes]);
  const launchRandomTheme = useCallback(() => {
    const candidates = themeOptions.filter((option) => option.key !== activeTheme);
    const nextTheme = candidates[Math.floor(Math.random() * candidates.length)] ?? themeOptions[0];
    unlockAchievement('random_warp');
    selectTheme(nextTheme.key);
  }, [activeTheme, selectTheme, unlockAchievement]);
  const setCustomThemePatch = useCallback((patch) => {
    setCustomTheme((currentTheme) => ({ ...currentTheme, ...patch }));
    if (patch.preset) {
      setVisitedPresets((currentPresets) => (
        currentPresets.includes(patch.preset) ? currentPresets : [...currentPresets, patch.preset]
      ));
    }
    if (Number(patch.intensity) >= 80) {
      unlockAchievement('overdrive_glow');
    }
    unlockAchievement('workshop_tuned');
  }, [unlockAchievement]);
  const toggleCustomTheme = useCallback(() => {
    setCustomTheme((currentTheme) => {
      setVisitedPresets((currentPresets) => (
        currentPresets.includes(currentTheme.preset) ? currentPresets : [...currentPresets, currentTheme.preset]
      ));
      return { ...currentTheme, enabled: !currentTheme.enabled };
    });
    unlockAchievement('workshop_tuned');
  }, [unlockAchievement]);
  const handlePlaybackChange = useCallback((nextMusicState) => {
    setMusicState(nextMusicState);
    if (nextMusicState.isPlaying) {
      unlockAchievement('music_ignition');
    }
  }, [unlockAchievement]);
  const completeBoot = useCallback(() => {
    setIsBootVisible(false);
    writeStorageValue(storageKeys.bootSeen, true);
  }, []);
  const setEnvironment = useCallback((nextEnvironmentKey) => {
    setEnvironmentKey(nextEnvironmentKey);
    setVisitedEnvironments((currentEnvironments) => (
      currentEnvironments.includes(nextEnvironmentKey) ? currentEnvironments : [...currentEnvironments, nextEnvironmentKey]
    ));
    unlockAchievement('environment_shift');
  }, [unlockAchievement]);
  const applyWeatherTheme = useCallback(({ theme: nextTheme, environment }) => {
    if (nextTheme && themes[nextTheme] && nextTheme !== activeTheme) {
      selectTheme(nextTheme);
    }
    if (environment && environment !== environmentKey) {
      setEnvironment(environment);
    }
  }, [activeTheme, environmentKey, selectTheme, setEnvironment]);
  const triggerEasterEgg = useCallback(() => {
    setIsEggVisible(true);
    setEnvironment('nebula');
  }, [setEnvironment]);
  const closeEasterEgg = useCallback(() => setIsEggVisible(false), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const activeCustomPreset = useMemo(
    () => customThemePresets.find((preset) => preset.key === customTheme.preset) ?? customThemePresets[0],
    [customTheme.preset],
  );
  const customThemeStyle = useMemo(() => {
    if (!customTheme.enabled) {
      return undefined;
    }

    const glowOpacity = Math.max(0.16, Math.min(0.72, customTheme.intensity / 100));

    return {
      '--accent': activeCustomPreset.accent,
      '--accent-deep': activeCustomPreset.deep,
      '--accent-soft': activeCustomPreset.soft,
      '--theme-glow': `rgba(${activeCustomPreset.rgb}, ${glowOpacity})`,
      '--button-primary-text': activeCustomPreset.text,
      '--button-primary-start': activeCustomPreset.soft,
      '--button-primary-mid': activeCustomPreset.accent,
      '--button-primary-end': activeCustomPreset.deep,
      '--button-primary-shadow': `rgba(${activeCustomPreset.rgb}, ${glowOpacity * 0.78})`,
      '--chip-active-text': activeCustomPreset.text,
      '--chip-active-start': activeCustomPreset.soft,
      '--chip-active-mid': activeCustomPreset.accent,
      '--chip-active-end': activeCustomPreset.deep,
      '--chip-active-shadow': `rgba(${activeCustomPreset.rgb}, ${glowOpacity * 0.78})`,
      '--music-dock-highlight': `rgba(${activeCustomPreset.rgb}, ${glowOpacity * 0.35})`,
    };
  }, [activeCustomPreset, customTheme.enabled, customTheme.intensity]);
  const allTracks = useMemo(() => trackLibrary.map((track) => ({ ...track })), []);
  const activeTracks = useMemo(
    () => {
      if (!isThemeMusicLinked) {
        return allTracks;
      }

      return (
        themeTrackMap[activeTheme] ?? []
      ).map(({ trackId, ...overrides }) => {
        const track = trackMap[trackId];
        return track ? { ...track, ...overrides } : null;
      }).filter(Boolean);
    },
    [activeTheme, allTracks, isThemeMusicLinked],
  );

  useEffect(() => {
    writeStorageValue(storageKeys.theme, activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    writeStorageValue(storageKeys.achievements, achievements);
  }, [achievements]);

  useEffect(() => {
    writeStorageValue(storageKeys.customTheme, customTheme);
  }, [customTheme]);

  useEffect(() => {
    writeStorageValue(storageKeys.visitedPresets, visitedPresets);
    if (customThemePresets.every((preset) => visitedPresets.includes(preset.key))) {
      unlockAchievement('palette_collector');
    }
  }, [unlockAchievement, visitedPresets]);

  useEffect(() => {
    writeStorageValue(storageKeys.environment, environmentKey);
  }, [environmentKey]);

  useEffect(() => {
    writeStorageValue(storageKeys.visitedEnvironments, visitedEnvironments);
    if (environmentPresets.every((preset) => visitedEnvironments.includes(preset.key))) {
      unlockAchievement('environment_collector');
    }
  }, [unlockAchievement, visitedEnvironments]);

  useEffect(() => {
    writeStorageValue(storageKeys.visitedThemes, visitedThemes);
    if (themeOptions.every((option) => visitedThemes.includes(option.key))) {
      unlockAchievement('theme_collector');
    }
    if (['delta', 'cs2', 'valorant'].every((themeKey) => visitedThemes.includes(themeKey))) {
      unlockAchievement('fps_route');
    }
    if (['lol', 'overwatch'].every((themeKey) => visitedThemes.includes(themeKey))) {
      unlockAchievement('hero_route');
    }
  }, [unlockAchievement, visitedThemes]);

  useEffect(() => {
    const regularAchievements = achievementList.filter((achievement) => achievement.id !== 'completionist');
    if (regularAchievements.every((achievement) => achievements.includes(achievement.id))) {
      unlockAchievement('completionist');
    }
  }, [achievements, unlockAchievement]);

  useEffect(() => {
    setVisitedThemes((currentThemes) => (
      currentThemes.includes(activeTheme) ? currentThemes : [...currentThemes, activeTheme]
    ));
  }, [activeTheme]);

  useEffect(() => {
    if (isBootVisible || briefedThemeRef.current === activeTheme) {
      return;
    }

    briefedThemeRef.current = activeTheme;
    setActiveBriefingKey(activeTheme);
  }, [activeTheme, isBootVisible]);

  useEffect(() => {
    const contactSection = document.getElementById('contact');
    if (!contactSection || achievements.includes('deep_scroll')) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          unlockAchievement('deep_scroll');
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );

    observer.observe(contactSection);
    return () => observer.disconnect();
  }, [achievements, unlockAchievement]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault();
        setIsCommandDeckOpen((value) => {
          const nextValue = !value;
          if (nextValue) {
            unlockAchievement('deck_operator');
            unlockAchievement('keyboard_commander');
          }

          return nextValue;
        });
        return;
      }

      if (!isCommandDeckOpen) {
        if (/^[a-z]$/.test(key)) {
          eggSequenceRef.current = `${eggSequenceRef.current}${key}`.slice(-4);
          if (eggSequenceRef.current === 'chen') {
            triggerEasterEgg();
            eggSequenceRef.current = '';
          }
        }

        return;
      }

      if (key === 'escape') {
        event.preventDefault();
        closeCommandDeck();
        return;
      }

      if (key === 'r') {
        event.preventDefault();
        launchRandomTheme();
        return;
      }

      if (/^[1-6]$/.test(key)) {
        event.preventDefault();
        selectTheme(themeOptions[Number(key) - 1].key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeCommandDeck, isCommandDeckOpen, launchRandomTheme, selectTheme, triggerEasterEgg, unlockAchievement]);

  useEffect(() => {
    if (isCommandDeckOpen) {
      setActiveIntroKey(null);
      return undefined;
    }

    if (activeTheme === 'default') {
      setActiveIntroKey(null);
      return undefined;
    }

    const intro = themeIntroMap[activeTheme];
    if (!intro?.src) {
      setActiveIntroKey(null);
      return undefined;
    }

    setActiveIntroKey(null);

    let cancelled = false;

    fetch(intro.src, { method: 'HEAD' })
      .then((response) => {
        if (!cancelled && response.ok) {
          setActiveIntroKey(activeTheme);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setActiveIntroKey(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeTheme, isCommandDeckOpen]);

  return (
    <div
      className={`app theme-${activeTheme} ${musicState.isPlaying ? 'is-music-reactive' : ''} ${customTheme.enabled ? 'has-custom-theme' : ''}`.trim()}
      style={customThemeStyle}
    >
      <EnvironmentLayer environmentKey={environmentKey} />
      <CursorParticles isActive={musicState.isPlaying} />
      <div className="theme-flash" key={activeTheme} aria-hidden="true" />
      <div className="page-shell">
        <div className="ambient ambient-one" aria-hidden="true" />
        <div className="ambient ambient-two" aria-hidden="true" />

        <header className="header-chrome">
          <div className="theme-toolbar">
            <div className="theme-switcher" role="tablist" aria-label="主页主题切换">
              {themeOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTheme === option.key}
                  className={activeTheme === option.key ? 'theme-chip is-active' : 'theme-chip'}
                  onClick={() => selectTheme(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              className="command-launcher"
              type="button"
              onClick={openCommandDeck}
              aria-label="打开主题指挥台"
              title="Ctrl / ⌘ + K 打开主题指挥台，音乐和 HUD 已收纳在这里"
            >
              <span className="command-launcher-core">⌘K</span>
              <span>{musicState.isPlaying ? '音乐控制台' : '指挥台'}</span>
            </button>
          </div>

        </header>

        <main className="theme-stage" key={activeTheme}>
          <RevealSection className="hero theme-transition-panel" id="home">
            <div className="hero-copy theme-enter-left">
              <p className="eyebrow">{theme.badge}</p>
              <h1>
                {theme.title}
                <span>{theme.titleSub}</span>
              </h1>
              <p className="lead">{theme.lead}</p>

              <div className="hero-actions">
                <a className="button button-primary" href="mailto:1410762621@qq.com">发邮件给我</a>
                <a className="button button-secondary" href="https://github.com/chenliwen123/chenliwen123/issues/new" target="_blank" rel="noreferrer">留言给我</a>
              </div>

              <ul className="hero-facts">
                <GeoIndicator label="Base" value="Changchun, China" icon="◈" />
                <GeoIndicator label="Theme" value={theme.modeLabel} icon="◆" />
                <GeoIndicator label="Github" value="@chenliwen123" icon="◉" />
              </ul>
            </div>

            <aside className="hero-panel theme-enter-right">
              {activeTheme === 'default' && shouldRenderHeroCharacter ? (
                <Suspense fallback={<SpotlightCard theme={theme} />}>
                  <HeroCharacter
                    title={theme.spotlightTitle}
                    description={theme.spotlightDesc}
                    meta={[...theme.spotlightMeta, ['展示方式', '3D 人物 / 微交互']]}
                  />
                </Suspense>
              ) : (
                <SpotlightCard theme={theme} />
              )}

              <article className="feature-card mode-card">
                <span className="card-tag">MODE</span>
                <h2>{theme.modeCardTitle}</h2>
                <p>{theme.modeCardDesc}</p>
                <ModeVisual meta={theme.modeCardMeta} />
              </article>
            </aside>
          </RevealSection>

          <RevealSection className="stats theme-transition-panel" id="stats">
            <div className="section-stack theme-enter-bottom theme-delay-1">
              <div className="section-heading">
                <p className="eyebrow">DATA</p>
                <h2>{themeMetrics.title}</h2>
                <p className="section-note">{themeMetrics.description}</p>
              </div>

              <div className="stats-grid">
                {themeMetrics.cards.map((card) => (
                  <DataRing
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    note={card.note}
                    size={100}
                  />
                ))}
              </div>
            </div>
          </RevealSection>

          <FestivalSurprise festival={todayFestival} onActivateTheme={selectTheme} />

          <WeatherSyncPanel onApplyTheme={applyWeatherTheme} />

          <VisitorPulse onEgg={triggerEasterEgg} />

          <TimelineSection />

          <AutoChangelog />

          <RevealSection className="story theme-transition-panel" id="about">
            <div className="section-stack theme-enter-bottom theme-delay-1">
              <div className="section-heading">
                <p className="eyebrow">ABOUT</p>
                <h2>{theme.aboutTitle}</h2>
              </div>

              <div className="story-grid">
                {theme.aboutCards.map(([index, title, desc]) => (
                  <article className="story-card" key={index}>
                    <span>{index}</span>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </RevealSection>

          <RevealSection className="focus theme-transition-panel" id="focus">
            <div className="section-stack theme-enter-bottom theme-delay-2">
              <div className="section-heading">
                <p className="eyebrow">FOCUS</p>
                <h2>{theme.focusTitle}</h2>
              </div>

              <div className="focus-layout">
                {theme.focusPanels.map(([label, title, desc, large]) => (
                  <article key={title} className={large ? 'focus-panel focus-panel-large' : 'focus-panel'}>
                    <p className="panel-label">{label}</p>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </article>
                ))}
              </div>

              <FloatingTagCloud tags={theme.tags} />
            </div>
          </RevealSection>

          <RevealSection className="contact theme-transition-panel" id="contact">
            <div className="contact-card theme-enter-bottom theme-delay-3">
              <div>
                <p className="eyebrow">CONTACT</p>
                <h2>如果你也想把个人主页做成一套可切换主题的作品，欢迎来找我。</h2>
              </div>
              <div className="contact-actions">
                <a className="button button-primary" href="mailto:1410762621@qq.com">发送邮件</a>
                <a className="button button-secondary" href="https://github.com/chenliwen123" target="_blank" rel="noreferrer">GitHub 主页</a>
              </div>
            </div>
          </RevealSection>

          <GitHubMessages onUnlock={() => unlockAchievement('guestbook_signal')} />
        </main>

        <footer className="footer">
          <p>© {currentYear} Chenli Wen. Crafted with warmth, motion, games and a little music.</p>
        </footer>
      </div>

      <EasterEggOverlay isVisible={isEggVisible} onClose={closeEasterEgg} />

      {isBootVisible ? <BootLoader onComplete={completeBoot} /> : null}

      {!isBootVisible && activeBriefingKey ? (
        <MissionBriefing themeKey={activeBriefingKey} onClose={closeMissionBriefing} />
      ) : null}

      <CommandDeck
        activeTracks={activeTracks}
        achievements={achievements}
        activeTheme={activeTheme}
        customTheme={customTheme}
        environmentKey={environmentKey}
        isOpen={isCommandDeckOpen}
        musicState={musicState}
        isThemeMusicLinked={isThemeMusicLinked}
        onClose={closeCommandDeck}
        onLaunchRandom={launchRandomTheme}
        onPlaybackChange={handlePlaybackChange}
        onSetEnvironment={setEnvironment}
        onSelectTheme={selectTheme}
        onSetCustomTheme={setCustomThemePatch}
        onToggleCustomTheme={toggleCustomTheme}
        onToggleThemeMusic={toggleThemeMusicLinked}
      />

      {activeIntroKey && themeIntroMap[activeIntroKey] ? (
        <ThemeIntroOverlay
          intro={themeIntroMap[activeIntroKey]}
          onClose={closeThemeIntro}
        />
      ) : null}

      <ExChatWidget activeTheme={activeTheme} />
    </div>
  );
}

export default App;
