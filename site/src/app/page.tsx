import Link from "next/link";
import { LOJA, PACOTES, precoCentavos } from "@/config/loja";
import { reais } from "@/lib/dinheiro";

// Tela 1 de 3: escolher o pacote.
export default function Inicio() {
  return (
    <main className="compra">
      <p className="passo">1 de 3 · PACOTE</p>
      <h1 className="titulo">Quantas Tibia Coins?</h1>
      <p className="subtitulo">{LOJA.slogan} Entrega manual no seu personagem depois que o Pix cai.</p>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
        {PACOTES.map((p) => (
          <li key={p.tc}>
            <Link
              href={`/comprar?tc=${p.tc}`}
              className="cartao pacote"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                textDecoration: "none",
                borderColor: p.maisVendido ? "var(--bc-magenta)" : undefined,
                borderWidth: p.maisVendido ? 2 : 1,
              }}
            >
              <span>
                <span style={{ fontFamily: "var(--bc-f-titulo)", fontWeight: 700, fontSize: "1.25rem" }}>
                  {p.tc.toLocaleString("pt-BR")} TC
                </span>
                {p.maisVendido && (
                  <span className="selo-status status-aguardando_pix" style={{ marginLeft: 10, fontSize: "0.75rem" }}>
                    Mais vendido
                  </span>
                )}
              </span>
              <span className="preco" style={{ fontSize: "1.15rem" }}>
                {reais(precoCentavos(p.tc))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
