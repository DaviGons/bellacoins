"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Recarrega os dados do pedido de tempos em tempos enquanto ele está em andamento.
// Quando houver gateway com webhook, dá para trocar por algo em tempo real.
export function AtualizarSozinho({ ativo, segundos = 15 }: { ativo: boolean; segundos?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!ativo) return;
    const id = setInterval(() => router.refresh(), segundos * 1000);
    return () => clearInterval(id);
  }, [ativo, segundos, router]);
  return null;
}
