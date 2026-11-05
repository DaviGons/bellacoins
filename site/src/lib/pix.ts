// Pix "copia e cola" estático (BR Code, padrão EMV do Banco Central), gerado a partir da chave da loja.
// Não depende de gateway: o cliente paga direto na conta e a confirmação é manual, no /painel.
// Quando o gateway (ex.: Mercado Pago) entrar, ele substitui gerarCobranca() em lib/pagamento.ts.

function campo(id: string, valor: string): string {
  return id + String(valor.length).padStart(2, "0") + valor;
}

// Nome e cidade no BR Code: sem acento, só ASCII, com limite de tamanho.
function limpar(txt: string, max: number): string {
  return txt
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .slice(0, max);
}

// CRC16-CCITT (polinômio 0x1021, início 0xFFFF), exigido no campo 63.
function crc16(txt: string): string {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(txt)) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export type DadosPix = {
  chave: string;
  nome: string; // titular da conta (até 25 caracteres)
  cidade: string; // até 15 caracteres
  valorCentavos: number;
  txid: string; // identificador do pedido (até 25, só letras e números)
};

export function pixCopiaECola(d: DadosPix): string {
  const conta = campo("00", "br.gov.bcb.pix") + campo("01", d.chave.trim());
  const txid = d.txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const corpo =
    campo("00", "01") +
    campo("26", conta) +
    campo("52", "0000") +
    campo("53", "986") +
    campo("54", (d.valorCentavos / 100).toFixed(2)) +
    campo("58", "BR") +
    campo("59", limpar(d.nome, 25)) +
    campo("60", limpar(d.cidade, 15)) +
    campo("62", campo("05", txid)) +
    "6304";
  return corpo + crc16(corpo);
}
