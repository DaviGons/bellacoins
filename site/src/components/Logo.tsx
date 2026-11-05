// Logo horizontal (marca/logo/logo-horizontal-escuro.svg) montado em HTML, para usar as fontes
// carregadas pela página. "Bella" em Fraunces Black Italic com o degradê; "COINS" em Unbounded dourado.

export function Simbolo({ tamanho = 40 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" aria-hidden="true" style={{ flex: "none" }}>
      <defs>
        <linearGradient id="bc-ouro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE59A" />
          <stop offset=".45" stopColor="#FFC23D" />
          <stop offset="1" stopColor="#E8890C" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#bc-ouro)" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#B45309" strokeWidth="2" />
      <circle cx="50" cy="50" r="38.5" fill="none" stroke="#B45309" strokeOpacity=".55" strokeWidth="1.4" strokeDasharray="2 3" />
      <text
        x="48"
        y="69"
        textAnchor="middle"
        style={{ fontFamily: "var(--bc-f-bella)", fontStyle: "italic", fontWeight: 900 }}
        fontSize="58"
        fill="#160A24"
      >
        B
      </text>
      <path
        d="M78 6 L81.5 17.5 L93 21 L81.5 24.5 L78 36 L74.5 24.5 L63 21 L74.5 17.5 Z"
        fill="#FFF4F8"
        stroke="#FF2E88"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <Simbolo />
      <span
        style={{
          fontFamily: "var(--bc-f-bella)",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: "-0.5px",
          background: "var(--bc-brilho)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          lineHeight: 1,
          paddingRight: 2,
        }}
      >
        Bella
      </span>
      <span
        style={{
          fontFamily: "var(--bc-f-titulo)",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "0.14em",
          color: "var(--bc-ouro)",
          marginLeft: -2,
        }}
      >
        COINS
      </span>
    </span>
  );
}
