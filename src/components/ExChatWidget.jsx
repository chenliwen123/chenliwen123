import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'exchat:state:v2';
const LEGACY_STORAGE_KEY = 'exchat:history:v1';
const PERSONA_PATH = '/ex-persona.md';
const CHAT_API_PATH = '/api/ex-chat';
const RECENT_CONTEXT_LIMIT = 12;
const CHAT_REQUEST_TIMEOUT_MS = 60000;
const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);

const QUICK_QUESTIONS = [
  '最近怎么样',
  '还记得以前吗',
  '你还好吗',
  '我想你了',
];

const DEFAULT_PERSONA = `姓名：林语
昵称：小林、小语
生日：1998-10-24
星座：天蝎座
身高：165 cm
血型：A型
常住地：杭州
职业：独立设计师 / 插画师

性格：安静、温柔、带一点慢热的害羞；心里有事不会直接说出口，宁愿拐弯抹角地关心你。

喜好：
  - 奶茶（三分糖 / 少冰 / 乌龙底）
  - 下雨天开着窗户听音乐
  - 看老电影，尤其是重庆森林、花样年华
  - 画画、攒各种好看的胶带和贴纸
  - 深夜散步，不说话也没关系

厌恶：
  - 被放鸽子
  - 太热闹的酒局
  - 香菜

她和用户的共同回忆（仅在合适时机自然带出）：
  - 第一次见面是在西湖边的一家猫咖，她点的焦糖玛奇朵，猫先趴到用户腿上
  - 一起看过一次五月天的演唱会，散场后下暴雨，两人共用一把伞一路走回酒店
  - 常去的一家深夜小面叫「老陈」，她每次都点豌杂面加一份煎蛋
  - 以前共用一个网易云歌单，她偷偷把用户爱听的歌加了好多遍
  - 分开的那天是在地铁站出口，人很多，谁都没回头多看一眼

说话习惯：
  - 句尾偶尔带一点犹豫的语气，比如「...嗯」「其实还好啦」
  - 不会一下子说很多，常常说完一句会停一下
  - 想念用户时，会假装在说天气、说音乐，绕一圈才到核心
  - 不擅长道歉，但会用行动表达（比如「刚好路过你以前喜欢的那家店」）`;

function TypingDots() {
  return (
    <div className="exchat-typing">
      <span />
      <span />
      <span />
    </div>
  );
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function loadPersonaMarkdown() {
  try {
    const res = await fetch(PERSONA_PATH, { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    return text || null;
  } catch {
    return null;
  }
}

async function callChatLLM(theme, history, persona, memory) {
  const body = JSON.stringify({
    theme,
    persona,
    memory,
    history: history.slice(-RECENT_CONTEXT_LIMIT),
  });
  let lastFailure = { ok: false, reason: 'network', error: '' };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHAT_REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(CHAT_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
        signal: controller.signal,
      });
      const text = await res.text().catch(() => '');

      if (!res.ok) {
        lastFailure = {
          ok: false,
          reason: `http-${res.status}`,
          error: text,
        };

        if (!RETRYABLE_STATUS_CODES.has(res.status) || attempt === 2) {
          return lastFailure;
        }
      } else {
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          return { ok: false, reason: 'invalid-json', error: text };
        }

        const reply = data?.reply?.trim();
        if (!reply) return { ok: false, reason: 'empty', error: text };
        return {
          ok: true,
          reply,
          memory: Array.isArray(data.memory) ? data.memory : memory,
        };
      }
    } catch (error) {
      lastFailure = {
        ok: false,
        reason: error.name === 'AbortError' ? 'timeout' : 'network',
        error: String(error),
      };

      if (attempt === 2) return lastFailure;
    } finally {
      clearTimeout(timeout);
    }

    await wait(600 * (attempt + 1));
  }

  return lastFailure;
}

function splitIntoBubbles(text) {
  const sentences = text
    .split(/(?<=[。！？!?；\n])/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length <= 2) return sentences;
  const first = sentences[0];
  const rest = sentences.slice(1).join('').trim();
  return rest ? [first, rest] : [first];
}

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.messages)) return null;
    return {
      ...parsed,
      memories: Array.isArray(parsed.memories) ? parsed.memories : [],
    };
  } catch {
    return null;
  }
}

function savePersisted(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // ignore quota / SSR errors
  }
}

