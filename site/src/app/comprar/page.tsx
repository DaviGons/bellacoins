import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TrilhaCompra } from "@/components/TrilhaCompra";
import { precoCentavos, quantidadeValida } from "@/config/loja";
import { reais } from "@/lib/dinheiro";
import { linkWhatsApp, mensagemCartao } from "@/lib/whatsapp";
import { FormPedido } from "./FormPedido";

export const metadata: Metadata = { title: "Seu personagem" };

// Tela 2 de 3: informar o personagem (o site confere se existe antes do pagamento).
export default function Comprar({ searchParams }: PageProps<"/comprar">) {
  return (
    <main className="pagina-compra">
      <TrilhaCompra atual={2} />
      <h1 className="titulo">Para qual personagem?</h1>
      <Suspense fallback={<p className="subtitulo">Carregando…</p>}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Conteudo({ searchParams }: Pick<PageProps<"/comprar">, "searchParams">) {
  const tc = Number((await searchParams).tc);
  if (!quantidadeValida(tc)) {
    return (
      <p className="subtitulo">
        Essa quantidade não dá para enviar (use múltiplos de 25 TC). <Link href="/#pacotes">Escolha de novo</Link>.
      </p>
    );
  }
  return (
    <>
      <p className="subtitulo">
        As coins vão para este personagem. <Link href="/#pacotes">Trocar pacote</Link>
      </p>
      <div className="cartao">
        <FormPedido tc={tc} />
        <hr className="separador" />
        <dl className="linhas">
          <div>
            <dt>Pacote</dt>
            <dd>{tc.toLocaleString("pt-BR")} TC</dd>
          </div>
          <div className="total">
            <dt>Total no Pix</dt>
            <dd>{reais(precoCentavos(tc))}</dd>
          </div>
        </dl>
      </div>
      <p className="ajuda centro" style={{ marginTop: 18 }}>
        Prefere cartão de crédito?{" "}
        <a href={linkWhatsApp(mensagemCartao(tc))} target="_blank" rel="noopener noreferrer">
          Fale com a gente no WhatsApp
        </a>
        .
      </p>
    </>
  );
}
