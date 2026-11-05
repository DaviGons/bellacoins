"use server";

import { refresh } from "next/cache";
import { modoDemo } from "@/lib/demo";
import { pedidos, STATUS, type Status } from "@/lib/pedidos";

// Só no modo demonstração: deixa ver todas as telas do pedido sem pagar nada.
export async function simularStatus(form: FormData) {
  if (!modoDemo()) throw new Error("Simulação desligada: a loja tem Pix configurado.");
  const token = String(form.get("token") ?? "");
  const status = String(form.get("status") ?? "") as Status;
  if (!STATUS.includes(status)) throw new Error("Status inválido");
  const pedido = await pedidos().porToken(token);
  if (!pedido) throw new Error("Pedido não encontrado");
  await pedidos().mudarStatus(pedido.numero, status);
  refresh();
}
