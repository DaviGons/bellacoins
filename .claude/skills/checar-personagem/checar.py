#!/usr/bin/env python3
"""Confere se um personagem do Tibia existe, pela API pública TibiaData (v4).

  python3 .claude/skills/checar-personagem/checar.py "Eldor Vane"

Só lê dados públicos (os mesmos da página de personagem do tibia.com); não toca em conta nenhuma.
Saída 0 = existe; 1 = não confirmado (conferir à mão no link impresso); 2 = uso errado.
"""
import json
import sys
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.tibiadata.com/v4/character/{}"
SITE = "https://www.tibia.com/community/?name={}"


def main() -> int:
    if len(sys.argv) != 2 or not sys.argv[1].strip():
        print(__doc__)
        return 2
    nome = " ".join(sys.argv[1].split())
    link = SITE.format(urllib.parse.quote_plus(nome))
    req = urllib.request.Request(API.format(urllib.parse.quote(nome)), headers={"User-Agent": "BellaCoins/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            dados = json.load(r)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
        motivo = f"HTTP {e.code}" if isinstance(e, urllib.error.HTTPError) else type(e).__name__
        print(f"NÃO CONFIRMADO: a API não respondeu ({motivo}). Isso costuma acontecer quando o nome não existe,")
        print(f"mas também quando a API está fora. Conferir à mão: {link}")
        return 1

    c = (dados.get("character") or {}).get("character") or {}
    achado = (c.get("name") or "").strip()
    if not achado:
        print(f"NÃO CONFIRMADO: personagem não encontrado. Conferir à mão: {link}")
        return 1

    print(f"EXISTE: {achado}")
    print(f"  Mundo: {c.get('world')} | Vocação: {c.get('vocation')} | Level: {c.get('level')}")
    if achado != nome:
        print(f"  Atenção: o nome certo é \"{achado}\" (o cliente escreveu \"{nome}\"). Usar o nome certo no pedido.")
    for campo, aviso in (("deleted", "marcado para exclusão"), ("traded", "foi negociado no Char Bazaar recentemente")):
        if c.get(campo):
            print(f"  Atenção: personagem {aviso}. Confirmar com o cliente antes de entregar.")
    print(f"  Página: {SITE.format(urllib.parse.quote_plus(achado))}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
