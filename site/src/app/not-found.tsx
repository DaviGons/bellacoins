import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <main className="pagina-compra centro" style={{ paddingBlock: "72px 96px" }}>
      <h1 className="titulo">Página não encontrada</h1>
      <p className="subtitulo">
        Se você veio pelo link de um pedido, confira se copiou o endereço inteiro. Ele é longo de propósito.
      </p>
      <Link className="botao-secundario" href="/">
        Voltar para o início
      </Link>
    </main>
  );
}
