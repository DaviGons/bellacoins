import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NovoPedido, Pedido, RepositorioPedidos, Status } from "./tipos";

// Pedidos num arquivo JSON local. Serve para desenvolver e testar no computador.
// Não funciona na Vercel (o disco lá é só leitura e some a cada deploy): em produção, usar o Supabase.

const ARQUIVO = path.resolve(/*turbopackIgnore: true*/ process.env.PEDIDOS_ARQUIVO ?? ".dados/pedidos.json");

async function ler(): Promise<Pedido[]> {
  try {
    return JSON.parse(await readFile(ARQUIVO, "utf8")) as Pedido[];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

async function gravar(pedidos: Pedido[]): Promise<void> {
  await mkdir(path.dirname(ARQUIVO), { recursive: true });
  const tmp = `${ARQUIVO}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(pedidos, null, 2));
  await rename(tmp, ARQUIVO);
}

// Uma escrita por vez, para dois pedidos simultâneos não ganharem o mesmo número.
let fila: Promise<unknown> = Promise.resolve();
function emFila<T>(fn: () => Promise<T>): Promise<T> {
  const r = fila.then(fn, fn);
  fila = r.catch(() => {});
  return r;
}

export const repositorioArquivo: RepositorioPedidos = {
  criar: (dados: NovoPedido) =>
    emFila(async () => {
      const pedidos = await ler();
      const maior = Math.max(0, ...pedidos.map((p) => Number(p.numero.replace("BC-", "")) || 0));
      const agora = new Date().toISOString();
      const pedido: Pedido = {
        ...dados,
        numero: `BC-${String(maior + 1).padStart(4, "0")}`,
        token: randomBytes(16).toString("base64url"),
        criadoEm: agora,
        atualizadoEm: agora,
        status: "aguardando_pix",
      };
      await gravar([...pedidos, pedido]);
      return pedido;
    }),

  async porToken(token) {
    return (await ler()).find((p) => p.token === token) ?? null;
  },

  async listar() {
    return (await ler()).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  },

  mudarStatus: (numero: string, status: Status) =>
    emFila(async () => {
      const pedidos = await ler();
      const p = pedidos.find((x) => x.numero === numero);
      if (!p) return null;
      p.status = status;
      p.atualizadoEm = new Date().toISOString();
      await gravar(pedidos);
      return p;
    }),
};
