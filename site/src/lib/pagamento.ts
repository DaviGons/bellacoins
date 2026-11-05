import "server-only";
import QRCode from "qrcode";
import { pixCopiaECola } from "./pix";
import type { Pedido } from "./pedidos/tipos";

export type Cobranca =
  | { pronta: true; copiaECola: string; qrSvg: string }
  | { pronta: false; motivo: string };

// Hoje: Pix estático com a chave da loja (variáveis PIX_* no .env).
// Depois: trocar por um gateway que gera Pix dinâmico e avisa por webhook quando o pagamento cai.
export async function gerarCobranca(pedido: Pedido): Promise<Cobranca> {
  const chave = process.env.PIX_CHAVE;
  const nome = process.env.PIX_NOME;
  const cidade = process.env.PIX_CIDADE;
  if (!chave || !nome || !cidade) {
    return { pronta: false, motivo: "Pix da loja ainda não configurado (PIX_CHAVE, PIX_NOME, PIX_CIDADE)." };
  }
  const copiaECola = pixCopiaECola({
    chave,
    nome,
    cidade,
    valorCentavos: pedido.valorCentavos,
    txid: pedido.numero,
  });
  const qrSvg = await QRCode.toString(copiaECola, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
  return { pronta: true, copiaECola, qrSvg };
}
