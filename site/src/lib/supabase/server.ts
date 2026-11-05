import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

// Cliente para Server Components, Server Actions e Route Handlers.
// Crie um novo a cada requisição; não guarde em variável global.
export async function createClient() {
  const { url, key } = supabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Chamado de um Server Component, onde não dá para gravar cookie.
          // Sem problema enquanto não houver login; com login, criar src/proxy.ts para renovar a sessão.
        }
      },
    },
  });
}
