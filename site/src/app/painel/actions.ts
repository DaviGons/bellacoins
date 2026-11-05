"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { precoCentavos } from "@/config/loja";
import { entrar, exigirLogin, sair } from "@/lib/admin";
import { modoDemo } from "@/lib/demo";
import { pedidos, STATUS, type Status } from "@/lib/pedidos";

export async function login(form: FormData) {
  const ok = await entrar(String(form.get("senha") ?? ""));
  redirect(ok ? "/painel" : "/painel?erro=1");
}

export async function logout() {
  await sair();
  redirect("/painel");
}

export async function mudarStatus(form: FormData) {
  await exigirLogin();
  const numero = String(form.get("numero") ?? "");
  const status = String(form.get("status") ?? "") as Status;
  if (!STATUS.includes(status)) throw new Error("Status inválido");
  await pedidos().mudarStatus(numero, status);
  revalidatePath("/painel");
}

// Só no modo demonstração: enche o painel com pedidos fictícios para ver como fica.
const EXEMPLOS: { personagem: string; mundo: string; tc: number; status: Status; conferido?: boolean }[] = [
  { personagem: "Eldor Vane", mundo: "Antica", tc: 250, status: "aguardando_pix" },
  { personagem: "Lia Brasaverde", mundo: "Belobra", tc: 750, status: "pago" },
  { personagem: "Kaio do Vale", mundo: "Venebra", tc: 1500, status: "aguardando_pix", conferido: false },
  { personagem: "Tessa Moonrise", mundo: "Refugia", tc: 250, status: "entregue" },
  { personagem: "Rurik Pedrafria", mundo: "Harmonia", tc: 500, status: "cancelado" },
];

export async function criarExemplos() {
  await exigirLogin();
  if (!modoDemo()) throw new Error("Exemplos só no modo demonstração.");
  for (const [i, e] of EXEMPLOS.entries()) {
    const p = await pedidos().criar({
      tc: e.tc,
      valorCentavos: precoCentavos(e.tc),
      personagem: e.personagem,
      mundo: e.mundo,
      personagemConferido: e.conferido ?? true,
      contato: `1190000000${i}`,
      observacoes: "Pedido de exemplo.",
    });
    if (e.status !== "aguardando_pix") await pedidos().mudarStatus(p.numero, e.status);
  }
  revalidatePath("/painel");
}
