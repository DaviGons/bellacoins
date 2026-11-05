#!/usr/bin/env bash
# Instala as skills do Claude Code usadas na BellaCoins, no escopo do projeto (.claude/).
#
# Uso:
#   bash scripts/instalar-skills.sh          # o que serve agora (marketing, arte, design)
#   bash scripts/instalar-skills.sh --site   # + o que só faz sentido quando o site existir
#
# As quatro skills próprias da loja (arte-preco-do-dia, registrar-venda, mensagem-cliente,
# checar-personagem) já vêm no projeto, em .claude/skills/, e não precisam de instalação.
#
# Precisa de: node/npx, git e o Claude Code (comando `claude`). Rodar de novo é seguro.

set -euo pipefail

cd "$(dirname "$0")/.."

SKILLS_CLI="skills@1.7.6"   # versão fixa do instalador do skills.sh
SITE=0
[[ "${1:-}" == "--site" ]] && SITE=1

add_skills() {  # add_skills <repo> <skill> [<skill>...]
  local repo="$1"; shift
  echo "→ $repo: $*"
  npx --yes "$SKILLS_CLI" add "$repo" -a claude-code --copy -y --skill "$@"
}

add_plugin() {  # add_plugin <plugin>
  echo "→ plugin $1"
  claude plugin install "$1@claude-plugins-official" --scope project
}

for cmd in npx git claude; do
  command -v "$cmd" >/dev/null || { echo "Falta o comando '$cmd'." >&2; exit 1; }
done

echo "== Agora: marketing, arte e design =="

# Instagram, legendas, preço e WhatsApp (as outras 46 skills do pacote são para SaaS e ficam de fora)
add_skills coreyhaines31/marketingskills social copywriting copy-editing pricing offers sms referrals

# Telas e artes com cara própria, revisão de UI (acessibilidade, foco, mobile)
add_skills anthropics/skills frontend-design
add_skills vercel-labs/agent-skills web-design-guidelines

# Canva: criar, redimensionar e conferir artes (pede login no Canva no primeiro uso)
add_plugin canva

if [[ $SITE -eq 1 ]]; then
  echo "== Fase do site =="

  add_skills vercel-labs/agent-skills vercel-react-best-practices deploy-to-vercel
  add_skills anthropics/skills webapp-testing
  add_skills supabase/agent-skills supabase supabase-postgres-best-practices

  # Pix pelo Mercado Pago (beta). Antes, conferir nos termos se aceitam venda de moeda de jogo.
  add_plugin mercadopago
  # Testes no navegador (servidor MCP @playwright/mcp)
  add_plugin playwright
  # Revisão de segurança: roda hooks a cada prompt/edição e revisa o diff com LLM ao terminar
  add_plugin security-guidance
fi

echo
echo "Pronto. Skills do projeto em .claude/skills/:"
ls -1 .claude/skills
echo
echo "Abra uma sessão nova do Claude Code nesta pasta para carregar tudo."
[[ $SITE -eq 0 ]] && echo "Quando o site começar: bash scripts/instalar-skills.sh --site"
exit 0
