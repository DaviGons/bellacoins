#!/usr/bin/env python3
"""Controle de compras e vendas da BellaCoins (financeiro/compras.csv e vendas.csv).

  caixa.py compra --fornecedor "Fulano" --tc 1000 --valor 184 [--comprovante X] [--obs X] [--data DD/MM/AAAA]
  caixa.py venda  --contato "(11) 9...." --personagem "Eldor Vane" --tc 250 --valor 52
                  [--preco250 46] [--status aguardando] [--comprovante X] [--obs X] [--data DD/MM/AAAA]
  caixa.py status BC-0001 entregue [--comprovante X] [--obs X]
  caixa.py resumo [--mes AAAA-MM]

Formato dos CSVs: separador ";", vírgula decimal, datas DD/MM/AAAA, UTF-8 com BOM
(para o Excel em português mostrar os acentos certos).
custo_rs = quantidade_tc / 250 x custo médio por 250 (todas as compras registradas, ou --preco250);
lucro_rs = valor_recebido_rs - custo_rs.
Valores aceitam "1840", "1.840", "1840,50", "1.840,50" e "R$ 52,00" (ponto sozinho com 3 dígitos = milhar).
"""
import argparse
import csv
import datetime as dt
import os
import re
import sys
import tempfile
from decimal import ROUND_HALF_UP, Decimal, InvalidOperation
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
COMPRAS = ["data", "fornecedor", "quantidade_tc", "valor_pago_rs", "preco_por_250", "comprovante", "observacoes"]
VENDAS = ["data", "pedido", "cliente_contato", "personagem", "quantidade_tc", "valor_recebido_rs",
          "custo_rs", "lucro_rs", "status", "comprovante_pix", "observacoes"]
STATUS = ("aguardando", "entregue", "cancelado", "reembolsado")
CENT = Decimal("0.01")


def dinheiro(txt: str) -> Decimal:
    t = str(txt).strip().replace("R$", "").replace(" ", "")
    if "," in t:
        t = t.replace(".", "").replace(",", ".")
    elif re.fullmatch(r"-?\d{1,3}(\.\d{3})+", t):
        t = t.replace(".", "")  # "1.840" é mil oitocentos e quarenta, não 1,84
    try:
        return Decimal(t).quantize(CENT, ROUND_HALF_UP)
    except InvalidOperation:
        sys.exit(f"Valor inválido: {txt!r}")


def fmt(v: Decimal) -> str:
    return f"{v.quantize(CENT, ROUND_HALF_UP):.2f}".replace(".", ",")


def data_br(txt: str | None) -> str:
    if not txt:
        return dt.date.today().strftime("%d/%m/%Y")
    for f in ("%d/%m/%Y", "%Y-%m-%d", "%d/%m/%y"):
        try:
            return dt.datetime.strptime(txt, f).strftime("%d/%m/%Y")
        except ValueError:
            pass
    sys.exit(f"Data inválida: {txt!r} (use DD/MM/AAAA)")


def ler(caminho: Path, campos: list[str]) -> list[dict]:
    if not caminho.exists():
        return []
    with caminho.open(encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f, delimiter=";")
        if r.fieldnames and [c.strip() for c in r.fieldnames] != campos:
            sys.exit(f"Cabeçalho inesperado em {caminho.name}: {r.fieldnames}")
        return [row for row in r if any((v or "").strip() for v in row.values())]


def gravar(caminho: Path, campos: list[str], linhas: list[dict]) -> None:
    caminho.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=caminho.parent, prefix=f".{caminho.name}.")
    with os.fdopen(fd, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos, delimiter=";", lineterminator="\r\n")
        w.writeheader()
        w.writerows(linhas)
    os.replace(tmp, caminho)


def checar_tc(tc: int) -> None:
    if tc <= 0 or tc % 25:
        sys.exit("quantidade_tc deve ser positiva e múltipla de 25.")


def valor_positivo(txt: str) -> Decimal:
    v = dinheiro(txt)
    if v <= 0:
        sys.exit(f"Valor deve ser maior que zero: {txt!r}")
    return v


def custo_medio_250(compras: list[dict]) -> Decimal | None:
    """Custo médio ponderado por 250 TC, somando todas as compras registradas."""
    tc = sum(int(c["quantidade_tc"]) for c in compras)
    if not tc:
        return None
    pago = sum((dinheiro(c["valor_pago_rs"]) for c in compras), Decimal(0))
    return (pago * 250 / tc).quantize(CENT, ROUND_HALF_UP)


