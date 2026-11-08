---
name: registrar-venda
description: Registra compras de Tibia Coins de fornecedores e vendas/pedidos da BellaCoins nas planilhas financeiro/compras.csv e vendas.csv, gera o número do pedido (#BC-0001), muda status (aguardando, entregue, cancelado, reembolsado) e mostra resumo de lucro e estoque. Use quando falarem em anotar/registrar venda, pedido, compra de coins, "entreguei o pedido", "quanto lucrei", "quanto tenho de estoque", fechamento do mês.
---

# Registrar venda e compra

Toda movimentação passa por `caixa.py`. **Não editar os CSVs à mão**: o script mantém o formato que o Excel em português abre direto (separador `;`, vírgula decimal, datas DD/MM/AAAA, UTF-8 com BOM) e calcula custo e lucro como manda `financeiro/LEIA-ME.txt`.

```bash
C=.claude/skills/registrar-venda/caixa.py

# lote comprado de fornecedor (preco_por_250 é calculado)
python $C compra --fornecedor "Nome" --tc 1000 --valor 184 --comprovante "arquivo-ou-id"

# pedido novo: gera o próximo #BC-NNNN; custo usa a última compra (ou --preco250 46)
python $C venda --contato "(11) 9xxxx-xxxx" --personagem "Eldor Vane" --tc 250 --valor 52

# mudar status
python $C status BC-0001 entregue --comprovante "id do Pix"

# totais, lucro, pedidos aguardando e estoque estimado
python $C resumo            # geral
python $C resumo --mes 2026-11
```

Opções comuns: `--data DD/MM/AAAA` (padrão hoje), `--obs "texto"`, `--status` na venda (padrão `aguardando`).

No Windows o comando é `python` (o `python3` de lá é só um atalho da Microsoft Store); no Linux e no Mac, `python3`.

- Valores: `1840`, `1.840`, `1840,50`, `1.840,50` e `R$ 52,00` funcionam (ponto com 3 dígitos depois é milhar).
- Custo da venda: **custo médio** por 250 TC de todas as compras registradas, a menos que se passe `--preco250`.
- Se o pedido for maior que o estoque livre (estoque menos pedidos aguardando), o script avisa: registrar a compra de coins antes de entregar.

## Passos

1. Juntar os dados: contato, nome **exato** do personagem, quantidade de TC (múltiplo de 25) e valor. Se faltar algo, perguntar; não inventar.
2. Se o personagem ainda não foi conferido, usar a skill `checar-personagem` antes.
3. Rodar o comando e repetir para a pessoa o número do pedido e o lucro que o script imprimiu.
4. Pedido entregue: passar para `entregue` só depois de a pessoa confirmar que transferiu as coins.

## Lembretes de negócio (docs/negocio.md)

- Status `entregue` só depois do Pix cair; a entrega é **manual** pela pessoa. Nunca sugerir bot, macro ou script na conta do Tibia.
- Sem comprovante, o script avisa: os comprovantes são a prova de revenda para a Receita.
- Cliente novo com pedido grande: anotar em `--obs` e lembrar do risco de devolução de Pix (MED).
- Reembolso depois da entrega: status `reembolsado`; o resumo conta o custo como perda.
