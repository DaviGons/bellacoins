# Site da BellaCoins (MVP)

Primeira versão do site, para testar o fluxo de compra. O visual ainda é básico, mas já usa as cores, as fontes e o logo da identidade v2.

## Rodar no computador

```bash
cd site
npm install
cp .env.example .env.local   # preencher a chave Pix e a senha do painel
npm run dev                  # abre em http://localhost:3000
```

Precisa de Node 20 ou mais novo e de internet: a conferência do personagem usa a API pública TibiaData.

## Telas

| Endereço | O que é |
|---|---|
| `/` | Tela 1: escolher o pacote (o mais vendido fica no topo) |
| `/comprar?tc=250` | Tela 2: nome do personagem e WhatsApp. O site confere o char na TibiaData e mostra mundo e level para o cliente confirmar |
| `/pedido/<token>` | Tela 3: total, QR code e Pix copia e cola. Atualiza sozinha a cada 15 s até o pedido ser entregue |
| `/painel` | Lista de pedidos, protegida por senha. Botões "Pix caiu", "Entreguei", "Cancelar", "Reembolsei" |

O link do pedido usa um token aleatório. O número `BC-0001` aparece na tela, mas não dá acesso a nada (assim ninguém vê o pedido dos outros trocando o número).

## Como funciona hoje

- **Pix estático**: o código copia e cola é gerado com a chave da loja (`PIX_CHAVE`), já com o valor e o número do pedido. O cliente paga direto na conta da loja.
- **Confirmação manual**: quando o Pix aparecer no extrato, clicar em "Pix caiu" no painel. A tela do cliente muda sozinha.
- **Entrega manual**: transferir as coins no jogo e clicar em "Entreguei". Nada de bot ou script na conta do Tibia.
- **Pedidos num arquivo** (`.dados/pedidos.json`, fora do git). Só serve no computador; na Vercel o disco não guarda nada.

## Já preparado para a próxima etapa

| Peça | Onde mexer |
|---|---|
| Preço e pacotes | `src/config/loja.ts` (o preço de R$ 52 por 250 TC é **provisório**) |
| Banco de dados (Supabase) | Tabela pronta em `supabase/migrations/0001_pedidos.sql`. Criar `src/lib/pedidos/supabase.ts` com a mesma interface de `src/lib/pedidos/tipos.ts` e ligar em `src/lib/pedidos/index.ts` |
| Pix automático (gateway) | Trocar `gerarCobranca()` em `src/lib/pagamento.ts` e marcar "pago" pelo webhook do gateway. Antes, conferir se o gateway aceita venda de moeda de jogo |
| Visual | Tokens da marca em `src/app/globals.css` (cópia de `marca/cores.css`), fontes em `src/app/layout.tsx`, logo em `src/components/Logo.tsx`. Modo vitrine no topo, modo compra nas telas |
| Login do painel | `src/lib/admin.ts` (hoje é uma senha só, em `PAINEL_SENHA`) |
| Publicar | Vercel, com a pasta `site` como raiz do projeto. Só depois de ligar o Supabase |

## Pendências conhecidas

- **Números de pedido duplicados**: o site e a skill `registrar-venda` (`financeiro/vendas.csv`) numeram `BC-NNNN` cada um por conta. Antes de usar os dois juntos, decidir quem é a fonte do número.
- A TibiaData responde erro 502 tanto para nome inexistente quanto quando está com problema. O site consulta um personagem conhecido para separar os dois casos. Se a API estiver fora, o pedido entra marcado "não conferido" e o painel avisa para conferir à mão.
- Ainda não há limite de pedidos por pessoa nem proteção contra robôs (adicionar antes de divulgar o site).
