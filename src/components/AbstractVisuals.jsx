import { useEffect, useMemo, useRef, useState } from 'react';

function useAnimatedValue(target, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const match = String(target).match(/^([\d.]+)(.*)$/);
    if (!match) {
      setValue(target);
      return;
    }

    const targetNum = parseFloat(match[1]);
    const suffix = match[2];

    if (isNaN(targetNum)) {
      setValue(target);
      return;
    }

    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp + delay;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentNum = Math.round(eased * targetNum);

      if (suffix || targetNum >= 1000) {
        setValue(`${currentNum.toLocaleString()}${suffix}`);
      } else {
        setValue(currentNum.toFixed(1));
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return value;
}

function ArcPath({ progress, size = 80, strokeWidth = 6, color, trackColor }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor || 'rgba(255,255,255,0.06)'}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color || 'var(--accent)'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="data-arc-progress"
      />
    </svg>
  );
}

export function DataRing({ value, label, note, color, size = 100 }) {
  const progress = useMemo(() => {
    const match = String(value).match(/^([\d.]+)/);
    if (!match) return 0.35;
    const num = parseFloat(match[1]);
    if (isNaN(num)) return 0.35;
    if (String(value).includes('%')) return Math.max(0.15, Math.min(num / 100, 0.95));
    if (num > 100) return 0.85;
    return Math.max(0.15, Math.min(num / 100, 0.85));
  }, [value]);

  const animatedValue = useAnimatedValue(value);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className="stats-card data-ring-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="data-ring-visual">
        <ArcPath progress={progress} size={size} color={color} />
        <div className="data-ring-center">
          <strong className="data-ring-value">{animatedValue}</strong>
        </div>
      </div>
      {isHovered ? (
        <p className="data-ring-note">{note}</p>
      ) : (
        <span className="data-ring-label">{label}</span>
      )}
    </article>
  );
}

export function GeoIndicator({ label, value, icon, pulseColor }) {
  return (
    <li className="hero-fact-abstract">
      <div className="geo-visual">
        <div className="geo-pulse" style={{ '--pulse-color': pulseColor || 'var(--accent)' }} />
        <span className="geo-icon">{icon}</span>
      </div>
      <div className="geo-copy">
        <span className="geo-label">{label}</span>
        <strong className="geo-value">{value}</strong>
      </div>
    </li>
  );
}

export function MetaRing({ label, value, color }) {
  const [active, setActive] = useState(false);

  return (
    <div
      className="meta-ring"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <svg width="44" height="44" viewBox="0 0 44 44" className="meta-ring-svg">
        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        <circle
          cx="22" cy="22" r="18"
          fill="none"
          stroke={color || 'var(--accent)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="113.1"
          strokeDashoffset={active ? '28' : '90'}
          transform="rotate(-90 22 22)"
          className="meta-ring-arc"
        />
      </svg>
      <div className="meta-ring-content">
        <span className="meta-ring-label">{label}</span>
        <strong className="meta-ring-value">{value}</strong>
      </div>
    </div>
  );
}

export function MetaRingsGrid({ items }) {
  return (
    <div className="meta-rings-grid">
      {items.map(([label, value]) => (
        <MetaRing key={label} label={label} value={value} />
      ))}
    </div>
  );
}

export function FloatingTagCloud({ tags }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 200 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const positionedTags = useMemo(() => {
    const { w, h } = dimensions;
    return tags.map((tag, i) => {
      const angle = (i / tags.length) * Math.PI * 2;
      const radiusX = w * 0.35;
      const radiusY = h * 0.3;
      const driftX = Math.sin(i * 2.7) * 20;
      const driftY = Math.cos(i * 1.3) * 15;
      return {
        tag,
        x: w / 2 + Math.cos(angle) * radiusX + driftX,
        y: h / 2 + Math.sin(angle) * radiusY + driftY,
        delay: i * 0.3,
        duration: 4 + (i % 3) * 2,
      };
    });
  }, [tags, dimensions]);

  return (
    <div className="tag-cloud-container" ref={containerRef}>
      {positionedTags.map(({ tag, x, y, delay, duration }, i) => (
        <span
          key={tag}
          className="tag-cloud-particle"
          style={{
            left: x,
            top: y,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            '--float-x': `${Math.cos(i * 1.7) * 30}px`,
            '--float-y': `${Math.sin(i * 2.3) * 20}px`,
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export function PulseStatus({ status, isPlaying }) {
  return (
    <div className={`pulse-status ${isPlaying ? 'is-playing' : ''}`}>
      <div className="pulse-status-dots">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <span className="pulse-status-label">{status}</span>
    </div>
  );
}

export function ModeVisual({ meta }) {
  return (
    <div className="mode-visual-grid">
      {meta.map(([label, value]) => (
        <div key={label} className="mode-visual-item">
          <div className="mode-visual-track">
            <div className="mode-visual-bar" style={{ '--bar-width': `${40 + Math.random() * 50}%` }} />
          </div>
          <div className="mode-visual-copy">
            <span className="mode-visual-label">{label}</span>
            <strong className="mode-visual-value">{value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
