import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { estaLogado, painelConfigurado } from "@/lib/admin";
import { modoDemo, painelAbertoSemSenha } from "@/lib/demo";
import { reais } from "@/lib/dinheiro";
import { pedidos, ROTULO_STATUS, type Pedido, type Status } from "@/lib/pedidos";
import { linkTibia } from "@/lib/tibia";
import { criarExemplos, login, logout, mudarStatus } from "./actions";

export const metadata: Metadata = { title: "Painel", robots: { index: false } };

// Próximos passos possíveis de cada status. A entrega é sempre manual: "Entreguei" só depois de transferir.
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

function whatsapp(contato: string): string {
  return `https://wa.me/${contato.length >= 12 ? contato : `55${contato}`}`;
}

function LinhaPedido({ p }: { p: Pedido }) {
  return (
    <li className="pedido-linha">
      <div className="principal">
        <div className="topo-linha">
          <span className="numero">#{p.numero}</span>
          <span className={`selo-status status-${p.status}`}>{ROTULO_STATUS[p.status]}</span>
        </div>
        <div>
          <b>{p.tc.toLocaleString("pt-BR")} TC</b> por <span className="pack-valor">{reais(p.valorCentavos)}</span> para{" "}
          <a href={linkTibia(p.personagem)} target="_blank" rel="noreferrer">
            {p.personagem}
          </a>
          {p.mundo && ` (${p.mundo})`}
        </div>
        <div className="ajuda">
          <a href={whatsapp(p.contato)}>{p.contato}</a>, {dataHora.format(new Date(p.criadoEm))}
        </div>
      </div>
      {PROXIMOS[p.status].length > 0 && (
        <div className="acoes">
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
      {!p.personagemConferido && (
        <p className="alerta">Personagem não conferido no pedido. Abra o link do nome antes de entregar.</p>
      )}
    </li>
  );
}

export default function Painel({ searchParams }: PageProps<"/painel">) {
  return (
    <Suspense fallback={<main className="painel">Carregando…</main>}>
      <Conteudo searchParams={searchParams} />
    </Suspense>
  );
}

async function Conteudo({ searchParams }: Pick<PageProps<"/painel">, "searchParams">) {
  await connection();

  if (!painelConfigurado()) {
    return (
      <main className="pagina-compra">
        <h1 className="titulo">Painel desligado</h1>
        <p className="subtitulo">Defina PAINEL_SENHA (8 caracteres ou mais) no .env.local para usar o painel.</p>
      </main>
    );
  }

  if (!(await estaLogado())) {
    const erro = (await searchParams).erro;
    return (
      <main className="pagina-compra">
        <h1 className="titulo">Painel da loja</h1>
        <form action={login} className="cartao" style={{ marginTop: 24 }}>
          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input id="senha" name="senha" type="password" required autoComplete="current-password" />
          </div>
          {erro && <p className="aviso aviso-erro">Senha errada. Tente de novo.</p>}
          <button className="botao" type="submit">
            Entrar no painel
          </button>
        </form>
      </main>
    );
  }

  const lista = await pedidos().listar();
  const abertos = lista.filter((p) => p.status === "aguardando_pix" || p.status === "pago");
  const fechados = lista.filter((p) => !abertos.includes(p));
  const aEntregar = lista.filter((p) => p.status === "pago");
  const entregues = lista.filter((p) => p.status === "entregue");
  const vendido = entregues.reduce((s, p) => s + p.valorCentavos, 0);

  return (
    <main className="painel">
      <div className="painel-cabeca">
        <h1 className="titulo">Pedidos</h1>
        {!painelAbertoSemSenha() && (
          <form action={logout}>
            <button className="botao-secundario" type="submit">
              Sair
            </button>
          </form>
        )}
      </div>

      {modoDemo() && (
        <div className="aviso aviso-demo" style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <p>
            <b>Modo demonstração.</b> Sem chave Pix configurada, nenhum pagamento é real
            {painelAbertoSemSenha() && " e o painel abre sem senha neste computador"}.
          </p>
          <form action={criarExemplos}>
            <button className="botao-secundario" type="submit">
              Criar pedidos de exemplo
            </button>
          </form>
        </div>
      )}

      <div className="painel-numeros">
        <div>
          <b>{lista.filter((p) => p.status === "aguardando_pix").length}</b>
          <span>Aguardando Pix</span>
        </div>
        <div>
          <b>{aEntregar.length}</b>
          <span>Pix caiu, falta entregar</span>
        </div>
        <div>
          <b>{entregues.length}</b>
          <span>Entregues</span>
        </div>
        <div>
          <b className="dinheiro">{reais(vendido)}</b>
          <span>Vendido (entregues)</span>
        </div>
      </div>

      <h2>Em aberto</h2>
      {abertos.length > 0 ? (
        <ul className="lista-pedidos">
          {abertos.map((p) => (
            <LinhaPedido key={p.numero} p={p} />
          ))}
        </ul>
      ) : (
        <div className="vazio" style={{ marginBottom: 36 }}>
          <p>Nenhum pedido esperando Pix ou entrega.</p>
          {lista.length === 0 && <Link href="/#pacotes">Fazer um pedido pelo site</Link>}
        </div>
      )}

      {fechados.length > 0 && (
        <>
          <h2>Fechados</h2>
          <ul className="lista-pedidos">
            {fechados.map((p) => (
              <LinhaPedido key={p.numero} p={p} />
            ))}
          </ul>
        </>
      )}

      <p className="ajuda">
        Antes de clicar em &quot;Pix caiu&quot;, confira o valor no extrato do banco. &quot;Entreguei&quot; só depois de
        transferir as coins no jogo.
      </p>
    </main>
  );
}
