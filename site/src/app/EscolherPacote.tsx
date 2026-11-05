"use client";

import Link from "next/link";
import { useState } from "react";
import {
  arredondarQuantidade,
  PACOTES,
  PRECO_POR_25_CENTAVOS,
  precoCentavos,
  QTD_MAX,
  QTD_MIN,
  quantidadeValida,
} from "@/config/loja";
import { reais } from "@/lib/dinheiro";
import { linkWhatsApp, mensagemCartao, whatsappConfigurado } from "@/lib/whatsapp";

type Pagamento = "pix" | "cartao";

// Tela 1 de 3: escolher a quantidade e a forma de pagamento. O total aparece antes de qualquer outra coisa.
export function EscolherPacote() {
  const [escolha, setEscolha] = useState<number | "outra">(PACOTES.find((p) => p.maisVendido)?.tc ?? PACOTES[0].tc);
  const [qtdTexto, setQtdTexto] = useState("400");
  const [pagamento, setPagamento] = useState<Pagamento>("pix");

  const tc = escolha === "outra" ? Number(qtdTexto) : escolha;
  const valida = quantidadeValida(tc);
  const tcTexto = valida ? tc.toLocaleString("pt-BR") : "–";

  function somar(delta: number) {
    setEscolha("outra");
    const atual = Number(qtdTexto);
    setQtdTexto(String(arredondarQuantidade((Number.isFinite(atual) ? atual : QTD_MIN) + delta)));
  }

  return (
    <div className="folha">
      <div>
        <h2 id="titulo-pacotes">Quantas Tibia Coins?</h2>
        <p className="dica">
          {reais(PRECO_POR_25_CENTAVOS)} a cada 25 TC, em qualquer quantidade. Você paga só o que aparece aqui.
        </p>
        <fieldset className="lista-pacotes" aria-labelledby="titulo-pacotes">
          {PACOTES.map((p) => (
            <label key={p.tc} className="pack">
              <input type="radio" name="pacote" checked={escolha === p.tc} onChange={() => setEscolha(p.tc)} />
              <span className="pack-tc">
                {p.tc.toLocaleString("pt-BR")} TC
                {p.maisVendido && <small>Mais vendido</small>}
              </span>
              <span className="pack-valor">{reais(precoCentavos(p.tc))}</span>
            </label>
          ))}
          <label className="pack pack-outra">
            <input type="radio" name="pacote" checked={escolha === "outra"} onChange={() => setEscolha("outra")} />
            <span className="pack-tc">
              Outra quantidade
              <small>De {QTD_MIN} a {QTD_MAX.toLocaleString("pt-BR")} TC, de 25 em 25</small>
            </span>
            <span className="pack-valor" aria-hidden="true">
              +
            </span>
          </label>
        </fieldset>

        {escolha === "outra" && (
          <div className="qtd">
            <label htmlFor="qtd-personalizada">Quantidade de TC</label>
            <div className="qtd-controle">
              <button type="button" onClick={() => somar(-25)} aria-label="Menos 25 TC" disabled={tc <= QTD_MIN}>
                −
              </button>
              <input
                id="qtd-personalizada"
                type="number"
                inputMode="numeric"
                min={QTD_MIN}
                max={QTD_MAX}
                step={25}
                value={qtdTexto}
                onChange={(e) => setQtdTexto(e.target.value)}
                onBlur={() => setQtdTexto(String(arredondarQuantidade(Number(qtdTexto))))}
                aria-invalid={!valida}
                aria-describedby="qtd-ajuda"
                autoFocus
              />
              <button type="button" onClick={() => somar(25)} aria-label="Mais 25 TC" disabled={tc >= QTD_MAX}>
                +
              </button>
            </div>
            <p id="qtd-ajuda" className={valida ? "ajuda" : "ajuda erro"}>
              {valida
                ? `${tc.toLocaleString("pt-BR")} TC = ${tc / 25} × ${reais(PRECO_POR_25_CENTAVOS)}`
                : `Use múltiplos de 25, entre ${QTD_MIN} e ${QTD_MAX.toLocaleString("pt-BR")} TC (ex.: 125, 400, 1.025).`}
            </p>
          </div>
        )}
      </div>

      <div className="resumo-pacote" aria-live="polite">
        <p className="grande">
          {tcTexto}
          <span>TC</span>
        </p>

        <fieldset className="formas">
          <legend>Forma de pagamento</legend>
          <label className="forma">
            <input type="radio" name="pagamento" checked={pagamento === "pix"} onChange={() => setPagamento("pix")} />
            Pix
          </label>
          <label className="forma">
            <input
              type="radio"
              name="pagamento"
              checked={pagamento === "cartao"}
              onChange={() => setPagamento("cartao")}
            />
            Cartão de crédito
          </label>
        </fieldset>

        <dl className="linhas">
          <div>
            <dt>A cada 25 TC</dt>
            <dd>{reais(PRECO_POR_25_CENTAVOS)}</dd>
          </div>
          <div className="total">
            <dt>{pagamento === "pix" ? "Total no Pix" : "Total no cartão"}</dt>
            <dd>{valida ? reais(precoCentavos(tc)) : "–"}</dd>
          </div>
        </dl>

        {!valida ? (
          <button className="botao" type="button" disabled>
            Escolha uma quantidade válida
          </button>
        ) : pagamento === "pix" ? (
          <Link className="botao" href={`/comprar?tc=${tc}`}>
            Continuar com {tcTexto} TC
          </Link>
        ) : (
          <>
            <a className="botao" href={linkWhatsApp(mensagemCartao(tc))} target="_blank" rel="noopener noreferrer">
              Pagar no cartão pelo WhatsApp
            </a>
            <p className="ajuda">
              Abre uma conversa no WhatsApp da loja com o pedido já escrito. O pagamento no cartão é combinado por lá.
              {!whatsappConfigurado && " (Número da loja ainda não configurado: o WhatsApp vai pedir para escolher o contato.)"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
