import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { estaLogado, painelConfigurado } from "@/lib/admin";
import { reais } from "@/lib/dinheiro";
import { pedidos, ROTULO_STATUS, type Pedido, type Status } from "@/lib/pedidos";
import { linkTibia } from "@/lib/tibia";
import { login, logout, mudarStatus } from "./actions";

export const metadata: Metadata = { title: "Painel", robots: { index: false } };

// Próximos passos possíveis de cada status. A entrega é sempre manual: "Entregue" só depois de transferir.
const PROXIMOS: Record<Status, { status: Status; rotulo: string }[]> = {
  aguardando_pix: [
    { status: "pago", rotulo: "Pix caiu" },
    { status: "cancelado", rotulo: "Cancelar" },
  ],
  pago: [
    { status: "entregue", rotulo: "Entreguei" },
    { status: "reembolsado", rotulo: "Reembolsei" },
  ],
  entregue: [{ status: "reembolsado", rotulo: "Reembolsei" }],
  cancelado: [{ status: "aguardando_pix", rotulo: "Reabrir" }],
  reembolsado: [],
};

const dataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

function LinhaPedido({ p }: { p: Pedido }) {
  return (
    <li className="cartao" style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <strong className="preco">#{p.numero}</strong>
        <span className={`selo-status status-${p.status}`}>{ROTULO_STATUS[p.status]}</span>
      </div>
      <div>
        {p.tc.toLocaleString("pt-BR")} TC · <span className="preco">{reais(p.valorCentavos)}</span> ·{" "}
        <a href={linkTibia(p.personagem)} target="_blank" rel="noreferrer">
          {p.personagem}
        </a>
        {p.mundo && <> ({p.mundo})</>}
      </div>
      <div className="ajuda">
        WhatsApp <a href={`https://wa.me/${p.contato.length >= 12 ? p.contato : `55${p.contato}`}`}>{p.contato}</a> · {dataHora.format(new Date(p.criadoEm))}
      </div>
      {!p.personagemConferido && (
        <div className="aviso aviso-atencao" style={{ margin: 0 }}>
          Personagem não conferido. Abrir o link do nome antes de entregar.
        </div>
      )}
      {p.observacoes && p.personagemConferido && <div className="ajuda">⚠ {p.observacoes}</div>}
      {PROXIMOS[p.status].length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PROXIMOS[p.status].map((acao) => (
            <form key={acao.status} action={mudarStatus}>
              <input type="hidden" name="numero" value={p.numero} />
              <input type="hidden" name="status" value={acao.status} />
              <button className="botao-secundario" type="submit">
                {acao.rotulo}
              </button>
            </form>
          ))}
        </div>
      )}
    </li>
  );
}

export default function Painel({ searchParams }: PageProps<"/painel">) {
  return (
    <Suspense fallback={<main className="compra">Carregando…</main>}>
      <Conteudo searchParams={searchParams} />
    </Suspense>
  );
}

async function Conteudo({ searchParams }: Pick<PageProps<"/painel">, "searchParams">) {
  await connection();

  if (!painelConfigurado()) {
    return (
      <main className="compra">
        <h1 className="titulo">Painel desligado</h1>
        <p className="subtitulo">Defina PAINEL_SENHA (8 caracteres ou mais) no .env.local para usar o painel.</p>
      </main>
    );
  }

  if (!(await estaLogado())) {
    const erro = (await searchParams).erro;
    return (
      <main className="compra">
        <h1 className="titulo">Painel da loja</h1>
        <form action={login} style={{ marginTop: 20 }}>
          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input id="senha" name="senha" type="password" required autoComplete="current-password" />
          </div>
          {erro && <p className="aviso aviso-erro">Senha errada.</p>}
          <button className="botao" type="submit">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  const lista = await pedidos().listar();
  const abertos = lista.filter((p) => p.status === "aguardando_pix" || p.status === "pago");
  const fechados = lista.filter((p) => !abertos.includes(p));

  return (
    <main className="compra" style={{ maxWidth: 760 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="titulo">Pedidos</h1>
        <form action={logout}>
          <button className="botao-secundario" type="submit">
            Sair
          </button>
        </form>
      </div>
      <p className="subtitulo">
        {abertos.length} em aberto · {fechados.length} fechados. Confirme o Pix no extrato do banco antes de marcar
        &quot;Pix caiu&quot;.
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "grid", gap: 12 }}>
        {abertos.map((p) => (
          <LinhaPedido key={p.numero} p={p} />
        ))}
        {abertos.length === 0 && <li className="ajuda">Nenhum pedido em aberto.</li>}
      </ul>

      {fechados.length > 0 && (
        <details>
          <summary style={{ cursor: "pointer", fontWeight: 700, marginBottom: 12 }}>Fechados</summary>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
            {fechados.map((p) => (
              <LinhaPedido key={p.numero} p={p} />
            ))}
          </ul>
        </details>
      )}
    </main>
  );
}
