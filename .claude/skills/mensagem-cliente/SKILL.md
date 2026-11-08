---
name: mensagem-cliente
description: Escreve mensagens de WhatsApp, direct do Instagram ou Discord para clientes da BellaCoins no tom da marca (simpática, rápida, clara), seguindo as regras da loja. Use para responder cliente, mandar orçamento, pedir o nome do char, confirmar Pix, avisar entrega, atraso, cancelamento, reembolso, regras da loja ou resposta a reclamação.
---

# Mensagem para cliente

Tom de voz (`docs/identidade-visual.md`): **simpática, rápida e clara**. Frases curtas, em português do dia a dia, falando de "você". A loja fala no feminino ("Obrigada pela compra!").

## Regras

- No máximo **um** ✦ por mensagem; emoji e caixa-alta com moderação.
- Nunca usar "oficial", "autorizada", "parceira", "100% seguro" ou "garantido".
- Número de pedido sempre como `#BC-0000`; valores como `R$ 52,00`; quantidade como `250 TC`.
- Nunca pedir senha, e-mail ou qualquer dado de conta do Tibia. Só o **nome do personagem**.
- Nunca prometer entrega antes do Pix cair. Nunca mencionar bot ou entrega automática: a entrega é manual.
- Nunca inventar chave Pix, código copia e cola, prazo ou preço. Deixar `[PIX COPIA E COLA]`, `[PRAZO]` etc. para a pessoa preencher, a menos que ela tenha passado o dado.
- O copia e cola e o QR de um pedido vêm da skill `cobrar-pix` (`financeiro/pix/BC-NNNN.txt` e `.png`). Usar o código exatamente como o script gerou; mandar o QR junto como imagem.
- Nunca dizer ao cliente que um print de comprovante basta: a entrega sai depois que o Pix aparece no banco da loja.
- Não falar de anúncio dentro do jogo nem convidar o cliente a divulgar no jogo.

## Modelos

Adaptar ao caso; os valores entre colchetes vêm da conversa ou da pessoa.

**Primeiro contato / orçamento**
> Oi! Hoje o pacote de [250 TC] sai por [R$ 52,00]. Me passa o nome do seu personagem que eu já confiro e te mando o Pix.

**Pedido criado (após `checar-personagem` e `cobrar-pix`)**
> Pedido [#BC-0142]: [250 TC] para o [Eldor Vane] ([Knight] do [Refugia]), total [R$ 52,00]. O QR já vai com o valor certo; se preferir, use o Pix copia e cola: [PIX COPIA E COLA]. Confere o nome do char antes de pagar, tá?

**Pix recebido e entregue**
> Pix recebido ✦ Suas [250 TC] já estão no [Eldor Vane]. Obrigada pela compra!

**Pix recebido, entrega em andamento**
> Pix recebido! Já estou separando suas [250 TC] para o [Eldor Vane]. Te aviso assim que caírem, em até [PRAZO].

**Atraso**
> Oi! Seu pedido [#BC-0142] está um pouquinho atrasado. Entrego até [PRAZO] e te aviso aqui na hora. Desculpa a espera!

**Nome do char não encontrado**
> Não achei o personagem "[nome]". Pode conferir como está escrito no jogo, com maiúsculas e espaços?

**Cancelamento antes do pagamento**
> Tudo certo, cancelei o pedido [#BC-0142]. Quando quiser, é só chamar!

**Reembolso**
> Fiz o reembolso de [R$ 52,00] do pedido [#BC-0142] pelo mesmo Pix. Pode levar alguns minutos para aparecer.

**Pedido grande de cliente novo** (risco de Pix devolvido, ver `docs/negocio.md`)
> Oi! Para pedidos acima de [valor], na primeira compra eu entrego depois que o Pix compensar e eu conferir tudo. Leva só [PRAZO]. Tudo bem pra você?

**Regras da loja (resumo para fixar)**
> Como funciona: 1) você escolhe o pacote e me passa o nome do char; 2) eu confiro e mando o Pix; 3) o Pix caiu, a coin chega no char, entregue à mão por mim. Não peço senha nem dados da sua conta. Prazo: [PRAZO]. Reembolso: [REGRA].

## Depois de mandar

Se a mensagem mudou o status de um pedido (pago, entregue, cancelado, reembolsado), lembrar de registrar com a skill `registrar-venda`.
