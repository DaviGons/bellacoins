// Logo horizontal (marca/logo/logo-horizontal-escuro.svg) montado em HTML, para usar as fontes
// carregadas pela página. "Bella" em Fraunces Black Italic com o degradê; "COINS" em Unbounded dourado.

const GRAD = (
  <>
    <stop offset="0" stopColor="#FFE59A" />
    <stop offset=".45" stopColor="#FFC23D" />
    <stop offset="1" stopColor="#E8890C" />
  </>
);

const BRILHO = "M78 6 L81.5 17.5 L93 21 L81.5 24.5 L78 36 L74.5 24.5 L63 21 L74.5 17.5 Z";

function Aro({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {GRAD}
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${id})`} />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#B45309" strokeWidth="2" />
      <circle cx="50" cy="50" r="38.5" fill="none" stroke="#B45309" strokeOpacity=".55" strokeWidth="1.4" strokeDasharray="2 3" />
    </>
  );
}

// Símbolo: moeda de ouro com B itálico e brilho de quatro pontas. `id` precisa ser único na página.
export function Simbolo({ tamanho, id = "bc-simbolo", className }: { tamanho?: number; id?: string; className?: string }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" aria-hidden="true" className={className} style={{ flex: "none" }}>
      <Aro id={id} />
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
      <path d={BRILHO} fill="#FFF4F8" stroke="#FF2E88" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

// Verso da moeda (aparece quando ela gira): o brilho grande no centro.
export function VersoMoeda({ id = "bc-verso", className }: { id?: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <Aro id={id} />
      <path
        d="M50 22 L56 44 L78 50 L56 56 L50 78 L44 56 L22 50 L44 44 Z"
        fill="#160A24"
        stroke="#160A24"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="logo">
      <Simbolo tamanho={40} id="bc-logo" />
      <span className="logo-bella">Bella</span>
      <span className="logo-coins">COINS</span>
    </span>
  );
}
