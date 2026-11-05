// Configuração da loja. Mudar preço, pacotes e textos de atendimento aqui.
// Valores em centavos (inteiros) para não ter erro de arredondamento.

// PROVISÓRIO: o preço ainda não foi decidido (docs/negocio.md sugere R$ 52 a R$ 53 por 250 TC).
export const PRECO_POR_250_CENTAVOS = 5200;

export type Pacote = {
  tc: number;
  maisVendido?: boolean;
};

// O primeiro da lista aparece primeiro (identidade: "mais vendido no topo").
export const PACOTES: Pacote[] = [
  { tc: 250, maisVendido: true },
  { tc: 500 },
  { tc: 750 },
  { tc: 1000 },
  { tc: 1500 },
  { tc: 3000 },
];

export function precoCentavos(tc: number): number {
  return Math.round((tc / 250) * PRECO_POR_250_CENTAVOS);
}

export function pacoteValido(tc: number): boolean {
  return PACOTES.some((p) => p.tc === tc);
}

export const LOJA = {
  nome: "BellaCoins",
  slogan: "Pagou no Pix, chegou no char.",
  // PROVISÓRIOS: ajustar quando as regras da loja estiverem escritas.
  prazoEntrega: "em até 30 minutos",
  horario: "todos os dias, das 9h às 23h",
  // Link de contato (WhatsApp Business). Vazio = mostra "em breve".
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "",
};
