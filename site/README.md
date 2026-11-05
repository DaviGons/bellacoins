# Site da BellaCoins

Next.js 16 (App Router) + Supabase, publicado na Vercel.

| Onde | O quê |
|---|---|
| Vercel | Projeto `bellacoins` (time DaviGS), pasta raiz `site/`. Cada push no `main` vai para produção; cada PR ganha um link de preview. |
| Supabase | Projeto `bellacoins` (org DevsForProjects, São Paulo `sa-east-1`), ref `cyruigouzeigkjhzqdgv` |
| GitHub | https://github.com/DaviGons/bellacoins |

## Rodar no computador

```bash
cd site
cp .env.example .env.local   # e colar a chave publishable do Supabase
npm install
npm run dev                  # http://localhost:3000
```

Para conferir a ligação com o Supabase: http://localhost:3000/api/saude deve responder `{"site":"ok","supabase":"ok"}`.

## Onde fica cada coisa

- `src/app/page.tsx`: página provisória (modo vitrine). Vai virar o catálogo.
- `src/app/globals.css`: tokens da marca, iguais a `marca/cores.css`.
- `src/lib/supabase/client.ts`: Supabase em componentes de navegador (`"use client"`).
- `src/lib/supabase/server.ts`: Supabase em Server Components, Server Actions e Route Handlers.
- `src/app/api/saude/route.ts`: checagem de saúde.

## Variáveis de ambiente

| Nome | Onde está configurada |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel (production, preview, development) e `.env.local` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel (production, preview, development) e `.env.local` |

Para puxar da Vercel em vez de copiar à mão: `npx vercel link` e depois `npx vercel env pull .env.local`.

A chave **secret** (`sb_secret_...`) nunca vai com `NEXT_PUBLIC_` nem para o navegador. Quando o site precisar dela
(ex.: webhook de pagamento), cadastrar na Vercel como `SUPABASE_SECRET_KEY`, tipo sensitive.

## Regras

- Seguir `docs/identidade-visual.md`: modo vitrine no topo e na divulgação, modo compra (fundo pérola, um botão magenta por tela) nas telas de pedido.
- Toda tabela no Supabase com RLS ligado. Dados de cliente (contato, char, comprovante) nunca em tabela aberta.
- Entrega continua manual. Nada de bot, macro ou script na conta do Tibia.
