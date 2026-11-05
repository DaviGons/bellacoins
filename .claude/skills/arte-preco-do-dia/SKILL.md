---
name: arte-preco-do-dia
description: Gera a arte "Preço do dia" da BellaCoins para o feed do Instagram (PNG 1080x1350, modo vitrine) com o preço do pacote de Tibia Coins, seguindo a identidade visual v2. Use quando pedirem arte, post, imagem ou card de preço do dia, preço novo, tabela de preço para Instagram/WhatsApp/Discord, ou "atualiza o preço no insta".
---

# Arte "Preço do dia"

Gera o post de preço no **modo vitrine** da marca (ver `docs/identidade-visual.md`): fundo Noite Ameixa com as luzes magenta e dourada, moeda grande inclinada, "Bella" em Fraunces com o degradê Brilho Bella, "COINS" em Unbounded dourado, o preço grande em Unbounded e os selos inclinados no rodapé.

## Como gerar

```bash
python3 .claude/skills/arte-preco-do-dia/gerar.py --preco 52
```

Opções:

| Opção | Padrão | Observação |
|---|---|---|
| `--preco` | (obrigatório) | `52`, `52,50` ou `52.5` |
| `--tc` | `250` | múltiplo de 25 |
| `--data` | hoje (`DD.MM`) | aparece no canto superior direito |
| `--selo` | `Pix na hora` | repetir para 2 selos; **no máximo 2** |
| `--insta` | `@bellacoins` | trocar se o @ for outro |
| `--saida` | `marketing/preco-do-dia/` | gera `AAAA-MM-DD-<tc>tc.png` e `.svg` |

Selos do kit, com a cor certa: `Pix na hora` (dourado), `Chegou no char` (magenta), `Preço do dia` (pérola), `Desde 2026` (contorno lilás). Outro texto vira selo dourado ou magenta.

O script usa `rsvg-convert` com um `fonts.conf` temporário apontando para `marca/fontes/`, então as fontes saem certas sem instalar nada.

## Passos

1. Confirmar o preço com a pessoa (não inventar). Se ela não disser, olhar `docs/negocio.md` só para sugerir, e perguntar.
2. Rodar o script.
3. **Abrir o PNG gerado e conferir** antes de entregar: o preço é o pedido, nada encosta na borda, os selos não tocam o @.
4. Entregar o caminho do PNG e sugerir uma legenda curta no tom da marca (simpática, rápida, clara, no máximo um ✦), por exemplo: "Preço do dia ✦ 250 TC por R$ 52,00. Pix na hora, chegou no char. Chama no direct."

## Regras que o script já garante (não contornar)

- No máximo 2 selos.
- Bloqueia "oficial", "autorizada", "parceira" e "100% seguro".
- Não usa nenhuma arte, logo, personagem ou fonte do Tibia. Não adicionar.
- O ✦ fica perto do preço e da moeda, nunca em cima de texto.

Para stories (1080x1920) ou outro formato, criar um novo `modelo-*.svg` nesta pasta a partir de `modelo-feed.svg`, mantendo as mesmas cores, fontes e posições relativas.
