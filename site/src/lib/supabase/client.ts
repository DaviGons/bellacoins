"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

// Cliente para componentes que rodam no navegador ("use client").
export function createClient() {
  const { url, key } = supabaseEnv();
  return createBrowserClient(url, key);
}
