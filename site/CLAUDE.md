@AGENTS.md

# Site BellaCoins

- Next.js 16 com `cacheComponents` ligado: o que lê `params`, `searchParams`, `cookies()` ou dados do pedido precisa ficar dentro de `<Suspense>` (veja as páginas existentes).
- Valores em centavos (inteiros). Formatar com `reais()` de `src/lib/dinheiro.ts`.
- Pedidos só por `pedidos()` de `src/lib/pedidos`; nunca ler o arquivo direto.
- Ações do painel chamam `exigirLogin()` dentro de cada server action.
- Visual: seguir `../docs/identidade-visual.md`. Telas de compra no modo compra (fundo pérola, um único botão magenta por tela); degradê só no modo vitrine.
