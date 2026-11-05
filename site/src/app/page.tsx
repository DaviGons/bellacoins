import Link from "next/link";
import { Simbolo, VersoMoeda } from "@/components/Logo";
import { LOJA, PRECO_POR_25_CENTAVOS, PRECO_POR_250_CENTAVOS } from "@/config/loja";
import { reais } from "@/lib/dinheiro";
import { EscolherPacote } from "./EscolherPacote";

const DUVIDAS = [
  {
    p: "Quanto tempo demora para as coins chegarem?",
    r: `Depois que o Pix cai, a entrega é ${LOJA.prazoEntrega}, ${LOJA.horario}. A página do seu pedido avisa quando as coins forem enviadas.`,
  },
  {
    p: "Posso pagar no cartão de crédito?",
    r: "Pode. Escolha Cartão de crédito na hora de ver o total: abre uma conversa no WhatsApp da loja com a quantidade e o valor já escritos, e o pagamento é combinado por lá.",
  },
  {
    p: "Posso comprar uma quantidade diferente dos pacotes?",
    r: `Pode. Em "Outra quantidade" você escolhe de 25 em 25 TC, pelo mesmo preço: ${reais(PRECO_POR_25_CENTAVOS)} a cada 25 TC.`,
  },
  {
    p: "Vocês pedem minha senha ou meu login?",
    r: "Não. Para enviar Tibia Coins basta o nome do personagem. Ninguém da loja vai pedir senha, e-mail da conta ou código de autenticação.",
  },
  {
    p: "Como as coins chegam no meu personagem?",
    r: "Nós transferimos as coins pelo próprio jogo, à mão, para o personagem que você informou. Não usamos nenhum programa na sua conta nem na nossa.",
  },
  {
    p: "E se eu digitar o nome errado?",
    r: "O site confere o nome antes do pagamento e mostra mundo e level para você confirmar. Coins transferidas não voltam, então confira com calma antes de pagar.",
  },
  {
    p: "Posso cancelar?",
    r: "Antes de pagar, é só não fazer o Pix. Se já pagou e as coins ainda não foram enviadas, devolvemos o Pix inteiro.",
  },
  {
    p: "A BellaCoins é ligada à CipSoft?",
    r: "Não. Somos uma loja independente de revenda, sem ligação com a CipSoft, a empresa que faz o Tibia.",
  },
  {
    p: "Preciso fazer cadastro?",
    r: "Não. Só pedimos o nome do personagem e um WhatsApp para avisar da entrega ou se algo der errado.",
  },
];

export default function Inicio() {
  return (
    <main>
      <section className="vitrine" aria-labelledby="titulo-vitrine">
        <div className="wrap">
          <div>
            <h1 id="titulo-vitrine">{LOJA.slogan}</h1>
            <p className="chamada">
              Tibia Coins com entrega no seu personagem. Você vê o total antes de pagar e acompanha o pedido por um
              link.
            </p>
            <div className="acoes">
              <a className="botao-contorno" href="#pacotes">
                Ver pacotes
              </a>
              <small>
                250 TC por <b>{reais(PRECO_POR_250_CENTAVOS)}</b>
              </small>
            </div>
          </div>
          <div className="palco-moeda" aria-hidden="true">
            <span className="selo selo-ouro">Pix na hora</span>
            <div className="moeda3d">
              <Simbolo id="moeda-frente" />
              <VersoMoeda id="moeda-verso" className="verso" />
            </div>
            <div className="sombra-moeda" />
            <span className="selo selo-magenta">Preço do dia</span>
          </div>
        </div>
      </section>

      <section id="pacotes" className="pacotes" aria-label="Pacotes">
        <div className="wrap">
          <EscolherPacote />
        </div>
      </section>

      <section id="como-funciona" className="secao" aria-labelledby="titulo-como">
        <div className="wrap">
          <h2 id="titulo-como">Como funciona</h2>
          <p className="lede">Três telas, do pacote até as coins no seu char.</p>
          <ol className="passos">
            <li>
              <span className="n" aria-hidden="true">1</span>
              <h3>Escolha a quantidade</h3>
              <p>Um pacote pronto ou a quantidade que quiser, de 25 em 25. O total aparece antes de tudo.</p>
            </li>
            <li>
              <span className="n" aria-hidden="true">2</span>
              <h3>Diga o personagem</h3>
              <p>Conferimos na hora se ele existe e mostramos mundo e level para você confirmar.</p>
            </li>
            <li>
              <span className="n" aria-hidden="true">3</span>
              <h3>Pague no Pix</h3>
              <p>Quando o Pix cai, enviamos as coins e a página do pedido muda para entregue.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="secao secao-escura" aria-labelledby="titulo-regras">
        <div className="wrap">
          <h2 id="titulo-regras">Combinado é combinado</h2>
          <p className="lede">As regras cabem num parágrafo cada. Vale para todo pedido.</p>
          <div className="regras-grade">
            <div>
              <h3>Coins só depois do Pix</h3>
              <p>A entrega começa quando o pagamento aparece na conta da loja. Nada de fiado.</p>
            </div>
            <div>
              <h3>Nunca pedimos senha</h3>
              <p>Só o nome do personagem. Se alguém pedir sua senha em nosso nome, não é a BellaCoins.</p>
            </div>
            <div>
              <h3>Confira o nome</h3>
              <p>Coins enviadas não voltam. Por isso mostramos mundo e level antes de você pagar.</p>
            </div>
            <div>
              <h3>Desistiu antes da entrega?</h3>
              <p>Se as coins ainda não foram enviadas, devolvemos o Pix inteiro.</p>
            </div>
          </div>
          <Link className="link-ouro" href="/regras">
            Ler as regras completas
          </Link>
        </div>
      </section>

      <section id="duvidas" className="secao" aria-labelledby="titulo-duvidas">
        <div className="wrap duvidas">
          <div>
            <h2 id="titulo-duvidas">Dúvidas</h2>
            <p className="lede">
              Não achou a resposta? Fale com a gente pelo WhatsApp,{" "}
              {LOJA.horario}.
            </p>
          </div>
          <div className="faq">
            {DUVIDAS.map((d) => (
              <details key={d.p}>
                <summary>{d.p}</summary>
                <p>{d.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
