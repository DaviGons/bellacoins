"use client";

import Link from "next/link";
import { useState } from "react";
import { PACOTES, PRECO_POR_250_CENTAVOS, precoCentavos } from "@/config/loja";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const reais = (c: number) => brl.format(c / 100);

// Tela 1 de 3: escolher o pacote. O total aparece antes de qualquer outra coisa.
export function EscolherPacote() {
  const [tc, setTc] = useState(PACOTES.find((p) => p.maisVendido)?.tc ?? PACOTES[0].tc);
  const total = precoCentavos(tc);

  return (
    <div className="folha">
      <div>
        <h2 id="titulo-pacotes">Quantas Tibia Coins?</h2>
        <p className="dica">Mesmo preço por coin em todos os pacotes. Você paga só o que aparece aqui.</p>
        <fieldset className="lista-pacotes" aria-labelledby="titulo-pacotes">
          {PACOTES.map((p) => (
            <label key={p.tc} className="pack">
              <input
                type="radio"
                name="pacote"
                value={p.tc}
                checked={tc === p.tc}
                onChange={() => setTc(p.tc)}
              />
              <span className="pack-tc">
                {p.tc.toLocaleString("pt-BR")} TC
                {p.maisVendido && <small>Mais vendido</small>}
              </span>
              <span className="pack-valor">{reais(precoCentavos(p.tc))}</span>
            </label>
          ))}
        </fieldset>
      </div>

      <div className="resumo-pacote" aria-live="polite">
        <p className="grande">
          {tc.toLocaleString("pt-BR")}
          <span>TC</span>
        </p>
        <dl className="linhas">
          <div>
            <dt>Preço a cada 250 TC</dt>
            <dd>{reais(PRECO_POR_250_CENTAVOS)}</dd>
          </div>
          <div>
            <dt>Taxas</dt>
            <dd>{reais(0)}</dd>
          </div>
          <div className="total">
            <dt>Total no Pix</dt>
            <dd>{reais(total)}</dd>
          </div>
        </dl>
        <Link className="botao" href={`/comprar?tc=${tc}`}>
          Continuar com {tc.toLocaleString("pt-BR")} TC
        </Link>
      </div>
    </div>
  );
}
