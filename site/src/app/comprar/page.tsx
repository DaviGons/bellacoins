import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { pacoteValido, precoCentavos } from "@/config/loja";
import { reais } from "@/lib/dinheiro";
import { FormPedido } from "./FormPedido";

export const metadata: Metadata = { title: "Seu personagem" };

// Tela 2 de 3: informar o personagem (o site confere se existe antes do pagamento).
export default function Comprar({ searchParams }: PageProps<"/comprar">) {
  return (
    <main className="compra">
      <p className="passo">2 de 3 · PERSONAGEM</p>
      <h1 className="titulo">Para qual personagem?</h1>
      <Suspense fallback={<p className="subtitulo">Carregando…</p>}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Conteudo({ searchParams }: Pick<PageProps<"/comprar">, "searchParams">) {
  const tc = Number((await searchParams).tc);
  if (!pacoteValido(tc)) {
    return (
      <p className="subtitulo">
        Esse pacote não existe. <Link href="/">Escolher um pacote</Link>
      </p>
    );
  }
  return (
    <>
      <p className="subtitulo">
        {tc.toLocaleString("pt-BR")} TC por <span className="preco">{reais(precoCentavos(tc))}</span> ·{" "}
        <Link href="/">trocar pacote</Link>
      </p>
      <FormPedido tc={tc} />
    </>
  );
}