def estoque(compras: list[dict], vendas: list[dict]) -> tuple[int, int]:
    """(TC em estoque, TC reservadas em pedidos aguardando)."""
    comprado = sum(int(c["quantidade_tc"]) for c in compras)
    saiu = sum(int(v["quantidade_tc"]) for v in vendas if v["status"] in ("entregue", "reembolsado"))
    reservado = sum(int(v["quantidade_tc"]) for v in vendas if v["status"] == "aguardando")
    return comprado - saiu, reservado


def cmd_compra(a, pasta: Path) -> None:
    checar_tc(a.tc)
    valor = valor_positivo(a.valor)
    linhas = ler(pasta / "compras.csv", COMPRAS)
    linha = {
        "data": data_br(a.data), "fornecedor": a.fornecedor, "quantidade_tc": str(a.tc),
        "valor_pago_rs": fmt(valor), "preco_por_250": fmt(valor * 250 / a.tc),
        "comprovante": a.comprovante or "", "observacoes": a.obs or "",
    }
    gravar(pasta / "compras.csv", COMPRAS, linhas + [linha])
    print(f"Compra registrada: {a.tc} TC de {a.fornecedor} por R$ {linha['valor_pago_rs']} "
          f"(R$ {linha['preco_por_250']} por 250 TC).")
    if not a.comprovante:
        print("Atenção: guardar o comprovante (é a prova de revenda para a Receita).")


def cmd_venda(a, pasta: Path) -> None:
    checar_tc(a.tc)
    if a.status not in STATUS:
        sys.exit(f"Status deve ser um de: {', '.join(STATUS)}")
    compras = ler(pasta / "compras.csv", COMPRAS)
    p250 = valor_positivo(a.preco250) if a.preco250 else custo_medio_250(compras)
    if p250 is None:
        sys.exit("Sem compras registradas: informe --preco250 (quanto custou cada 250 TC).")
    valor = valor_positivo(a.valor)
    custo = (p250 * a.tc / 250).quantize(CENT, ROUND_HALF_UP)

    vendas = ler(pasta / "vendas.csv", VENDAS)
    em_estoque, reservado = estoque(compras, vendas)
    nums = [int(m.group(1)) for v in vendas if (m := re.fullmatch(r"#?BC-(\d+)", v["pedido"].strip()))]
    pedido = f"BC-{(max(nums) + 1) if nums else 1:04d}"
    linha = {
        "data": data_br(a.data), "pedido": pedido, "cliente_contato": a.contato, "personagem": a.personagem.strip(),
        "quantidade_tc": str(a.tc), "valor_recebido_rs": fmt(valor), "custo_rs": fmt(custo),
        "lucro_rs": fmt(valor - custo), "status": a.status,
        "comprovante_pix": a.comprovante or "", "observacoes": a.obs or "",
    }
    gravar(pasta / "vendas.csv", VENDAS, vendas + [linha])
    print(f"Pedido #{pedido}: {a.tc} TC para {linha['personagem']} por R$ {linha['valor_recebido_rs']} "
          f"(custo R$ {linha['custo_rs']} a R$ {fmt(p250)} por 250, lucro R$ {linha['lucro_rs']}), status {a.status}.")
    if valor - custo <= 0:
        print("Atenção: esta venda não dá lucro.")
    livre = em_estoque - reservado
    if a.status in ("aguardando", "entregue") and a.tc > livre:
        print(f"Atenção: estoque livre estimado é {livre} TC ({em_estoque} em estoque, {reservado} reservadas "
              f"em pedidos aguardando). Comprar coins antes de entregar e registrar a compra.")


def cmd_status(a, pasta: Path) -> None:
    if a.novo not in STATUS:
        sys.exit(f"Status deve ser um de: {', '.join(STATUS)}")
    alvo = a.pedido.upper().lstrip("#")
    vendas = ler(pasta / "vendas.csv", VENDAS)
    achou = [v for v in vendas if v["pedido"].upper().lstrip("#") == alvo]
    if not achou:
        sys.exit(f"Pedido {alvo} não encontrado.")
    v = achou[0]
    antigo, v["status"] = v["status"], a.novo
    if a.comprovante:
        v["comprovante_pix"] = a.comprovante
    if a.obs:
        v["observacoes"] = "; ".join(x for x in (v["observacoes"], a.obs) if x)
    gravar(pasta / "vendas.csv", VENDAS, vendas)
    print(f"Pedido #{alvo}: status mudou de {antigo} para {a.novo}.")


