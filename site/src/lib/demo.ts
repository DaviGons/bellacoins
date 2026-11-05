import "server-only";

// Modo demonstração: liga sozinho enquanto a chave Pix da loja não estiver configurada.
// - O Pix mostrado é um exemplo que não pode ser pago.
// - A página do pedido ganha botões para simular "Pix recebido" e "Entregue".
// - No computador (fora de produção), o /painel abre sem senha.
export function modoDemo(): boolean {
  return !process.env.PIX_CHAVE;
}

export function painelAbertoSemSenha(): boolean {
  return modoDemo() && process.env.NODE_ENV !== "production";
}
