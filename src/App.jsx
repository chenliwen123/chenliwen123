import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import MusicPlayer from './components/MusicPlayer';
import RevealSection from './components/RevealSection';
import lolTrack from '../assets/lol/lol-theme.mp3';
import deltaTrack from '../assets/delta/delta-theme.mp3';
import cs2Track from '../assets/cs2/cs2-theme.mp3';
import overwatchTrack from '../assets/overwatch/overwatch-theme.mp3';
import valorantTrack from '../assets/valorant/valorant-theme.mp3';

const HeroCharacter = lazy(() => import('./components/HeroCharacter'));

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

const topNav = [
  { href: '#about', label: '关于' },
  { href: '#focus', label: '方向' },
  { href: '#contact', label: '联系' },
];

const themeOptions = [
  { key: 'default', label: '主页' },
  { key: 'lol', label: '英雄联盟' },
  { key: 'delta', label: '三角洲' },
  { key: 'cs2', label: 'CS2' },
  { key: 'overwatch', label: '守望先锋' },
  { key: 'valorant', label: '瓦罗兰特' },
];

const trackLibrary = [
  { id: 'lol-theme', title: 'Rift Anthem', subtitle: '英雄联盟主题 BGM', src: lolTrack, type: 'audio' },
  { id: 'delta-theme', title: 'Tactical Advance', subtitle: '三角洲主题 BGM', src: deltaTrack, type: 'audio' },
  { id: 'cs2-theme', title: 'Site Entry', subtitle: 'CS2 主题 BGM', src: cs2Track, type: 'audio' },
  { id: 'overwatch-theme', title: 'Hero Relay', subtitle: '守望先锋主题 BGM', src: overwatchTrack, type: 'audio' },
  { id: 'valorant-theme', title: 'Night Protocol', subtitle: '瓦罗兰特主题 BGM', src: valorantTrack, type: 'audio' },
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
    src: '/theme-intros/lol-intro.mp4',
    kicker: 'RIFT HIGHLIGHTS',
    title: '峡谷高光回放',
    description: '切入主题前，先用一段精彩操作把情绪拉满。',
  },
  delta: {
    src: '/theme-intros/delta-intro.mp4',
    kicker: 'TACTICAL ENTRY',
    title: '战区部署集锦',
    description: '先看推进、协同和正面作战的关键镜头，再进入主题页。',
  },
  cs2: {
    src: '/theme-intros/cs2-intro.mp4',
    kicker: 'SITE EXECUTION',
    title: '残局与爆点操作',
    description: '先用高光镜头建立竞技 FPS 的压迫感，再展开完整页面。',
  },
  overwatch: {
    src: '/theme-intros/overwatch-intro.mp4',
    kicker: 'HERO MOMENTS',
    title: '英雄入场高能片段',
    description: '开场先放一段英雄集锦，让主题切换更像角色登场。',
  },
  valorant: {
    src: '/theme-intros/valorant-intro.mp4',
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

function App() {
  const [activeTheme, setActiveTheme] = useState('default');
  const [isThemeMusicLinked, setIsThemeMusicLinked] = useState(true);
  const [activeIntroKey, setActiveIntroKey] = useState(null);
  const theme = themes[activeTheme];
  const themeMetrics = themeMetricsMap[activeTheme] ?? themeMetricsMap.default;
  const currentYear = useMemo(() => new Date().getFullYear(), []);
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
    if (activeTheme === 'default') {
      setActiveIntroKey(null);
      return undefined;
    }

    const intro = themeIntroMap[activeTheme];
    if (!intro?.src) {
      setActiveIntroKey(null);
      return undefined;
    }

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
  }, [activeTheme]);

  return (
    <div className={`app theme-${activeTheme}`}>
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
                  onClick={() => setActiveTheme(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* <div className="topbar">
            <a className="brand" href="#home">CHENLIWEN</a>
            <nav className="nav">
              {topNav.map((item) => (
                <a key={item.href} href={item.href}>{item.label}</a>
              ))}
            </nav>
            <a className="mini-link" href="mailto:1410762621@qq.com">Say Hello</a>
          </div> */}
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
                <a className="button button-secondary" href="https://github.com/chenliwen123/diary/issues/new" target="_blank" rel="noreferrer">留言给我</a>
              </div>

              <ul className="hero-facts">
                <li>
                  <span className="fact-label">Base</span>
                  <strong>Changchun, China</strong>
                </li>
                <li>
                  <span className="fact-label">Theme</span>
                  <strong>{theme.modeLabel}</strong>
                </li>
                <li>
                  <span className="fact-label">Github</span>
                  <strong>@chenliwen123</strong>
                </li>
              </ul>
            </div>

            <aside className="hero-panel theme-enter-right">
              {activeTheme === 'default' ? (
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
                <div className="card-grid">
                  {theme.modeCardMeta.map(([label, value]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
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
                  <article key={card.label} className="stats-card">
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                    <p>{card.note}</p>
                  </article>
                ))}
              </div>
            </div>
          </RevealSection>

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

              <div className="tag-list" aria-label="关注标签">
                {theme.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
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
        </main>

        <footer className="footer">
          <p>© {currentYear} Chenli Wen. Crafted with warmth, motion, games and a little music.</p>
        </footer>
      </div>

      <MusicPlayer
        tracks={activeTracks}
        className="music-dock"
        isThemeLinked={isThemeMusicLinked}
        onToggleThemeLinked={() => setIsThemeMusicLinked((value) => !value)}
      />

      {activeIntroKey && themeIntroMap[activeIntroKey] ? (
        <ThemeIntroOverlay
          intro={themeIntroMap[activeIntroKey]}
          onClose={() => setActiveIntroKey(null)}
        />
      ) : null}
    </div>
  );
}

export default App;