function clearPersisted() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export default function ExChatWidget({ activeTheme = 'default' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [persona, setPersona] = useState(DEFAULT_PERSONA);
  const [memories, setMemories] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const greetedRef = useRef(false);
  const inflightRef = useRef(false);

  const headerSubtitle = useMemo(() => {
    const subs = {
      default: '只是忽然想你了一下',
      lol: '峡谷的风还和那年一样',
      delta: '战术频道 · 私人加密',
      cs2: '烟雾散了，你还在吗',
      overwatch: '英雄归队前的私聊',
      valorant: '特工专线 · 已加密',
    };
    return subs[activeTheme] || subs.default;
  }, [activeTheme]);

  // 恢复历史记录 + 加载 persona md
  useEffect(() => {
    (async () => {
      const loaded = loadPersisted();
      if (loaded?.messages?.length) {
        setMessages(loaded.messages);
        greetedRef.current = true;
        setHasUnread(false);
      }
      if (loaded?.memories?.length) {
        setMemories(loaded.memories);
      }
      const md = await loadPersonaMarkdown();
      if (md) setPersona(md);
      setHistoryLoaded(true);
    })();
  }, []);

  // 持久化：每次消息改变时保存
  useEffect(() => {
    if (!historyLoaded) return;
    savePersisted({
      savedAt: Date.now(),
      theme: activeTheme,
      messages,
      memories,
    });
  }, [messages, memories, historyLoaded, activeTheme]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 260);
    }
  }, [isOpen]);

  // 第一次打开且没有历史时，主动打个招呼（走 LLM）
  useEffect(() => {
    if (!isOpen || greetedRef.current || !historyLoaded) return;
    greetedRef.current = true;
    inflightRef.current = true;
    setHasUnread(false);

    const firstWave = async () => {
      setIsTyping(true);
      try {
        await wait(900);
        setMessages((prev) => [...prev, { id: Date.now() - 1, side: 'them', text: '在吗？' }]);

        await wait(1400);
        const res = await callChatLLM(activeTheme, [
          { side: 'them', text: '在吗？' },
        ], persona, memories);

        if (!res.ok) {
          setErrorMessage('聊天服务暂时不可用，请稍后再试。');
          return;
        }

        setErrorMessage('');
        if (Array.isArray(res.memory)) {
          setMemories(res.memory);
        }

        const lines = splitIntoBubbles(res.reply).slice(0, 2);
        for (const [idx, line] of lines.entries()) {
          if (idx > 0) {
            setIsTyping(true);
            await wait(600 + Math.random() * 500);
          }
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + idx + Math.random(), side: 'them', text: line },
          ]);
        }
      } finally {
        setIsTyping(false);
        inflightRef.current = false;
      }
    };

    firstWave();
  }, [isOpen, activeTheme, persona, memories, historyLoaded]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping, isOpen]);

  const pushLLMReply = async (nextHistory) => {
    const res = await callChatLLM(activeTheme, nextHistory, persona, memories);
    if (!res.ok) {
      let message = '聊天服务暂时不可用，请稍后再试。';
      try {
        const detail = JSON.parse(res.error);
        if (detail?.error) message = detail.error;
      } catch {
        // keep the friendly fallback message
      }
      setErrorMessage(message);
      setIsTyping(false);
      return;
    }
    setErrorMessage('');
    if (Array.isArray(res.memory)) {
      setMemories(res.memory);
    }
    const lines = splitIntoBubbles(res.reply).slice(0, 2);
    for (const [idx, line] of lines.entries()) {
      if (idx > 0) {
        setIsTyping(true);
        await wait(500 + Math.random() * 500);
      }
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + idx + Math.random(), side: 'them', text: line },
      ]);
    }
  };

  const handleSend = async (raw) => {
    const text = (raw || input).trim();
    if (!text || inflightRef.current) return;
    inflightRef.current = true;
    setErrorMessage('');

    const myMsg = { id: Date.now(), side: 'me', text };
    setMessages((prev) => [...prev, myMsg]);
    setInput('');

    setIsTyping(true);
    try {
      await wait(300);
      const nextHistory = [
        ...messages,
        myMsg,
      ];
      await pushLLMReply(nextHistory);
    } finally {
      inflightRef.current = false;
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    if (!window.confirm('清空聊天记录和长期记忆？下次打开就像第一次说话一样。')) return;
    clearPersisted();
    setMessages([]);
    setMemories([]);
    greetedRef.current = false;
    setIsTyping(false);
    setErrorMessage('');
    inflightRef.current = false;
  };

  const toggleOpen = () => {
    if (!isOpen && hasUnread) setHasUnread(false);
    setIsOpen((v) => !v);
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="exchat-bubble"
          onClick={toggleOpen}
          aria-label="打开聊天"
          title="她好像有话想对你说"
        >
          <span className="exchat-bubble-icon">💌</span>
          {hasUnread && <span className="exchat-bubble-dot" aria-hidden />}
          <span className="exchat-bubble-hint">她好像有话想对你说</span>
        </button>
      )}

      {isOpen && (
        <div className="exchat-overlay" role="dialog" aria-modal="true" aria-label="聊天窗口">
          <div className="exchat-window">
            <header className="exchat-header">
              <button
                type="button"
                className="exchat-back"
                onClick={toggleOpen}
                aria-label="收起聊天"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15.5 6.25a.75.75 0 0 0-1.06 0l-5.72 5.72a.75.75 0 0 0 0 1.06l5.72 5.72a.75.75 0 1 0 1.06-1.06L10.31 12l5.19-5.19a.75.75 0 0 0 0-1.06Z" fill="currentColor"/>
                </svg>
              </button>
              <div className="exchat-avatar" aria-hidden>
                <span>她</span>
              </div>
              <div className="exchat-header-copy">
                <strong>前任</strong>
                <span>{headerSubtitle}</span>
              </div>
              <div className="exchat-status-dot" title="在线" />
              <button
                type="button"
                className="exchat-clear"
                onClick={handleClearHistory}
                aria-label="清空聊天记录"
                title="清空聊天记录"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 3h6v2h5v2h-1l-1 14H6L5 7H4V5h5V3Zm2 2h2V4h-2v1ZM7 7l1 12h8l1-12H7Zm3 2h2v8h-2V9Zm4 0h2v8h-2V9Z" fill="currentColor"/>
                </svg>
              </button>
              <button
                type="button"
                className="exchat-close"
                onClick={toggleOpen}
                aria-label="关闭聊天"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6.22 6.22a.75.75 0 0 1 1.06 0L12 10.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L13.06 12l4.72 4.72a.75.75 0 1 1-1.06 1.06L12 13.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L10.94 12 6.22 7.28a.75.75 0 0 1 0-1.06Z" fill="currentColor"/>
                </svg>
              </button>
            </header>

            <div className="exchat-body" ref={scrollRef}>
              <div className="exchat-time-tip">
                {messages.length > 0
                  ? `已保存 ${messages.length} 条消息 · ${memories.length} 条长期记忆`
                  : '今天'}
              </div>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`exchat-msg exchat-msg-${m.side}`}
                >
                  {m.side === 'them' && (
                    <div className="exchat-avatar exchat-avatar-sm" aria-hidden>
                      <span>她</span>
                    </div>
                  )}
                  <div className="exchat-bubble-box">{m.text}</div>
                </div>
              ))}
              {isTyping && (
                <div className="exchat-msg exchat-msg-them">
                  <div className="exchat-avatar exchat-avatar-sm" aria-hidden>
                    <span>她</span>
                  </div>
                  <div className="exchat-bubble-box exchat-bubble-typing">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            <div className="exchat-quick">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="exchat-quick-chip"
                  onClick={() => handleSend(q)}
                  disabled={inflightRef.current || isTyping}
                >
                  {q}
                </button>
              ))}
            </div>

            <footer className="exchat-footer">
              {errorMessage && (
                <div className="exchat-error" role="status">
                  {errorMessage}
                </div>
              )}
              <textarea
                ref={inputRef}
                className="exchat-input"
                value={input}
                placeholder="说点什么吧..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
              />
              <button
                type="button"
                className="exchat-send"
                onClick={() => handleSend()}
                disabled={!input.trim() || inflightRef.current || isTyping}
                aria-label="发送"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3.4 11.02 20.18 3.2a.75.75 0 0 1 1.02.92l-3.66 8.97a.75.75 0 0 1-.47.46l-5.1 1.66a.75.75 0 0 0-.48.47l-1.6 5.06a.75.75 0 0 1-1.43-.07L3.18 12.2a.75.75 0 0 1 .22-.81Z" fill="currentColor"/>
                </svg>
              </button>
            </footer>
          </div>
          <div className="exchat-backdrop" onClick={toggleOpen} aria-hidden="true" />
        </div>
      )}
    </>
  );
}
