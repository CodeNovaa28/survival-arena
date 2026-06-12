// Attractive SVG icon components for the game UI

export function CoinIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
      {/* Outer rim */}
      <circle cx="12" cy="12" r="11" fill="#b45309" />
      {/* Main face */}
      <circle cx="12" cy="12" r="10" fill="#f59e0b" />
      {/* Highlight arc top-left */}
      <path d="M 5.5 7 A 7 7 0 0 1 17 5.5" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Inner ring */}
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="#b45309" strokeWidth="0.8" opacity="0.5" />
      {/* Center dollar */}
      <text x="12" y="16.2" textAnchor="middle" fontSize="9.5" fontWeight="900"
        fill="#78350f" fontFamily="Georgia, serif" letterSpacing="-0.5">$</text>
    </svg>
  );
}

export function ClockIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
      {/* Outer glow rim */}
      <circle cx="12" cy="12" r="11" fill="rgba(96,165,250,0.18)" />
      {/* Clock face */}
      <circle cx="12" cy="12" r="10" fill="#0f172a" stroke="#60a5fa" strokeWidth="1.5" />
      {/* Hour tick marks */}
      <line x1="12" y1="3.5" x2="12" y2="5.5" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="20.5" y1="12" x2="18.5" y2="12" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="20.5" x2="12" y2="18.5" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="3.5" y1="12" x2="5.5" y2="12" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" />
      {/* Hour hand (pointing ~10 o'clock) */}
      <line x1="12" y1="12" x2="7.8" y2="8.2" stroke="#93c5fd" strokeWidth="2.2" strokeLinecap="round" />
      {/* Minute hand (pointing ~12) */}
      <line x1="12" y1="12" x2="12" y2="5.2" stroke="#bfdbfe" strokeWidth="1.6" strokeLinecap="round" />
      {/* Center pin */}
      <circle cx="12" cy="12" r="1.4" fill="#60a5fa" />
    </svg>
  );
}

export function TargetIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
      {/* Outer ring */}
      <circle cx="12" cy="12" r="11" fill="rgba(168,85,247,0.12)" stroke="#a855f7" strokeWidth="1.5" />
      {/* Middle ring */}
      <circle cx="12" cy="12" r="7" fill="rgba(168,85,247,0.18)" stroke="#c084fc" strokeWidth="1" />
      {/* Bull's-eye */}
      <circle cx="12" cy="12" r="3.2" fill="#a855f7" />
      {/* Crosshair lines outside outer ring */}
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
