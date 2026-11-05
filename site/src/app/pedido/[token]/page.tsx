import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { TrilhaCompra } from "@/components/TrilhaCompra";
import { LOJA } from "@/config/loja";
import { modoDemo } from "@/lib/demo";
import { reais } from "@/lib/dinheiro";
import { gerarCobranca } from "@/lib/pagamento";
import { linkWhatsApp, whatsappConfigurado } from "@/lib/whatsapp";
import { pedidos, ROTULO_STATUS, type Pedido, type Status } from "@/lib/pedidos";
import { simularStatus } from "./actions";
import { AtualizarSozinho } from "./AtualizarSozinho";
import { CopiarPix } from "./CopiarPix";

export const metadata: Metadata = { title: "Seu pedido", robots: { index: false } };

function mensagem(p: Pedido): string {
  switch (p.status) {
    case "aguardando_pix":
      return "Pague o Pix abaixo. Quando ele cair, esta página atualiza sozinha.";
    case "pago":
      return `Pix recebido ✦ Já estamos enviando suas ${p.tc} TC para ${p.personagem}.`;
    case "entregue":
      return `Pix recebido ✦ Suas ${p.tc} TC já estão no ${p.personagem}.`;
    case "cancelado":
      return "Este pedido foi cancelado. Se você chegou a pagar, fale com a gente que devolvemos o Pix.";
    case "reembolsado":
      return "Este pedido foi reembolsado. O Pix voltou para a conta que pagou.";
  }
}

const ORDEM: Status[] = ["aguardando_pix", "pago", "entregue"];

function LinhaDoTempo({ status }: { status: Status }) {
  const alcancado = ORDEM.indexOf(status); // 0 = pedido feito, 1 = Pix recebido, 2 = entregue
  if (alcancado < 0) return null; // cancelado ou reembolsado: só a mensagem
  const etapas = ["Pedido feito", "Pix recebido", "Coins entregues"];
  return (
    <ol className="linha-tempo" aria-label="Andamento do pedido">
      {etapas.map((nome, i) => {
        const feito = i <= alcancado;
        const ehAtual = i === alcancado + 1;
        return (
          <li key={nome} className={feito ? "feito" : ehAtual ? "atual" : undefined}>
            <span className="ponto" aria-hidden="true">
              {feito ? "✓" : ""}
            </span>
            {nome}
            <span className="visualmente-oculto">{feito ? " (feito)" : ehAtual ? " (em andamento)" : ""}</span>
          </li>
        );
      })}
    </ol>
  );
}

// Tela 3 de 3: pagar com Pix e acompanhar. O link tem um token secreto; guardar para consultar depois.
export default function PaginaPedido({ params }: PageProps<"/pedido/[token]">) {
  return (
    <main className="pagina-compra">
      <TrilhaCompra atual={3} />
      <Suspense fallback={<p className="subtitulo">Carregando o pedido…</p>}>
        <Conteudo params={params} />
      </Suspense>
    </main>
  );
}

async function Conteudo({ params }: Pick<PageProps<"/pedido/[token]">, "params">) {
  await connection();
  const { token } = await params;
  const pedido = await pedidos().porToken(token);
  if (!pedido) notFound();

  const aguardando = pedido.status === "aguardando_pix";
  const cobranca = aguardando ? await gerarCobranca(pedido) : null;
  const demo = modoDemo();

  const resumo = (
    <dl className="linhas">
      <div>
        <dt>Coins</dt>
        <dd>{pedido.tc.toLocaleString("pt-BR")} TC</dd>
      </div>
      <div>
        <dt>Personagem</dt>
        <dd>
          {pedido.personagem}
          {pedido.mundo && `, ${pedido.mundo}`}
        </dd>
      </div>
      <div className="total">
        <dt>Total</dt>
        <dd>{reais(pedido.valorCentavos)}</dd>
      </div>
    </dl>
  );

  return (
    <>
      <div className="pedido-cabeca">
        <h1 className="numero-pedido">#{pedido.numero}</h1>
        <span className={`selo-status status-${pedido.status}`}>{ROTULO_STATUS[pedido.status]}</span>
      </div>
      <p className="subtitulo">{mensagem(pedido)}</p>

      <LinhaDoTempo status={pedido.status} />

      {cobranca?.pronta && (
        <section className="cartao" aria-label="Pagamento por Pix">
          <div className="pix">
            <div className="qr" role="img" aria-label="QR code do Pix">
              <div dangerouslySetInnerHTML={{ __html: cobranca.qrSvg }} style={{ width: "100%", height: "100%" }} />
              {cobranca.exemplo && <span className="selo selo-ouro">Exemplo</span>}
            </div>
            <p className="ajuda centro">Abra o app do banco, escolha Pix e leia o QR code. Ou copie o código:</p>
            <code className="copia">{cobranca.copiaECola}</code>
            <CopiarPix codigo={cobranca.copiaECola} />
          </div>
          <hr className="separador" />
          {resumo}
          <p className="ajuda" style={{ marginTop: 14 }}>
            Pague exatamente {reais(pedido.valorCentavos)}. Se o banco pedir uma descrição, use {pedido.numero}.
          </p>
        </section>
      )}

      {cobranca && !cobranca.pronta && <p className="aviso aviso-atencao">Pix indisponível: {cobranca.motivo}</p>}

      {!aguardando && <section className={`cartao${pedido.status === "entregue" ? " recibo" : ""}`}>{resumo}</section>}

      <p className="ajuda" style={{ marginTop: 20 }}>
        Guarde o link desta página para acompanhar o pedido. Entrega {LOJA.prazoEntrega} depois do Pix, {LOJA.horario}.
        {whatsappConfigurado && (
          <>
            {" "}
            Dúvidas?{" "}
            <a href={linkWhatsApp(`Oi, BellaCoins! Tenho uma dúvida sobre o pedido ${pedido.numero}.`)} target="_blank" rel="noopener noreferrer">
              Fale no WhatsApp
            </a>
            .
          </>
        )}
      </p>

      {demo && (
        <div className="barra-demo">
          <p>
            <b>Modo demonstração.</b> Este Pix é de exemplo e não pode ser pago. Use os botões para ver as outras telas
            do pedido.
          </p>
          <div className="botoes">
            {(
              [
                ["aguardando_pix", "Aguardando Pix"],
                ["pago", "Simular Pix recebido"],
                ["entregue", "Simular entrega"],
                ["cancelado", "Simular cancelamento"],
              ] as const
            )
              .filter(([s]) => s !== pedido.status)
              .map(([s, rotulo]) => (
                <form key={s} action={simularStatus}>
                  <input type="hidden" name="token" value={pedido.token} />
                  <input type="hidden" name="status" value={s} />
                  <button className="botao-secundario" type="submit">
                    {rotulo}
                  </button>
                </form>
              ))}
          </div>
        </div>
      )}

      <AtualizarSozinho ativo={aguardando || pedido.status === "pago"} />
    </>
  );
}
