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
    <button type="button" className="botao" onClick={copiar}>
      <span aria-live="polite">{copiado ? "Código copiado ✦" : "Copiar código Pix"}</span>
    </button>
  );
}