def cmd_resumo(a, pasta: Path) -> None:
    if a.mes and not re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", a.mes):
        sys.exit(f"Mês inválido: {a.mes!r} (use AAAA-MM, ex.: 2026-11)")

    def no_mes(linha):
        if not a.mes:
            return True
        d = dt.datetime.strptime(linha["data"], "%d/%m/%Y")
        return d.strftime("%Y-%m") == a.mes

    compras = [c for c in ler(pasta / "compras.csv", COMPRAS)]
    vendas = [v for v in ler(pasta / "vendas.csv", VENDAS)]
    em_estoque, reservado = estoque(compras, vendas)
    medio = custo_medio_250(compras)

    vm = [v for v in vendas if no_mes(v)]
    por = {s: [v for v in vm if v["status"] == s] for s in STATUS}
    ent = por["entregue"]
    receita = sum((dinheiro(v["valor_recebido_rs"]) for v in ent), Decimal(0))
    lucro = sum((dinheiro(v["lucro_rs"]) for v in ent), Decimal(0))
    perdas = sum((dinheiro(v["custo_rs"]) for v in por["reembolsado"]), Decimal(0))
    gasto = sum((dinheiro(c["valor_pago_rs"]) for c in compras if no_mes(c)), Decimal(0))

    print(f"Resumo {'de ' + a.mes if a.mes else 'geral'}")
    print(f"  Pedidos: {len(vm)}  (entregues {len(ent)}, aguardando {len(por['aguardando'])}, "
          f"cancelados {len(por['cancelado'])}, reembolsados {len(por['reembolsado'])})")
    print(f"  Receita entregue: R$ {fmt(receita)}")
    print(f"  Lucro bruto:      R$ {fmt(lucro)}" + (f"  (margem média R$ {fmt(lucro / len(ent))} por pedido)" if ent else ""))
    if perdas:
        print(f"  Custo de reembolsos: R$ {fmt(perdas)}")
    print(f"  Gasto com compras: R$ {fmt(gasto)}")
    print(f"  Estoque estimado (todas as datas): {em_estoque} TC"
          + (f", {reservado} reservadas em pedidos aguardando" if reservado else ""))
    if medio is not None:
        print(f"  Custo médio por 250 TC: R$ {fmt(medio)}")
    if em_estoque < 0:
        print("  Atenção: estoque negativo. Falta registrar alguma compra ou há venda com quantidade errada.")
    pend = por["aguardando"]
    if pend:
        print("  Aguardando: " + ", ".join(f"#{v['pedido']} ({v['personagem']}, {v['quantidade_tc']} TC)" for v in pend))


def main() -> None:
    # No Windows, a saída redirecionada usa cp1252 e quebra acentos; UTF-8 sempre.
    for s in (sys.stdout, sys.stderr):
        s.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pasta", type=Path, default=RAIZ / "financeiro", help=argparse.SUPPRESS)
    sub = ap.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("compra", help="registrar lote comprado de fornecedor")
    c.add_argument("--fornecedor", required=True)
    c.add_argument("--tc", type=int, required=True)
    c.add_argument("--valor", required=True, help="total pago em R$")
    c.add_argument("--comprovante"); c.add_argument("--obs"); c.add_argument("--data")

    v = sub.add_parser("venda", help="registrar pedido")
    v.add_argument("--contato", required=True, help="WhatsApp/@ do cliente")
    v.add_argument("--personagem", required=True)
    v.add_argument("--tc", type=int, required=True)
    v.add_argument("--valor", required=True, help="valor recebido em R$")
    v.add_argument("--preco250", help="custo por 250 TC (padrão: última compra)")
    v.add_argument("--status", default="aguardando")
    v.add_argument("--comprovante"); v.add_argument("--obs"); v.add_argument("--data")

    s = sub.add_parser("status", help="mudar status de um pedido")
    s.add_argument("pedido"); s.add_argument("novo")
    s.add_argument("--comprovante"); s.add_argument("--obs")

    r = sub.add_parser("resumo", help="totais, lucro e estoque")
    r.add_argument("--mes", help="AAAA-MM")

    a = ap.parse_args()
    {"compra": cmd_compra, "venda": cmd_venda, "status": cmd_status, "resumo": cmd_resumo}[a.cmd](a, a.pasta)


if __name__ == "__main__":
    main()
