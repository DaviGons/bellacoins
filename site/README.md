# Site da BellaCoins

Site completo para visualizar, no **modo demonstração**: todas as telas existem e seguem a identidade v2, mas nenhum pagamento é real.

## Ver no computador

```bash
cd site
npm install
npm run dev        # abre em http://localhost:3000
```

Não precisa de `.env` para ver. Precisa de Node 20 ou mais novo e de internet (fontes e a conferência do personagem na TibiaData).

## Páginas

| Endereço | O que é |
|---|---|
| `/` | Vitrine com a moeda, pacotes (tela 1), como funciona, regras resumidas e dúvidas |
| `/comprar?tc=250` | Tela 2: nome do personagem e WhatsApp. Confere o char na TibiaData de verdade e mostra mundo e level |
| `/pedido/<token>` | Tela 3: QR code e Pix copia e cola, andamento do pedido e recibo quando entregue |
| `/regras` | Regras da loja (**rascunho**, revisar antes de abrir) |
| `/painel` | Pedidos com totais e botões "Pix caiu", "Entreguei", "Cancelar", "Reembolsei" |

## Modo demonstração

Liga sozinho enquanto `PIX_CHAVE` estiver vazio:

- O Pix mostrado é um texto de exemplo com o selo "Exemplo". Se alguém escanear, o banco recusa.
- A página do pedido tem botões para simular "Pix recebido", "Entregue" e "Cancelado".
- No computador (`npm run dev`), o `/painel` abre sem senha e tem o botão "Criar pedidos de exemplo".
- Os pedidos ficam em `.dados/pedidos.json` (fora do git). Para começar do zero, apague esse arquivo.

Com `PIX_CHAVE`, `PIX_NOME` e `PIX_CIDADE` preenchidos, o Pix vira real (BR Code com valor e número do pedido) e a simulação some. O painel passa a pedir `PAINEL_SENHA`.

## Supabase

A tabela `pedidos` já existe no projeto Supabase **bellacoins** (`cyruigouzeigkjhzqdgv`, São Paulo). O SQL aplicado está em `supabase/migrations/0001_pedidos.sql`:

- `numero` (`BC-0001`, sequência própria) e `token` são gerados pelo banco.
- `atualizado_em` muda sozinho a cada alteração.
- RLS ligado e nenhum acesso para `anon`/`authenticated`: só o servidor do site, com a chave `service_role`, lê e escreve. O aviso "RLS enabled no policy" do Supabase é esperado.

O site **ainda não usa** o Supabase (os pedidos ficam no arquivo local). Para ligar: criar `src/lib/pedidos/supabase.ts` com a interface de `src/lib/pedidos/tipos.ts`, escolher em `src/lib/pedidos/index.ts` por `PEDIDOS_ARMAZENAMENTO=supabase` e pôr `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` (a chave fica em Project Settings → API Keys, nunca no navegador).

## Onde mexer

| Peça | Arquivo |
|---|---|
| Preço, pacotes, prazo e horário | `src/config/loja.ts` (o preço de R$ 52 por 250 TC, o prazo e o horário são **provisórios**) |
| Textos das dúvidas e da vitrine | `src/app/page.tsx` |
| Regras | `src/app/regras/page.tsx` |
| Cores, fontes, componentes visuais | `src/app/globals.css` (tokens copiados de `marca/cores.css`), `src/app/layout.tsx`, `src/components/` |
| Pix e gateway | `src/lib/pagamento.ts` (`gerarCobranca`) |
| Login do painel | `src/lib/admin.ts` |

## Pendências conhecidas

- **Números de pedido duplicados**: o site e a skill `registrar-venda` (`financeiro/vendas.csv`) numeram `BC-NNNN` cada um por conta. Decidir quem é a fonte do número antes de usar os dois juntos.
- **Publicar**: na Vercel o disco não guarda arquivos, então o site só pode ir para lá depois de ligar o Supabase.
- A TibiaData responde 502 tanto para nome inexistente quanto quando está com problema. O site consulta um personagem conhecido para separar os dois casos; se a API estiver fora, o pedido entra "não conferido" e o painel avisa.
- Falta limite de pedidos por pessoa e proteção contra robôs antes de divulgar.
- Instagram e Discord aparecem como "em breve" no rodapé; o WhatsApp entra com `NEXT_PUBLIC_WHATSAPP_URL`.
