import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LOJA } from "@/config/loja";
import { reais } from "@/lib/dinheiro";
import { gerarCobranca } from "@/lib/pagamento";
import { pedidos, ROTULO_STATUS, type Pedido } from "@/lib/pedidos";
import { AtualizarSozinho } from "./AtualizarSozinho";
import { CopiarPix } from "./CopiarPix";

export const metadata: Metadata = { title: "Seu pedido", robots: { index: false } };

function mensagem(p: Pedido): string {
  switch (p.status) {
    case "aguardando_pix":
      return "Pague o Pix abaixo. Quando ele cair, esta tela atualiza sozinha.";
    case "pago":
      return `Pix recebido ✦ Já estamos enviando suas ${p.tc} TC para ${p.personagem}, ${LOJA.prazoEntrega}.`;
    case "entregue":
      return `Pix recebido ✦ Suas ${p.tc} TC já estão no ${p.personagem}.`;
    case "cancelado":
      return "Este pedido foi cancelado. Se você já pagou, fale com a gente.";
    case "reembolsado":
      return "Este pedido foi reembolsado.";
  }
}

// Tela 3 de 3: pagar com Pix e acompanhar. O link tem um token secreto; guardar para consultar depois.
export default function PaginaPedido({ params }: PageProps<"/pedido/[token]">) {
  return (
    <main className="compra">
      <p className="passo">3 de 3 · PIX</p>
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

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h1 className="titulo preco" style={{ fontFamily: "var(--bc-f-numero)" }}>
          #{pedido.numero}
        </h1>
        <span className={`selo-status status-${pedido.status}`}>{ROTULO_STATUS[pedido.status]}</span>
      </div>
      <p className="subtitulo">{mensagem(pedido)}</p>

      <dl className="cartao" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", margin: "0 0 20px" }}>
        <dt>Coins</dt>
        <dd style={{ margin: 0 }}>{pedido.tc.toLocaleString("pt-BR")} TC</dd>
        <dt>Personagem</dt>
        <dd style={{ margin: 0 }}>
          {pedido.personagem}
          {pedido.mundo && <> · {pedido.mundo}</>}
        </dd>
        <dt>
          <strong>Total</strong>
        </dt>
        <dd className="preco" style={{ margin: 0, fontSize: "1.2rem", fontWeight: 500 }}>
          {reais(pedido.valorCentavos)}
        </dd>
      </dl>

      {cobranca?.pronta && (
        <section className="cartao" style={{ display: "grid", gap: 14, justifyItems: "center" }}>
          <div
            style={{ width: 220, height: 220 }}
            role="img"
            aria-label="QR code do Pix"
            dangerouslySetInnerHTML={{ __html: cobranca.qrSvg }}
          />
          <CopiarPix codigo={cobranca.copiaECola} />
          <p className="ajuda" style={{ margin: 0, textAlign: "center" }}>
            Pague exatamente {reais(pedido.valorCentavos)}. Se o seu banco pedir uma descrição, use {pedido.numero}.
          </p>
        </section>
      )}

      {cobranca && !cobranca.pronta && (
        <p className="aviso aviso-atencao">
          O Pix ainda não está configurado neste ambiente. ({cobranca.motivo})
        </p>
      )}

      <p className="ajuda" style={{ marginTop: 20 }}>
        Guarde o link desta página para acompanhar o pedido.
        {LOJA.whatsapp && (
          <>
            {" "}
            Dúvidas? <a href={LOJA.whatsapp}>Fale no WhatsApp</a>.
          </>
        )}
      </p>

      <AtualizarSozinho ativo={aguardando || pedido.status === "pago"} />
    </>
  );
}
