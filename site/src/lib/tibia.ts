import "server-only";

// Mesma lógica de .claude/skills/checar-personagem/checar.py: só lê dados públicos (API TibiaData v4).

export type Personagem = {
  nome: string;
  mundo: string;
  vocacao: string;
  level: number;
  avisos: string[];
};

export type Checagem =
  | { status: "existe"; personagem: Personagem }
  | { status: "nao_encontrado" }
  | { status: "indisponivel" }; // API fora do ar: não dá para afirmar nada

export function normalizarNome(nome: string): string {
  return nome.split(/\s+/).filter(Boolean).join(" ");
}

export function linkTibia(nome: string): string {
  return `https://www.tibia.com/community/?name=${encodeURIComponent(nome).replace(/%20/g, "+")}`;
}

// Personagem antigo e conhecido, usado só para saber se a API está funcionando.
// Se um dia ele sumir, toda checagem com erro vira "indisponivel" (o lado seguro: o cliente vê um aviso).
const SONDA = "Bubble";

async function buscar(nome: string): Promise<Response | null> {
  try {
    return await fetch(`https://api.tibiadata.com/v4/character/${encodeURIComponent(nome)}`, {
      headers: { "User-Agent": "BellaCoins/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return null;
  }
}

export async function checarPersonagem(nomeDigitado: string): Promise<Checagem> {
  const nome = normalizarNome(nomeDigitado);
  if (nome.length < 2 || nome.length > 29) return { status: "nao_encontrado" };

  const res = await buscar(nome);
  if (!res) return { status: "indisponivel" };
  // A TibiaData responde 502 tanto para nome inexistente quanto quando está com problema.
  // Para separar os dois casos, consulta a sonda: se ela responde, o nome é que não existe.
  if (!res.ok) {
    const sonda = await buscar(SONDA);
    return sonda?.ok ? { status: "nao_encontrado" } : { status: "indisponivel" };
  }

  let dados: unknown;
  try {
    dados = await res.json();
  } catch {
    return { status: "indisponivel" };
  }
  type Bruto = { name?: string; world?: string; vocation?: string; level?: number; deleted?: boolean; traded?: boolean };
  const c = (dados as { character?: { character?: Bruto } })?.character?.character;
  const achado = c?.name?.trim();
  if (!c || !achado) return { status: "nao_encontrado" };

  const avisos: string[] = [];
  if (c.deleted) avisos.push("Personagem marcado para exclusão.");
  if (c.traded) avisos.push("Personagem negociado no Char Bazaar recentemente.");
  return {
    status: "existe",
    personagem: { nome: achado, mundo: c.world ?? "", vocacao: c.vocation ?? "", level: c.level ?? 0, avisos },
  };
}
