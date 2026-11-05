import "server-only";
import QRCode from "qrcode";
import { modoDemo } from "./demo";
import { pixCopiaECola } from "./pix";
import type { Pedido } from "./pedidos/tipos";

export type Cobranca =
  | { pronta: true; exemplo: boolean; copiaECola: string; qrSvg: string }
  | { pronta: false; motivo: string };

async function qr(texto: string): Promise<string> {
  return QRCode.toString(texto, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#160A24", light: "#FFFFFF" },
  });
}

// Hoje: Pix estático com a chave da loja (variáveis PIX_* no .env), ou um exemplo no modo demonstração.
// Depois: trocar por um gateway que gera Pix dinâmico e avisa por webhook quando o pagamento cai.
export async function gerarCobranca(pedido: Pedido): Promise<Cobranca> {
  if (modoDemo()) {
    // Texto comum, não é um BR Code: se alguém escanear, o banco recusa.
    const exemplo = `EXEMPLO BellaCoins ${pedido.numero}: Pix de demonstracao, nao pague.`;
    return { pronta: true, exemplo: true, copiaECola: exemplo, qrSvg: await qr(exemplo) };
  }
  const { PIX_CHAVE: chave, PIX_NOME: nome, PIX_CIDADE: cidade } = process.env;
  if (!chave || !nome || !cidade) {
    return { pronta: false, motivo: "Faltam PIX_NOME e PIX_CIDADE no .env." };
  }
  const copiaECola = pixCopiaECola({ chave, nome, cidade, valorCentavos: pedido.valorCentavos, txid: pedido.numero });
  return { pronta: true, exemplo: false, copiaECola, qrSvg: await qr(copiaECola) };
}
