#!/usr/bin/env python3
"""Gera a arte "Preço do dia" da BellaCoins (feed 1080x1350) em SVG e PNG.

Uso:
  python .claude/skills/arte-preco-do-dia/gerar.py --preco 52
  python .claude/skills/arte-preco-do-dia/gerar.py --preco 52,50 --tc 250 \
      --selo "Pix na hora" --selo "Chegou no char" --data 05.11

Saída: marketing/preco-do-dia/AAAA-MM-DD-<tc>tc.svg e .png (na raiz do projeto).
O PNG sai com as fontes de marca/fontes/ via FONTCONFIG_FILE + rsvg-convert,
sem precisar instalar as fontes no sistema.
"""
import argparse
import datetime as dt
import html
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[2]  # .claude/skills/arte-preco-do-dia -> raiz do projeto
FONTES = RAIZ / "marca" / "fontes"

# Selos do kit (identidade-visual.html: .st1 a .st4): fundo, texto, borda, rotação
ESTILOS = {
    "pix na hora": ("#FFC23D", "#160A24", None, -4),
    "chegou no char": ("#FF2E88", "#FFF4F8", None, 3),
    "preço do dia": ("#FFF4F8", "#160A24", None, -2),
    "desde 2026": ("none", "#B79CFF", "#B79CFF", 0),
}
ALTERNATIVOS = [("#FFC23D", "#160A24", None, -4), ("#FF2E88", "#FFF4F8", None, 3)]
# radicais, para pegar masculino/feminino/plural ("garantido", "garantida", "parceiros"...)
PROIBIDAS = ("oficia", "autorizad", "parceir", "100% seguro", "garantid")


def preco(valor: str) -> tuple[str, str]:
    m = re.fullmatch(r"\s*(?:R\$\s*)?(\d{1,4})(?:[.,](\d{1,2}))?\s*", valor)
    if not m:
        sys.exit(f"Preço inválido: {valor!r}. Exemplos: 52 | 52,50 | 52.5")
    return m.group(1), (m.group(2) or "00").ljust(2, "0")


def selo_svg(texto: str, i: int, x: float) -> tuple[str, float]:
    fundo, cor, borda, rot = ESTILOS.get(texto.lower(), ALTERNATIVOS[i % 2])
    rotulo = texto.upper()
    tam, ls, pad, alt = 26, 1.6, 34, 64
    larg = sum(10.5 if c == " " else 21.5 for c in rotulo) + ls * len(rotulo) + 2 * pad
    y = 1282 - 44
    cx, cy = x + larg / 2, y + alt / 2
    stroke = f' stroke="{borda}" stroke-width="3"' if borda else ""
    svg = (
        f'  <g transform="rotate({rot} {cx:.0f} {cy:.0f})">\n'
        f'    <rect x="{x:.0f}" y="{y}" width="{larg:.0f}" height="{alt}" rx="{alt/2:.0f}" fill="{fundo}"{stroke}/>\n'
        f'    <text x="{cx:.0f}" y="{y + 43}" text-anchor="middle" font-family="Unbounded" font-weight="800" '
        f'font-size="{tam}" letter-spacing="{ls}" fill="{cor}">{html.escape(rotulo)}</text>\n'
        f"  </g>"
    )
    return svg, larg


def dia_da_arte(txt: str | None) -> dt.date:
    """--data DD.MM (ou DD/MM) vira a data da arte, no ano atual; sem --data, hoje."""
    hoje = dt.date.today()
    if not txt:
        return hoje
    m = re.fullmatch(r"\s*(\d{1,2})[./](\d{1,2})\s*", txt)
    if m:
        try:
            return dt.date(hoje.year, int(m.group(2)), int(m.group(1)))
        except ValueError:
            pass
    sys.exit(f"Data inválida: {txt!r}. Use DD.MM, ex.: 05.11")


