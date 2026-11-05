import "server-only";
import { repositorioArquivo } from "./arquivo";
import type { RepositorioPedidos } from "./tipos";

// Onde os pedidos ficam guardados. Hoje só existe o arquivo local.
// Para ligar o Supabase: criar lib/pedidos/supabase.ts implementando RepositorioPedidos
// (a tabela está em supabase/migrations/0001_pedidos.sql) e escolher aqui por PEDIDOS_ARMAZENAMENTO.
export function pedidos(): RepositorioPedidos {
  const tipo = process.env.PEDIDOS_ARMAZENAMENTO ?? "arquivo";
  if (tipo === "arquivo") return repositorioArquivo;
  throw new Error(`PEDIDOS_ARMAZENAMENTO="${tipo}" ainda não foi implementado.`);
}

export * from "./tipos";
