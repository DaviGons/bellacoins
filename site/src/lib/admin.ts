import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { painelAbertoSemSenha } from "./demo";

// Acesso ao /painel com uma senha só (PAINEL_SENHA). Basta para o MVP; trocar por login de verdade
// (ex.: Supabase Auth) quando mais de uma pessoa operar a loja.

const COOKIE = "bc_painel";

function senha(): string | null {
  const s = process.env.PAINEL_SENHA;
  return s && s.length >= 8 ? s : null;
}

function assinatura(s: string): string {
  return createHmac("sha256", s).update("bellacoins-painel-v1").digest("base64url");
}

function iguais(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function painelConfigurado(): boolean {
  return senha() !== null || painelAbertoSemSenha();
}

export async function estaLogado(): Promise<boolean> {
  if (painelAbertoSemSenha()) return true;
  const s = senha();
  if (!s) return false;
  const valor = (await cookies()).get(COOKIE)?.value;
  return !!valor && iguais(valor, assinatura(s));
}

export async function entrar(tentativa: string): Promise<boolean> {
  const s = senha();
  if (!s || !iguais(tentativa, s)) return false;
  (await cookies()).set(COOKIE, assinatura(s), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/painel",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function sair(): Promise<void> {
  (await cookies()).delete({ name: COOKIE, path: "/painel" });
}

export async function exigirLogin(): Promise<void> {
  if (!(await estaLogado())) throw new Error("Não autorizado");
}
