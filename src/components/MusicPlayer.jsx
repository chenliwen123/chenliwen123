import { useEffect, useMemo, useRef, useState } from 'react';
import { PulseStatus } from './AbstractVisuals';

const volumeStorageKey = 'chenliwen-music-volume-v1';

function readVolumePreference() {
  if (typeof window === 'undefined') {
    return 0.72;
  }

  const storedVolume = Number(window.localStorage.getItem(volumeStorageKey));
  return Number.isFinite(storedVolume) ? Math.max(0, Math.min(1, storedVolume)) : 0.72;
}

function formatTrackLabel(track, index, total) {
  return `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')} · ${track.subtitle}`;
}

function ControlIcon({ name }) {
  const icons = {
    previous: (
      <path d="M14 7.25a.75.75 0 0 0-1.19-.61l-6.4 4.75a.75.75 0 0 0 0 1.21l6.4 4.75A.75.75 0 0 0 14 16.75v-9.5Zm5 0a.75.75 0 0 0-1.5 0v9.5a.75.75 0 0 0 1.5 0v-9.5Z" />
    ),
    next: (
      <path d="M10 7.25a.75.75 0 0 1 1.19-.61l6.4 4.75a.75.75 0 0 1 0 1.21l-6.4 4.75A.75.75 0 0 1 10 16.75v-9.5Zm-5 0a.75.75 0 0 1 1.5 0v9.5a.75.75 0 0 1-1.5 0v-9.5Z" />
    ),
    play: (
      <path d="M8.8 6.32c0-1.1 1.22-1.78 2.16-1.2l7.03 4.38c.89.56.89 1.84 0 2.4l-7.03 4.38c-.94.59-2.16-.09-2.16-1.19V6.32Z" />
    ),
    pause: (
      <path d="M8 6.5A1.5 1.5 0 0 1 9.5 5h1A1.5 1.5 0 0 1 12 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 8 17.5v-11Zm6 0A1.5 1.5 0 0 1 15.5 5h1A1.5 1.5 0 0 1 18 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 14 17.5v-11Z" />
    ),
    volume: (
      <>
        <path d="M10.23 7.1a1 1 0 0 1 1.7.7v8.4a1 1 0 0 1-1.7.7l-2.76-2.7H5a1 1 0 0 1-1-1V10.8a1 1 0 0 1 1-1h2.47l2.76-2.7Z" />
        <path d="M14.8 9.05a.75.75 0 0 1 1.06 0 4.2 4.2 0 0 1 0 5.9.75.75 0 1 1-1.06-1.06 2.7 2.7 0 0 0 0-3.78.75.75 0 0 1 0-1.06Z" />
        <path d="M17.28 6.75a.75.75 0 0 1 1.06 0 7.44 7.44 0 0 1 0 10.5.75.75 0 0 1-1.06-1.06 5.94 5.94 0 0 0 0-8.38.75.75 0 0 1 0-1.06Z" />
      </>
    ),
    muted: (
      <>
        <path d="M10.23 7.1a1 1 0 0 1 1.7.7v8.4a1 1 0 0 1-1.7.7l-2.76-2.7H5a1 1 0 0 1-1-1V10.8a1 1 0 0 1 1-1h2.47l2.76-2.7Z" />
        <path d="M15.1 9.14a.75.75 0 0 1 1.06 0L18 10.98l1.84-1.84a.75.75 0 1 1 1.06 1.06L19.06 12l1.84 1.84a.75.75 0 0 1-1.06 1.06L18 13.06l-1.84 1.84a.75.75 0 1 1-1.06-1.06L16.94 12l-1.84-1.8a.75.75 0 0 1 0-1.06Z" />
      </>
    ),
    collapse: (
      <path d="M7.72 14.78a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 1 1-1.06 1.06L12 11.56l-3.22 3.22a.75.75 0 0 1-1.06 0Z" />
    ),
    expand: (
      <path d="M16.28 9.22a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L7.72 10.28a.75.75 0 0 1 1.06-1.06L12 12.44l3.22-3.22a.75.75 0 0 1 1.06 0Z" />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {icons[name]}
    </svg>
  );
}

export default function MusicPlayer({
  tracks,
  className = '',
  isThemeLinked = true,
  onPlaybackChange,
  onToggleThemeLinked,
}) {
  const audioRef = useRef(null);
  const previousTrackKeyRef = useRef(null);
  const [currentTrackId, setCurrentTrackId] = useState(tracks[0]?.id ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [volume, setVolume] = useState(readVolumePreference);
  const [status, setStatus] = useState('点击按钮开启页面音乐');

  useEffect(() => {
    if (!tracks.length) {
      setCurrentTrackId(null);
      return;
    }

    setCurrentTrackId((previousTrackId) => {
      if (previousTrackId && tracks.some((track) => track.id === previousTrackId)) {
        return previousTrackId;
      }

      return tracks[0].id;
    });
  }, [tracks]);

  const currentIndex = useMemo(
    () => Math.max(0, tracks.findIndex((track) => track.id === currentTrackId)),
    [currentTrackId, tracks],
  );
  const currentTrack = useMemo(() => tracks[currentIndex] ?? tracks[0], [currentIndex, tracks]);
  const canChangeTrack = tracks.length > 1;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return undefined;

    const onEnded = () => {
      const nextIndex = (currentIndex + 1) % tracks.length;
      setCurrentTrackId(tracks[nextIndex].id);
      setStatus(`已切换到下一首：${tracks[nextIndex].title}`);
    };

    const onPlay = () => {
      setIsPlaying(true);
      setStatus(`正在播放：${currentTrack.title}`);
      onPlaybackChange?.({ isPlaying: true, track: currentTrack });
    };

    const onPause = () => {
      setIsPlaying(false);
      onPlaybackChange?.({ isPlaying: false, track: currentTrack });
    };
    const onVolumeChange = () => {
      setIsMuted(audio.muted);
      setVolume(audio.volume);
    };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('volumechange', onVolumeChange);

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('volumechange', onVolumeChange);
    };
  }, [currentIndex, currentTrack, onPlaybackChange, tracks]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      previousTrackKeyRef.current = null;
      return;
    }

    const trackKey = `${currentTrack.id}:${currentTrack.src}`;
    const didTrackChange = previousTrackKeyRef.current !== trackKey;
    previousTrackKeyRef.current = trackKey;

    if (!didTrackChange) {
      return;
    }

    if (!isPlaying) {
      setStatus(`当前曲目：${currentTrack.title}`);
      return;
    }

    audio.load();
    audio.play().catch(() => {
      setIsPlaying(false);
      setStatus('当前媒体暂时无法自动切换播放，请手动再点一次播放');
    });
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = isMuted;
    }
  }, [currentTrack, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(volumeStorageKey, String(volume));
    }
  }, [currentTrack, volume]);

  const changeTrack = (direction) => {
    if (!canChangeTrack) return;

    const nextIndex = (currentIndex + direction + tracks.length) % tracks.length;
    setCurrentTrackId(tracks[nextIndex].id);
    setStatus(`已切换到：${tracks[nextIndex].title}`);
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        setStatus('当前浏览器暂时无法启动音频/媒体');
        console.error(error);
      }
      return;
    }

    audio.pause();
    setStatus('音乐已暂停，随时可以继续播放');
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setStatus(audio.muted ? '已静音播放' : '已恢复声音');
  };

  const changeVolume = (event) => {
    const nextVolume = Number(event.target.value) / 100;
    setVolume(nextVolume);
    if (nextVolume > 0 && isMuted) {
      setIsMuted(false);
    }
    setStatus(`音量已调整到 ${Math.round(nextVolume * 100)}%`);
  };

  const toggleCollapsed = () => {
    setIsCollapsed((value) => !value);
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <article
      className={`music-card ${className} ${isCollapsed ? 'is-collapsed' : ''}`.trim()}
      data-audio-state={isPlaying ? 'playing' : 'idle'}
    >
      <button
        className="button button-music button-music-ghost icon-button music-collapse-toggle"
        type="button"
        onClick={toggleCollapsed}
        aria-label={isCollapsed ? '展开播放器' : '收起播放器'}
        title={isCollapsed ? '展开播放器' : '收起播放器'}
      >
        <ControlIcon name={isCollapsed ? 'expand' : 'collapse'} />
      </button>

      {isCollapsed ? (
        <>
          <div className="music-art" aria-hidden="true">
            <div className="record">
              <div className="record-core" />
            </div>
          </div>

          <div className="music-collapsed-copy">
            <p className="music-kicker">Music Module</p>
            <strong>{currentTrack.title}</strong>
          </div>
        </>
      ) : (
        <>
          <div className="music-art" aria-hidden="true">
            <div className="record">
              <div className="record-core" />
            </div>
          </div>

          <div className="music-copy">
            <div className="music-copy-top">
              <p className="music-kicker">Independent Music Module</p>
              {onToggleThemeLinked ? (
                <button
                  className={isThemeLinked ? 'music-mode-toggle is-active' : 'music-mode-toggle'}
                  type="button"
                  onClick={onToggleThemeLinked}
                  aria-pressed={isThemeLinked}
                  title={isThemeLinked ? '关闭主题强关联音乐' : '开启主题强关联音乐'}
                >
                  {isThemeLinked ? '主题联动开' : '自由播放'}
                </button>
              ) : null}
            </div>
            <h2>{currentTrack.title}</h2>
            <p className="music-meta">{formatTrackLabel(currentTrack, currentIndex, tracks.length)}</p>
            <PulseStatus status={status} isPlaying={isPlaying} />

            <div className="music-visualizer">
              <div className="music-bars" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="music-controls music-controls-primary">
              <button
                className="button button-music icon-button"
                type="button"
                onClick={() => changeTrack(-1)}
                disabled={!canChangeTrack}
                aria-label="上一曲"
                title="上一曲"
              >
                <ControlIcon name="previous" />
              </button>
              <button
                className="button button-music button-music-strong icon-button icon-button-strong"
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? '暂停音乐' : '播放音乐'}
                title={isPlaying ? '暂停音乐' : '播放音乐'}
              >
                <ControlIcon name={isPlaying ? 'pause' : 'play'} />
              </button>
              <button
                className="button button-music icon-button"
                type="button"
                onClick={() => changeTrack(1)}
                disabled={!canChangeTrack}
                aria-label="下一曲"
                title="下一曲"
              >
                <ControlIcon name="next" />
              </button>
              <button
                className="button button-music button-music-ghost icon-button"
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? '取消静音' : '静音'}
                title={isMuted ? '取消静音' : '静音'}
              >
                <ControlIcon name={isMuted ? 'muted' : 'volume'} />
              </button>
            </div>

            <label className="music-volume-control">
              <span>音量 {Math.round(volume * 100)}%</span>
              <input type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={changeVolume} />
            </label>

            <div className="music-playlist" aria-label="播放列表">
              {tracks.map((track, index) => (
                <button
                  key={track.id}
                  className={track.id === currentTrack.id ? 'music-playlist-item is-active' : 'music-playlist-item'}
                  type="button"
                  onClick={() => {
                    setCurrentTrackId(track.id);
                    setStatus(`已选择：${track.title}`);
                  }}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{track.title}</strong>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <audio key={currentTrack.src} ref={audioRef} preload="none">
        <source src={currentTrack.src} type={currentTrack.type === 'video' ? 'video/mp4' : 'audio/mpeg'} />
      </audio>
    </article>
  );
}
