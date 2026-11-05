"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { entrar, exigirLogin, sair } from "@/lib/admin";
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
