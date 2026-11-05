// "pago" existe só no site (Pix caiu, falta entregar). Nas planilhas de financeiro/ os status são
// aguardando, entregue, cancelado e reembolsado.
export const STATUS = ["aguardando_pix", "pago", "entregue", "cancelado", "reembolsado"] as const;
export type Status = (typeof STATUS)[number];

export const ROTULO_STATUS: Record<Status, string> = {
  aguardando_pix: "Aguardando Pix",
  pago: "Pix recebido",
  entregue: "Entregue",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

export type Pedido = {
  numero: string; // BC-0001
  token: string; // segredo do link do cliente (/pedido/<token>); o número é sequencial e não serve de chave
  criadoEm: string; // ISO
  atualizadoEm: string;
  status: Status;
  tc: number;
  valorCentavos: number;
  personagem: string; // nome exato, como veio da API
  mundo: string;
  personagemConferido: boolean; // false = a API estava fora; conferir à mão antes de entregar
  contato: string; // WhatsApp do cliente
  observacoes: string;
};

export type NovoPedido = Pick<
  Pedido,
  "tc" | "valorCentavos" | "personagem" | "mundo" | "personagemConferido" | "contato" | "observacoes"
>;

export interface RepositorioPedidos {
  criar(dados: NovoPedido): Promise<Pedido>;
  porToken(token: string): Promise<Pedido | null>;
  listar(): Promise<Pedido[]>; // mais recentes primeiro
  mudarStatus(numero: string, status: Status): Promise<Pedido | null>;
}
