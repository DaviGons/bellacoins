import { connection } from "next/server";
import { supabaseEnv } from "@/lib/supabase/env";

// GET /api/saude: confirma que o site enxerga o Supabase.
export async function GET() {
  await connection();

  try {
    const { url, key } = supabaseEnv();
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      cache: "no-store",
    });
    return Response.json(
      { site: "ok", supabase: res.ok ? "ok" : `erro ${res.status}` },
      { status: res.ok ? 200 : 502 },
    );
  } catch (e) {
    return Response.json(
      { site: "ok", supabase: "erro", detalhe: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
