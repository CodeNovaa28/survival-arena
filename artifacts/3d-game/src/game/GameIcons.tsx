// Attractive SVG icon components for the game UI

export function CoinIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="11" fill="#b45309" />
      <circle cx="12" cy="12" r="10" fill="#f59e0b" />
      <path d="M 5.5 7 A 7 7 0 0 1 17 5.5" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="#b45309" strokeWidth="0.8" opacity="0.5" />
      {/* Dollar sign - vertical bar */}
      <line x1="12" y1="6.2" x2="12" y2="17.8" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
      {/* Dollar sign - upper curve */}
      <path d="M 14.5 8.8 C 14.5 8.1 13.5 7.5 12 7.5 C 10.5 7.5 9.5 8.3 9.5 9.3 C 9.5 10.3 10.5 10.8 12 11.3" stroke="#78350f" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Dollar sign - lower curve */}
      <path d="M 9.5 15.2 C 9.5 15.9 10.5 16.5 12 16.5 C 13.5 16.5 14.5 15.7 14.5 14.7 C 14.5 13.7 13.5 13.2 12 12.7" stroke="#78350f" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function ClockIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="11" fill="rgba(96,165,250,0.18)" />
      <circle cx="12" cy="12" r="10" fill="#0f172a" stroke="#60a5fa" strokeWidth="1.5" />
      <line x1="12" y1="3.5" x2="12" y2="5.5" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="20.5" y1="12" x2="18.5" y2="12" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="20.5" x2="12" y2="18.5" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="3.5" y1="12" x2="5.5" y2="12" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="12" x2="7.8" y2="8.2" stroke="#93c5fd" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="12" y1="12" x2="12" y2="5.2" stroke="#bfdbfe" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.4" fill="#60a5fa" />
    </svg>
  );
}

export function TargetIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="11" fill="rgba(168,85,247,0.12)" stroke="#a855f7" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="7" fill="rgba(168,85,247,0.18)" stroke="#c084fc" strokeWidth="1" />
      <circle cx="12" cy="12" r="3.2" fill="#a855f7" />
      <line x1="12" y1="1.2" x2="12" y2="4.5" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="19.5" x2="12" y2="22.8" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1.2" y1="12" x2="4.5" y2="12" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="19.5" y1="12" x2="22.8" y2="12" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function EndlessIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <path
        d="M 5 12 C 5 8.5 7.5 6 10 6 C 12.5 6 13.5 8 14.5 10 C 15.5 12 16.5 14 19 14 C 21.5 14 24 11.5 19 9"
        stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" fill="none"
      />
      <path
        d="M 19 12 C 19 15.5 16.5 18 14 18 C 11.5 18 10.5 16 9.5 14 C 8.5 12 7.5 10 5 10 C 2.5 10 0 12.5 5 15"
        stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

export function GemIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <polygon points="12,2 20,8 16,22 8,22 4,8" fill="#06b6d4" stroke="#0891b2" strokeWidth="1"/>
      <polygon points="12,2 20,8 12,6" fill="#67e8f9" opacity="0.85"/>
      <polygon points="12,6 20,8 16,22 8,22 4,8" fill="#0e7490" opacity="0.5"/>
      <ellipse cx="11" cy="9" rx="2.5" ry="1.2" fill="#fff" opacity="0.35"/>
    </svg>
  );
}

export function HeartIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <path d="M12 20s-8.5-5.4-8.5-11A5 5 0 0 1 12 5.8 5 5 0 0 1 20.5 9c0 5.6-8.5 11-8.5 11z" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.8"/>
      <ellipse cx="10" cy="9.5" rx="2.5" ry="1.5" fill="#fff" opacity="0.3"/>
    </svg>
  );
}
