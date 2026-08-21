import { COLORS, FONT } from "./theme";

export default function HeroSection() {
  return (
    <section style={{ background: COLORS.hero }}>
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "56px 24px",
          display: "flex",
          alignItems: "center",
          gap: 40,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 420px", minWidth: 280 }}>
          <h1
            style={{
              fontFamily: FONT,
              color: COLORS.teal,
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 42px)",
              lineHeight: 1.15,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            The #1 Database of Internships for High School Students
          </h1>
          <p
            style={{
              fontFamily: FONT,
              color: COLORS.ink,
              fontSize: 16,
              lineHeight: 1.6,
              marginTop: 20,
              maxWidth: 480,
            }}
          >
            Youth Opportunity Forum is a free database containing all
            internships, research opportunities, and summer programs for
            high school students.
          </p>
        </div>

        <div style={{ flex: "1 1 380px", minWidth: 280, display: "flex", justifyContent: "center" }}>
          <svg
            viewBox="0 0 480 360"
            width="100%"
            style={{ maxWidth: 440 }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="20" y1="330" x2="460" y2="330" stroke={COLORS.teal} strokeWidth="2" />
            <g>
              <rect x="60" y="20" width="80" height="58" rx="6" fill={COLORS.teal} opacity="0.85" />
              <circle cx="88" cy="46" r="10" fill={COLORS.hero} />
              <path d="M104 60 L118 44" stroke={COLORS.hero} strokeWidth="3" strokeLinecap="round" />
            </g>
            <g>
              <rect x="170" y="6" width="86" height="58" rx="6" fill={COLORS.inkDim} opacity="0.55" />
              <polygon points="204,22 204,50 228,36" fill={COLORS.hero} />
            </g>
            <g>
              <rect x="56" y="96" width="80" height="58" rx="6" fill={COLORS.teal} opacity="0.55" />
              <path d="M56 130 L84 108 L110 128 L136 100" stroke={COLORS.hero} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="120" cy="112" r="5" fill={COLORS.hero} />
            </g>
            <path d="M196 92 l6 14 14 2 -10 10 2 14 -12 -7 -12 7 2 -14 -10 -10 14 -2 z" fill={COLORS.purple} opacity="0.85" />
            <rect x="150" y="238" width="230" height="8" fill={COLORS.teal} />
            <rect x="162" y="246" width="6" height="70" fill={COLORS.teal} />
            <rect x="356" y="246" width="6" height="70" fill={COLORS.teal} />
            <rect x="188" y="152" width="118" height="86" rx="4" fill="#ffffff" stroke={COLORS.teal} strokeWidth="3" />
            <rect x="198" y="162" width="98" height="60" fill={COLORS.teal} opacity="0.18" />
            <rect x="234" y="238" width="26" height="14" fill={COLORS.teal} />
            <rect x="220" y="250" width="54" height="6" rx="3" fill={COLORS.teal} />
            <circle cx="232" cy="196" r="16" fill={COLORS.ink} />
            <path d="M208 246 Q210 214 232 212 Q254 214 256 246 Z" fill={COLORS.inkDim} />
            <rect x="212" y="246" width="16" height="40" fill={COLORS.ink} />
            <rect x="238" y="246" width="16" height="40" fill={COLORS.ink} />
            <circle cx="336" cy="118" r="18" fill={COLORS.ink} />
            <path d="M312 128 Q314 116 336 114 Q358 116 360 128 L366 200 Q336 214 306 200 Z" fill={COLORS.teal} />
            <rect x="300" y="200" width="18" height="86" fill={COLORS.inkDim} />
            <rect x="354" y="200" width="18" height="86" fill={COLORS.inkDim} />
            <rect x="360" y="152" width="30" height="10" rx="5" fill={COLORS.ink} transform="rotate(-18 360 152)" />
            <rect x="376" y="132" width="20" height="30" rx="4" fill={COLORS.ink} />
            <ellipse cx="88" cy="322" rx="24" ry="10" fill={COLORS.teal} opacity="0.25" />
            <path d="M88 322 Q80 300 88 278 Q96 300 88 322 Z" fill={COLORS.teal} />
            <path d="M70 322 Q66 302 82 288" stroke={COLORS.teal} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M106 322 Q112 300 96 284" stroke={COLORS.teal} strokeWidth="4" fill="none" strokeLinecap="round" />
            <rect x="72" y="322" width="32" height="26" rx="3" fill={COLORS.inkDim} />
            <ellipse cx="150" cy="326" rx="18" ry="8" fill={COLORS.teal} opacity="0.25" />
            <path d="M138 326 Q132 306 146 292" stroke={COLORS.teal} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M162 326 Q170 308 154 296" stroke={COLORS.teal} strokeWidth="4" fill="none" strokeLinecap="round" />
            <rect x="136" y="326" width="28" height="20" rx="3" fill={COLORS.teal} opacity="0.6" />
          </svg>
        </div>
      </div>
    </section>
  );
}
