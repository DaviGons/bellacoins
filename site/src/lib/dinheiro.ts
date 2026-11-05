const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function reais(centavos: number): string {
  return brl.format(centavos / 100);
}
