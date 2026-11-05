// Configuração da loja. Mudar preço, pacotes e textos de atendimento aqui.
// Valores em centavos (inteiros) para não ter erro de arredondamento.

// Preço a cada 25 TC (a menor quantidade que dá para transferir). 25 TC = R$ 5,20, então 250 TC = R$ 52,00.
// PROVISÓRIO: o preço ainda não foi decidido (docs/negocio.md sugere R$ 52 a R$ 53 por 250 TC).
export const PRECO_POR_25_CENTAVOS = 520;
export const PRECO_POR_250_CENTAVOS = PRECO_POR_25_CENTAVOS * 10;

// Limites da quantidade personalizada (sempre múltiplo de 25).
export const QTD_MIN = 25;
export const QTD_MAX = 10000;

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
  return (tc / 25) * PRECO_POR_25_CENTAVOS;
}

// Vale para os pacotes e para a quantidade personalizada.
export function quantidadeValida(tc: number): boolean {
  return Number.isInteger(tc) && tc % 25 === 0 && tc >= QTD_MIN && tc <= QTD_MAX;
}

// Leva qualquer número para o múltiplo de 25 mais próximo, dentro dos limites.
export function arredondarQuantidade(n: number): number {
  if (!Number.isFinite(n)) return QTD_MIN;
  return Math.min(QTD_MAX, Math.max(QTD_MIN, Math.round(n / 25) * 25));
}

export const LOJA = {
  nome: "BellaCoins",
  slogan: "Pagou no Pix, chegou no char.",
  // PROVISÓRIOS: ajustar quando as regras da loja estiverem escritas.
  prazoEntrega: "em até 30 minutos",
  horario: "todos os dias, das 9h às 23h",
  // WhatsApp Business da loja, só números com DDI e DDD (ex.: 5511912345678). Usado no pagamento com
  // cartão e nos links de contato. Vazio = o WhatsApp pede para escolher o contato.
  whatsappNumero: (process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? "").replace(/\D/g, ""),
};