def main() -> None:
    for s in (sys.stdout, sys.stderr):
        s.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--preco", required=True, help="preço do pacote em reais, ex.: 52 ou 52,50")
    ap.add_argument("--tc", type=int, default=250, help="quantidade de Tibia Coins (padrão 250)")
    ap.add_argument("--data", help="data no formato DD.MM (padrão: hoje)")
    ap.add_argument("--selo", action="append", help='selo do rodapé; até 2 (padrão: "Pix na hora")')
    ap.add_argument("--insta", default="@bellacoins", help="@ do Instagram no rodapé")
    ap.add_argument("--saida", type=Path, default=RAIZ / "marketing" / "preco-do-dia", help="pasta de saída")
    a = ap.parse_args()

    selos = a.selo or ["Pix na hora"]
    if len(selos) > 2:
        sys.exit("Regra da marca: no máximo 2 selos por arte.")
    for t in selos + [a.insta]:
        if any(p in t.lower() for p in PROIBIDAS):
            sys.exit(f"Texto proibido pela identidade visual: {t!r}")
    if a.tc <= 0 or a.tc % 25:
        sys.exit("Quantidade de TC deve ser múltiplo de 25.")

    reais, cent = preco(a.preco)
    dia = dia_da_arte(a.data)
    data = dia.strftime("%d.%m")

    # o preço encolhe se tiver mais dígitos, para não encostar na borda
    tam = {1: 210, 2: 200, 3: 170, 4: 140}[len(reais)]
    x, partes = 72.0, []
    for i, s in enumerate(selos):
        svg, larg = selo_svg(s, i, x)
        partes.append(svg)
        x += larg + 22
    inicio_insta = 1008 - len(a.insta) * 18  # largura aproximada do @ em Plus Jakarta 34px
    if x - 22 > inicio_insta - 24:
        sys.exit("Os selos encostam no @ do rodapé: use um selo só ou textos mais curtos.")

    campos = {
        "DATA": html.escape(data),
        "TC": str(a.tc),
        "REAIS": reais,
        "CENTAVOS": cent,
        "TAM_PRECO": str(tam),
        "TAM_CENT": str(round(tam * 0.45)),
        "Y_ROTULO": str(1170 - tam - 24),
        "Y_BRILHO": str(1170 - tam - 40),
        "SELOS": "\n".join(partes),
        "INSTA": html.escape(a.insta),
    }
    svg = (AQUI / "modelo-feed.svg").read_text(encoding="utf-8")
    for k, v in campos.items():
        svg = svg.replace("{{" + k + "}}", v)
    if "{{" in svg:
        sys.exit("Sobrou campo sem preencher no modelo.")

    a.saida.mkdir(parents=True, exist_ok=True)
    # nome pela data da arte; se já existe uma igual, não sobrescreve: -2, -3...
    base, n = f"{dia.isoformat()}-{a.tc}tc", 1
    nome = base
    while (a.saida / f"{nome}.png").exists() or (a.saida / f"{nome}.svg").exists():
        n += 1
        nome = f"{base}-{n}"
    svg_path, png_path = a.saida / f"{nome}.svg", a.saida / f"{nome}.png"
    svg_path.write_text(svg, encoding="utf-8")

    if not shutil.which("rsvg-convert"):
        sys.exit(f"SVG salvo em {svg_path}, mas falta o rsvg-convert para gerar o PNG (pacote librsvg).")
    with tempfile.TemporaryDirectory() as tmp:
        conf = Path(tmp) / "fonts.conf"
        conf.write_text(
            f'<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>'
            f"<dir>{html.escape(str(FONTES))}</dir><cachedir>{html.escape(tmp)}/cache</cachedir></fontconfig>",
            encoding="utf-8",
        )
        env = dict(os.environ, FONTCONFIG_FILE=str(conf))
        subprocess.run(["rsvg-convert", "-w", "1080", "-h", "1350", "-o", str(png_path), str(svg_path)],
                       check=True, env=env)
    print(png_path)
    print(svg_path)


if __name__ == "__main__":
    main()
