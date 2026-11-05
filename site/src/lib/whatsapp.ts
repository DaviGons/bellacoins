import { LOJA, precoCentavos } from "@/config/loja";
import { reais } from "./dinheiro";

// Link wa.me para a conversa com a loja, com a mensagem já escrita. Abre fora do site.
export function linkWhatsApp(texto?: string): string {
  const q = texto ? `?text=${encodeURIComponent(texto)}` : "";
  return `https://wa.me/${LOJA.whatsappNumero}${q}`;
}

// Pagamento com cartão: não passa pelo site, é combinado no WhatsApp.
export function mensagemCartao(tc: number, personagem?: string): string {
  const qtd = `${tc.toLocaleString("pt-BR")} TC (${reais(precoCentavos(tc))})`;
  const char = personagem ? ` para o personagem ${personagem}` : "";
  return `Oi, BellaCoins! Quero comprar ${qtd}${char} e pagar no cartão de crédito.`;
}

export const whatsappConfigurado = LOJA.whatsappNumero.length >= 12;
