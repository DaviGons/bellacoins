# BellaCoins

Loja de Tibia Coins, pequena e caseira, com venda por Pix e entrega manual no personagem do cliente.
Slogan: **"Pagou no Pix, chegou no char."**

Identidade visual aprovada em 05/11/2026 (versão 2).
Página da identidade: https://claude.ai/artifact/Tgyh37b4QHifte61phAuL7 (cópia local em `marca/identidade-visual.html`).

## Pastas

| Pasta | O que tem |
|---|---|
| `site/` | Site da loja (Next.js), hoje em modo demonstração: vitrine, pacotes, conferência do personagem, Pix de exemplo, regras e painel. Ver `site/README.md` |
| `docs/negocio.md` | Modelo de negócio, preços pesquisados, conta de margem, riscos e quando abrir CNPJ |
| `docs/identidade-visual.md` | Resumo da marca: cores, fontes, logo, tom de voz e regras |
| `marca/logo/` | Logos em SVG e, em `png/`, prontos para Instagram, WhatsApp e Discord |
| `marca/fontes/` | As quatro fontes da marca (licença livre OFL) |
| `marca/cores.css` | Cores e fontes prontas para usar no site |
| `financeiro/` | Planilhas de controle de compras e vendas (CSV, abre no Excel ou Google Sheets) |
| `.claude/skills/` | Skills do Claude Code para a loja (veja abaixo) |
| `.claude/settings.json` | Plugins do Claude Code ligados no projeto (hoje: Canva) |
| `skills-lock.json` | Origem e versão (hash) de cada skill de terceiros instalada; não editar à mão |
| `scripts/instalar-skills.sh` | Reinstala as skills de terceiros; `--site` adiciona as da fase do site |
| `marketing/preco-do-dia/` | Artes geradas pela skill `arte-preco-do-dia` (a pasta aparece na primeira arte) |

## Skills do Claude Code

É só pedir ao Claude em português, e ele escolhe a skill. Abra uma sessão nova nesta pasta depois de instalar ou mudar skills.

### Feitas para a loja

Já vêm no projeto e não precisam de instalação.

| Skill | O que faz | Pedido de exemplo |
|---|---|---|
| `arte-preco-do-dia` | Post de feed 1080x1350 no modo vitrine, com no máximo 2 selos | "Faz a arte do preço do dia: 250 TC por R$ 52" → PNG em `marketing/preco-do-dia/` |
| `registrar-venda` | Anota compras e vendas nos CSVs de `financeiro/`, gera o `#BC-0001` e mostra lucro e estoque | "Anota: 250 TC pro Eldor Vane, R$ 52, contato (11) 9..." / "Resumo do mês" |
| `checar-personagem` | Confere nome, mundo e level do char antes do Pix (API pública TibiaData, só leitura) | "Confere se o char Eldor Vane existe" |
| `mensagem-cliente` | Mensagens de WhatsApp, Instagram e Discord no tom da marca | "Responde esse cliente avisando que o Pix caiu" |

Fluxo de um pedido: `checar-personagem` → `mensagem-cliente` (orçamento e Pix) → `registrar-venda` (aguardando) → entrega manual → `registrar-venda` (entregue) → `mensagem-cliente` (aviso de entrega).

Precisa de `python3` (só a biblioteca padrão). A arte usa também o `rsvg-convert` (pacote `librsvg`), e a checagem de personagem precisa de internet.
Os CSVs de `financeiro/` devem ser alterados só pela skill `registrar-venda`, que mantém o formato do Excel em português.

### De terceiros

Instaladas com `bash scripts/instalar-skills.sh` (precisa de `node`/`npx`, `git` e `claude`):

- Marketing: `social`, `copywriting`, `copy-editing`, `pricing`, `offers`, `sms`, `referrals`
- Design: `frontend-design`, `web-design-guidelines`
- Plugin `canva`: cria e redimensiona artes no Canva (pede login no primeiro uso)

Essas skills foram escritas em inglês e para negócios de software. As regras da loja e da marca valem acima delas.

Quando o site começar: `bash scripts/instalar-skills.sh --site` (Supabase, Vercel, testes no navegador, Mercado Pago, revisão de segurança). Antes de usar o Mercado Pago, conferir nos termos se aceitam venda de moeda de jogo.

## Para começar (pequeno)

- [ ] Registrar o domínio `bellacoins.com.br` no registro.br (parecia livre em 04/11/2026)
- [ ] Criar o @ no Instagram e o WhatsApp Business com o avatar `marca/logo/png/avatar-1080.png`
- [ ] Abrir uma conta bancária só para a loja (PF no início), com chave Pix própria
- [ ] Criar uma conta do Tibia só para o estoque, com autenticação em dois passos no Tibia e no e-mail
- [ ] Fechar um ou dois fornecedores de confiança (referência: compra a ~R$ 46 por 250 TC)
- [ ] Definir o preço de venda (sugestão: R$ 52 a R$ 53 por 250 TC)
- [ ] Escrever as regras da loja: entrega só após o Pix, o cliente confirma o nome do char, prazo, reembolso
- [ ] Separar uma reserva para reembolsos
- [ ] Anotar toda compra e venda em `financeiro/` (com a skill `registrar-venda`)
- [ ] Quando as vendas ficarem regulares, falar com um contador sobre MEI ou ME

## Depois

- Site: todas as telas estão em `site/`, no modo demonstração. A tabela de pedidos já existe no Supabase (projeto `bellacoins`). Faltam ligar o site ao Supabase, a chave Pix real (ou um gateway) e publicar na Vercel; o caminho está em `site/README.md`
- Outros formatos de arte (stories 1080x1920, tabela de preços) a partir de `.claude/skills/arte-preco-do-dia/modelo-feed.svg`. O post de feed do "preço do dia" já está pronto.

## Regras que não mudam

- Entrega **manual**. Nada de bot, macro ou script na conta do Tibia.
- Nunca anunciar dentro do jogo (chat, nome de personagem).
- Nunca usar logo, arte ou personagens do Tibia, nem dizer que a loja é "oficial".

## Fontes nos SVGs

Os SVGs do logo usam as fontes da marca como texto. Para abrir certinho no computador, instale as fontes de `marca/fontes/`
(no Linux: copiar para `~/.local/share/fonts/` e rodar `fc-cache -f`; no Windows: clique duplo e "Instalar").
Os PNGs em `marca/logo/png/` já saem com as fontes certas e podem ser usados direto.
