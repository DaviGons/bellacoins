import type { Metadata } from "next";
import Link from "next/link";
import { LOJA } from "@/config/loja";

export const metadata: Metadata = { title: "Regras da loja" };

// RASCUNHO: escrito a partir de docs/negocio.md. Revisar prazos e reembolso antes de publicar o site.
export default function Regras() {
  return (
    <main className="texto-longo">
      <h1>Regras da loja</h1>
      <p className="data">Rascunho de novembro de 2026. Pode mudar antes da abertura.</p>

      <h2>Pagamento</h2>
      <p>
        Pelo site, o pagamento é por Pix. O valor total aparece antes do pagamento e não muda depois. Pague exatamente o
        valor do pedido; se o banco pedir uma descrição, use o número do pedido (por exemplo, BC-0142).
      </p>
      <p>
        Cartão de crédito é atendido pelo WhatsApp da loja, onde combinamos o pagamento. As coins são enviadas depois que o
        pagamento no cartão for aprovado.
      </p>
      <p>Qualquer quantidade a partir de 25 TC, de 25 em 25, pelo mesmo preço por coin dos pacotes.</p>

      <h2>Entrega</h2>
      <ul>
        <li>As coins são enviadas só depois que o Pix aparece na conta da loja.</li>
        <li>
          A entrega é feita à mão, pelo próprio jogo, {LOJA.prazoEntrega} depois da confirmação do Pix, {LOJA.horario}.
          Pedidos pagos fora desse horário são entregues no início do próximo período.
        </li>
        <li>A página do pedido mostra quando o Pix foi recebido e quando as coins foram enviadas.</li>
      </ul>

      <h2>Personagem</h2>
      <p>
        As coins vão para o personagem informado no pedido. O site confere se ele existe e mostra mundo e level para você
        confirmar. Coins transferidas não podem ser devolvidas pelo jogo, então um nome errado confirmado por você não tem
        como ser corrigido.
      </p>
      <p>Nunca pedimos senha, e-mail da conta, código de autenticação ou acesso ao seu personagem.</p>

      <h2>Cancelamento e reembolso</h2>
      <ul>
        <li>Antes de pagar: basta não fazer o Pix. O pedido é cancelado sozinho.</li>
        <li>Pagou e as coins ainda não foram enviadas: devolvemos o Pix inteiro, para a mesma conta que pagou.</li>
        <li>Depois da entrega não há reembolso, porque as coins já estão no seu personagem.</li>
      </ul>

      <h2>Segurança</h2>
      <p>
        Pix devolvido pelo banco (por contestação ou golpe) cancela o pedido. Podemos pedir uma confirmação a mais em
        pedidos grandes de clientes novos.
      </p>
      <p>
        Não anunciamos dentro do jogo e não usamos programas, bots ou macros em conta nenhuma. Se alguém oferecer coins da
        BellaCoins dentro do Tibia, não somos nós.
      </p>

      <h2>Sobre a loja</h2>
      <p>
        {LOJA.nome} é uma loja independente de revenda de Tibia Coins, sem ligação com a CipSoft. Tibia é marca registrada
        da CipSoft GmbH.
      </p>

      <p style={{ marginTop: 40 }}>
        <Link className="botao-secundario" href="/#pacotes">
          Ver pacotes
        </Link>
      </p>
    </main>
  );
}
