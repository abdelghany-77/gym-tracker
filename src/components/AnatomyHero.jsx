export default function AnatomyHero({ className = "w-28 h-36" }) {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#C4E58A]/10 via-[#73C8B4]/15 to-transparent rounded-full blur-xl transform scale-90" />

      {/* Anatomical 3D Male Figure Vector */}
      <svg
        viewBox="0 0 160 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(115,200,180,0.3)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bodyBaseGrad" x1="80" y1="20" x2="80" y2="210" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E3246" />
            <stop offset="0.6" stopColor="#132232" />
            <stop offset="1" stopColor="#0B1520" />
          </linearGradient>

          <linearGradient id="muscleChestGrad" x1="80" y1="65" x2="80" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C4E58A" />
            <stop offset="1" stopColor="#73C8B4" />
          </linearGradient>

          <linearGradient id="muscleAbsGrad" x1="80" y1="100" x2="80" y2="155" gradientUnits="userSpaceOnUse">
            <stop stopColor="#73C8B4" />
            <stop offset="1" stopColor="#55A898" />
          </linearGradient>

          <filter id="heroGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Head & Neck */}
        <ellipse cx="80" cy="28" rx="14" ry="17" fill="url(#bodyBaseGrad)" stroke="#2B4660" strokeWidth="1.5" />
        <path d="M72 43 C72 50 68 56 65 60 L95 60 C92 56 88 50 88 43 Z" fill="url(#bodyBaseGrad)" stroke="#2B4660" strokeWidth="1.2" />

        {/* Torso Base Contour */}
        <path
          d="M48 68 C35 76 28 92 31 112 C33 125 38 135 44 148 C50 162 55 178 57 195 L103 195 C105 178 110 162 116 148 C122 135 127 125 129 112 C132 92 125 76 112 68 C100 60 60 60 48 68 Z"
          fill="url(#bodyBaseGrad)"
          stroke="#2B4660"
          strokeWidth="1.8"
        />

        {/* Shoulders / Deltoids Contour */}
        <path d="M48 68 C38 72 26 84 25 98 C24 105 28 112 32 115 C33 103 38 90 47 80 Z" fill="#253D54" stroke="#73C8B4" strokeWidth="0.8" />
        <path d="M112 68 C122 72 134 84 135 98 C136 105 132 112 128 115 C127 103 122 90 113 80 Z" fill="#253D54" stroke="#73C8B4" strokeWidth="0.8" />

        {/* ── HIGHLIGHTED TARGET MUSCLES ── */}

        {/* Clavicles */}
        <path d="M56 64 Q80 70 104 64" stroke="#73C8B4" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

        {/* Pectoralis Major (Chest) - Left & Right */}
        <g filter="url(#heroGlow)">
          {/* Left Pec */}
          <path
            d="M78 68 C64 68 53 72 49 82 C46 90 51 98 62 101 C71 103 76 98 78 92 Z"
            fill="url(#muscleChestGrad)"
            opacity="0.9"
          />
          {/* Right Pec */}
          <path
            d="M82 68 C96 68 107 72 111 82 C114 90 109 98 98 101 C89 103 84 98 82 92 Z"
            fill="url(#muscleChestGrad)"
            opacity="0.9"
          />
          {/* Sternal Line */}
          <line x1="80" y1="68" x2="80" y2="103" stroke="#0D1723" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Serratus & Obliques */}
        <path d="M48 110 Q54 114 50 122 M46 122 Q52 126 48 134 M44 134 Q50 138 46 146" stroke="#73C8B4" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <path d="M112 110 Q106 114 110 122 M114 122 Q108 126 112 134 M116 134 Q110 138 114 146" stroke="#73C8B4" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

        {/* Rectus Abdominis (Abs Pack) */}
        <g fill="url(#muscleAbsGrad)" opacity="0.85">
          {/* Upper abs */}
          <rect x="68" y="106" width="10" height="9" rx="2.5" />
          <rect x="82" y="106" width="10" height="9" rx="2.5" />
          {/* Mid abs */}
          <rect x="68" y="118" width="10" height="10" rx="2.5" />
          <rect x="82" y="118" width="10" height="10" rx="2.5" />
          {/* Lower abs */}
          <rect x="69" y="131" width="9.5" height="11" rx="2.5" />
          <rect x="81.5" y="131" width="9.5" height="11" rx="2.5" />
          {/* Navel / Bottom line */}
          <ellipse cx="80" cy="144" rx="1.5" ry="1.5" fill="#C4E58A" />
        </g>

        {/* Arms / Biceps Hint */}
        <path d="M25 102 C20 120 22 145 28 165" stroke="#2B4660" strokeWidth="6" strokeLinecap="round" />
        <path d="M135 102 C140 120 138 145 132 165" stroke="#2B4660" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </div>
  );
}

