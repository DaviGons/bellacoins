---
name: cobrar-pix
description: Gera o Pix de um pedido da BellaCoins, com QR Code e código "copia e cola" já com o valor definido (Pix estático, sem tarifa de intermediário), e confere códigos Pix. Use quando pedirem para cobrar, mandar o Pix, gerar QR Code, copia e cola, "cobra o pedido BC-0001", QR de um pacote, ou para configurar a chave Pix da loja.
---

# Cobrar no Pix

Pix **estático com valor**, no padrão BR Code do Banco Central: o código é montado aqui, com a chave da loja, sem banco, sem API e sem tarifa de intermediário. O cliente escaneia (ou cola) e o app dele já abre com o valor certo.

**O pagamento não é confirmado sozinho.** A pessoa confere no app do banco antes de entregar.

```bash
P=.claude/skills/cobrar-pix/pix.py

python $P --pedido BC-0001            # valor tirado de financeiro/vendas.csv
python $P --valor 52                  # QR avulso (ex.: QR fixo do pacote de 250 TC)
python $P --pedido BC-0001 --valor 52 # valor diferente do anotado (o script avisa)
python $P --conferir "000201..."      # confere um copia e cola (CRC, chave, campos)
```

No Windows o comando é `python`; no Linux e no Mac, `python3`. O QR em PNG usa a biblioteca `segno` (`python -m pip install segno==1.6.6`); sem ela, sai só o copia e cola.

Saída em `financeiro/pix/` (fora do GitHub): `BC-0001.png` (QR) e `BC-0001.txt` (copia e cola). O número do pedido vai dentro do Pix como `BC0001` (sem hífen, regra do padrão); alguns bancos mostram isso no extrato.

## Configuração (uma vez)

Os dados ficam no `.env` da raiz do projeto, que **não** vai para o GitHub. Modelo em `.env.example`:

```
PIX_CHAVE=
PIX_TIPO=aleatoria      # aleatoria, email, celular, cpf ou cnpj
PIX_NOME=               # titular como aparece no banco (até 25 letras)
PIX_CIDADE=             # até 15 letras
```

Quando a pessoa mandar os dados no chat: copiar `.env.example` para `.env` (se não existir), preencher só esses campos, rodar `python $P --valor 1` e mostrar o resultado do `--conferir` para ela conferir chave, nome e cidade. Pedir que ela **pague esse Pix de R$ 1,00 de teste** de outra conta antes de usar com clientes. Apagar o `financeiro/pix/valor-1-00.*` depois.

- Chave aleatória é a mais indicada: CPF ou celular ficam visíveis para todo cliente (o script avisa).
- Não pedir nem guardar senha de banco, token ou dados de cartão: a chave Pix, o nome e a cidade bastam.

## Passos para cobrar um pedido

1. O pedido precisa existir em `vendas.csv` (skill `registrar-venda`) e o personagem precisa ter sido conferido (skill `checar-personagem`).
2. Rodar `python $P --pedido BC-NNNN`.
3. Entregar à pessoa o caminho do PNG e o copia e cola, e montar a mensagem com a skill `mensagem-cliente` (modelo "Pedido criado"), colando o código no lugar de `[PIX COPIA E COLA]`.
4. Lembrar: entregar as coins **só depois de ver o Pix no extrato do app do banco**. Print de comprovante não vale (é o golpe mais comum). Conferir valor, nome de quem pagou e horário.
5. Pix caiu e coins entregues: `registrar-venda` com status `entregue`.

## Regras

- Nunca inventar chave, nome ou cidade: se o `.env` não estiver preenchido, o script para e diz o que falta. Pedir os dados à pessoa.
- Nunca mandar ao cliente um código que o `--conferir` diga ser inválido.
- Cliente novo com pedido grande: lembrar do risco de devolução de Pix (MED), ver `docs/negocio.md`.
- Este método não usa Mercado Pago nem outro intermediário. Pix dinâmico com confirmação automática fica para a fase do site.
