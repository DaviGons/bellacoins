"use client";

import { useState } from "react";

export function CopiarPix({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Sem permissão de área de transferência: o código continua visível para copiar à mão.
    }
  }

  return (
    <div style={{ width: "100%", display: "grid", gap: 10 }}>
      <code
        style={{
          fontFamily: "var(--bc-f-numero)",
          fontSize: "0.75rem",
          wordBreak: "break-all",
          background: "var(--bc-perola)",
          borderRadius: 8,
          padding: 10,
          userSelect: "all",
        }}
      >
        {codigo}
      </code>
      <button type="button" className="botao" onClick={copiar} aria-live="polite">
        {copiado ? "Copiado ✦" : "Copiar código Pix"}
      </button>
    </div>
  );
}
