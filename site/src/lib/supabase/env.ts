// URL e chave pública do Supabase. Os valores ficam nas variáveis de ambiente
// (Vercel e .env.local); a chave publishable pode ir para o navegador.
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltam NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copie site/.env.example para site/.env.local.",
    );
  }
  return { url, key };
}
