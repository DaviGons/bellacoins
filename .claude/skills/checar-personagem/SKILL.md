---
name: checar-personagem
description: Confere se um personagem do Tibia existe (nome exato, mundo, level) antes de cobrar ou entregar Tibia Coins na BellaCoins, usando a API pública TibiaData. Use quando um cliente passar o nome do char, antes de registrar um pedido, ou quando perguntarem "esse char existe?", "confere o nome", "qual o mundo desse personagem".
---

# Checar personagem

Passo 2 do fluxo de compra (`docs/identidade-visual.md`): o nome do char é conferido **antes** do Pix, para a entrega não ir para o personagem errado.

```bash
python .claude/skills/checar-personagem/checar.py "Nome do Char"
```

No Windows o comando é `python`; no Linux e no Mac, `python3`.

| Resultado | O que fazer |
|---|---|
| `EXISTE` (saída 0) | Usar no pedido o nome **exatamente** como o script imprimiu (maiúsculas, espaços). Se houver aviso de nome diferente, confirmar com o cliente. |
| `NÃO CONFIRMADO` (saída 1) | A TibiaData responde com erro tanto para nome inexistente quanto quando está fora do ar. Abrir o link do tibia.com impresso e conferir à mão; se não existir, pedir o nome de novo ao cliente. |
| Aviso de exclusão ou Char Bazaar | Confirmar com o cliente antes de entregar. |

## Limites

- Só lê dados públicos de personagem. Não faz login, não acessa conta nenhuma e não automatiza nada no jogo: a transferência de coins continua **manual**.
- Não pedir senha, e-mail ou dados de conta do cliente. Só o nome do personagem.
- Mundo e level servem para confirmar com o cliente ("é o Knight 273 do Refugia?"), não para mais nada.
