#!/usr/bin/env python3
"""Gera o Pix de um pedido da BellaCoins: código "copia e cola" e QR Code com o valor já definido.

  python .claude/skills/cobrar-pix/pix.py --pedido BC-0001          # valor tirado de financeiro/vendas.csv
  python .claude/skills/cobrar-pix/pix.py --valor 52                # sem pedido (ex.: QR fixo de um pacote)
  python .claude/skills/cobrar-pix/pix.py --valor 52 --pedido BC-0001
  python .claude/skills/cobrar-pix/pix.py --conferir "<copia e cola>"  # confere um código já gerado

Pix estático (padrão BR Code do Banco Central): montado aqui, sem banco, sem API e sem tarifa de
intermediário. O pagamento NÃO é confirmado sozinho: conferir no app do banco antes de entregar.

Dados do recebedor no .env da raiz do projeto (fora do GitHub), ou em variáveis de ambiente:
  PIX_CHAVE=...   PIX_TIPO=aleatoria|email|celular|cpf|cnpj   PIX_NOME=...   PIX_CIDADE=...
Saída: financeiro/pix/<pedido ou valor>.png (QR) e .txt (copia e cola).
"""
import argparse
import csv
import os
import re
import sys
import unicodedata
from decimal import ROUND_HALF_UP, Decimal, InvalidOperation
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
ENV = RAIZ / ".env"
VENDAS = RAIZ / "financeiro" / "vendas.csv"
SAIDA = RAIZ / "financeiro" / "pix"
UUID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")


# ---------- BR Code (EMV QRCPS-MPM + manual do Pix do Banco Central) ----------

def campo(id_: str, valor: str) -> str:
    if len(valor) > 99:
        sys.exit(f"Campo {id_} passou de 99 caracteres.")
    return f"{id_}{len(valor):02d}{valor}"


def crc16(dados: str) -> str:
    """CRC16-CCITT (polinômio 0x1021, início 0xFFFF), exigido no campo 63."""
    crc = 0xFFFF
    for byte in dados.encode("utf-8"):
        crc ^= byte << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) if crc & 0x8000 else (crc << 1)
            crc &= 0xFFFF
    return f"{crc:04X}"


def montar(chave: str, nome: str, cidade: str, valor: Decimal | None, txid: str) -> str:
    conta = campo("00", "br.gov.bcb.pix") + campo("01", chave)
    corpo = (
        campo("00", "01")
        + campo("26", conta)
        + campo("52", "0000")
        + campo("53", "986")  # real
        + (campo("54", f"{valor:.2f}") if valor is not None else "")
        + campo("58", "BR")
        + campo("59", nome)
        + campo("60", cidade)
        + campo("62", campo("05", txid))
        + "6304"
    )
    return corpo + crc16(corpo)


def ler_campos(payload: str) -> dict[str, str]:
    campos, i = {}, 0
    while i < len(payload):
        id_, tam = payload[i:i + 2], payload[i + 2:i + 4]
        if not tam.isdigit():
            raise ValueError(f"tamanho inválido na posição {i}")
        campos[id_] = payload[i + 4:i + 4 + int(tam)]
        i += 4 + int(tam)
    return campos


def conferir(payload: str) -> list[str]:
    """Erros encontrados num copia e cola (lista vazia = válido)."""
    payload = payload.strip()
    erros = []
    if len(payload) < 8 or payload[-8:-4] != "6304":
        return ["não termina com o campo 63 (CRC)."]
    if crc16(payload[:-4]) != payload[-4:].upper():
        erros.append(f"CRC errado: esperado {crc16(payload[:-4])}, veio {payload[-4:]}.")
    try:
        c = ler_campos(payload)
        conta = ler_campos(c.get("26", ""))
    except ValueError as e:
        return erros + [str(e)]
    if conta.get("00", "").lower() != "br.gov.bcb.pix":
        erros.append("campo 26 não é de Pix (falta br.gov.bcb.pix).")
    if not conta.get("01"):
        erros.append("sem chave Pix.")
    for id_ in ("52", "53", "58", "59", "60"):
        if id_ not in c:
            erros.append(f"falta o campo {id_}.")
    return erros


# ---------- dados do recebedor ----------

def ler_env() -> dict[str, str]:
    dados = {}
    if ENV.exists():
        for linha in ENV.read_text(encoding="utf-8-sig").splitlines():
            linha = linha.strip()
            if linha and not linha.startswith("#") and "=" in linha:
                k, v = linha.split("=", 1)
                dados[k.strip()] = v.strip().strip('"').strip("'")
    for k in ("PIX_CHAVE", "PIX_TIPO", "PIX_NOME", "PIX_CIDADE"):
        if os.environ.get(k):
            dados[k] = os.environ[k]
    return dados


def sem_acento(txt: str) -> str:
    t = unicodedata.normalize("NFKD", txt).encode("ascii", "ignore").decode()
    return " ".join(t.split())


def normalizar_chave(chave: str, tipo: str = "") -> tuple[str, str]:
    """(chave no formato do Pix, tipo). PIX_TIPO no .env tira a dúvida entre CPF e celular."""
    c = chave.strip()
    tipo = sem_acento(tipo).lower()
    if tipo == "celular":
        d = re.sub(r"\D", "", c)
        d = d if d.startswith("55") and len(d) in (12, 13) else "55" + d
        if not re.fullmatch(r"55\d{10,11}", d):
            sys.exit(f"Celular inválido: {chave!r} (formato +55 DDD número)")
        return "+" + d, "celular"
    if tipo == "cpf":
        d = re.sub(r"\D", "", c)
        if len(d) != 11 or not cpf_ok(d):
            sys.exit(f"CPF inválido: {chave!r}")
        return d, "CPF"
    if tipo == "cnpj":
        d = re.sub(r"\D", "", c)
        if len(d) != 14:
            sys.exit(f"CNPJ inválido: {chave!r}")
        return d, "CNPJ"
    if "@" in c:
        if len(c) > 77 or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", c):
            sys.exit(f"Chave de e-mail inválida: {chave!r}")
        return c.lower(), "e-mail"
    if UUID.fullmatch(c.lower()):
        return c.lower(), "aleatória"
    digitos = re.sub(r"\D", "", c)
    if c.startswith("+") or (len(digitos) in (12, 13) and digitos.startswith("55")):
        if not re.fullmatch(r"55\d{10,11}", digitos):
            sys.exit(f"Celular inválido: {chave!r} (formato +55 DDD número)")
        return "+" + digitos, "celular"
    if len(digitos) == 11 and cpf_ok(digitos):
        return digitos, "CPF"
    if len(digitos) == 14:
        return digitos, "CNPJ"
    if len(digitos) in (10, 11):
        return "+55" + digitos, "celular (sem +55, assumido Brasil)"
    sys.exit(f"Não reconheci o tipo da chave Pix: {chave!r}")


def cpf_ok(d: str) -> bool:
    if d == d[0] * 11:
        return False
    for n in (9, 10):
        soma = sum(int(d[i]) * (n + 1 - i) for i in range(n))
        if (soma * 10 % 11) % 10 != int(d[n]):
            return False
    return True


def recebedor() -> tuple[str, str, str, list[str]]:
    env = ler_env()
    faltam = [k for k in ("PIX_CHAVE", "PIX_NOME", "PIX_CIDADE") if not env.get(k)]
    if faltam:
        sys.exit(
            f"Pix ainda não configurado: falta {', '.join(faltam)} no arquivo .env da raiz do projeto.\n"
            "Copiar .env.example para .env e preencher (ou mandar os dados ao Claude: chave Pix, "
            "nome do titular como está no banco e cidade)."
        )
    avisos = []
    chave, tipo = normalizar_chave(env["PIX_CHAVE"], env.get("PIX_TIPO", ""))
    if tipo.startswith("CPF") or tipo.startswith("celular"):
        avisos.append(f"A chave é {tipo}: todo cliente vai ver esse dado. Uma chave aleatória é mais discreta.")
    nome, cidade = sem_acento(env["PIX_NOME"]), sem_acento(env["PIX_CIDADE"])
    if len(nome) > 25:
        avisos.append(f"Nome cortado para 25 caracteres (limite do Pix): {nome[:25]!r}")
        nome = nome[:25].rstrip()
    if len(cidade) > 15:
        avisos.append(f"Cidade cortada para 15 caracteres (limite do Pix): {cidade[:15]!r}")
        cidade = cidade[:15].rstrip()
    return chave, nome, cidade, avisos


# ---------- pedido ----------

def valor_br(txt: str) -> Decimal:
    t = str(txt).strip().replace("R$", "").replace(" ", "")
    if "," in t:
        t = t.replace(".", "").replace(",", ".")
    elif re.fullmatch(r"\d{1,3}(\.\d{3})+", t):
        t = t.replace(".", "")
    try:
        v = Decimal(t).quantize(Decimal("0.01"), ROUND_HALF_UP)
    except InvalidOperation:
        sys.exit(f"Valor inválido: {txt!r}")
    if v <= 0 or v > Decimal("9999999999.99"):
        sys.exit(f"Valor fora do permitido: {txt!r}")
    return v


def buscar_pedido(pedido: str) -> dict | None:
    if not VENDAS.exists():
        return None
    with VENDAS.open(encoding="utf-8-sig", newline="") as f:
        for v in csv.DictReader(f, delimiter=";"):
            if v.get("pedido", "").upper().lstrip("#") == pedido:
                return v
    return None


def main() -> int:
    for s in (sys.stdout, sys.stderr):
        s.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pedido", help="número do pedido, ex.: BC-0001 (vai no Pix como BC0001)")
    ap.add_argument("--valor", help="valor em R$; sem ele, usa o valor do pedido em vendas.csv")
    ap.add_argument("--conferir", metavar="CODIGO", help="só confere um copia e cola existente")
    ap.add_argument("--saida", type=Path, default=SAIDA, help=argparse.SUPPRESS)
    a = ap.parse_args()

    if a.conferir:
        erros = conferir(a.conferir)
        if erros:
            print("INVÁLIDO: " + " ".join(erros))
            return 1
        c = ler_campos(a.conferir.strip())
        conta = ler_campos(c["26"])
        txid = ler_campos(c.get("62", "")).get("05", "") if c.get("62") else ""
        print(f"VÁLIDO: chave {conta['01']} | {c['59']} ({c['60']}) | "
              f"valor {('R$ ' + c['54'].replace('.', ',')) if '54' in c else 'em aberto'} | id {txid or '-'}")
        return 0

    if not a.pedido and not a.valor:
        ap.error("informe --pedido, --valor ou os dois.")

    pedido = a.pedido.upper().lstrip("#").strip() if a.pedido else None
    if pedido and not re.fullmatch(r"BC-\d{4,}", pedido):
        sys.exit(f"Pedido inválido: {a.pedido!r} (formato BC-0001)")
    linha = buscar_pedido(pedido) if pedido else None

    if a.valor:
        valor = valor_br(a.valor)
        if linha and valor_br(linha["valor_recebido_rs"]) != valor:
            print(f"Atenção: o pedido #{pedido} está anotado com R$ {linha['valor_recebido_rs']}, "
                  f"mas o Pix vai sair com R$ {valor:.2f}".replace(".", ",") + ".")
    elif linha:
        valor = valor_br(linha["valor_recebido_rs"])
    else:
        sys.exit(f"Pedido {pedido} não está em financeiro/vendas.csv: registrar com a skill registrar-venda "
                 "ou informar --valor.")
    if linha and linha.get("status") not in ("aguardando", None):
        print(f"Atenção: o pedido #{pedido} está com status {linha['status']}, não aguardando.")

    chave, nome, cidade, avisos = recebedor()
    txid = pedido.replace("-", "") if pedido else "***"
    codigo = montar(chave, nome, cidade, valor, txid)
    erros = conferir(codigo)
    if erros:  # não deveria acontecer; garante que nada inválido vai para o cliente
        sys.exit("Erro ao montar o Pix: " + " ".join(erros))

    valor_txt = f"{valor:.2f}".replace(".", ",")
    base = pedido or f"valor-{valor_txt.replace(',', '-')}"
    a.saida.mkdir(parents=True, exist_ok=True)
    txt_path, png_path = a.saida / f"{base}.txt", a.saida / f"{base}.png"
    txt_path.write_text(codigo + "\n", encoding="utf-8")

    print(f"Pix {'do pedido #' + pedido if pedido else 'avulso'}: R$ {valor_txt} para {nome} ({cidade})")
    if linha:
        print(f"  {linha['quantidade_tc']} TC para {linha['personagem']}")
    print("Copia e cola:")
    print(codigo)
    try:
        import segno
    except ImportError:
        print(f"\nQR não gerado: falta a biblioteca segno (python -m pip install segno==1.6.6). "
              f"O copia e cola está em {txt_path}")
        return 0
    # escuro do modo compra sobre branco: contraste alto, lê em qualquer app de banco
    segno.make(codigo, error="m", micro=False).save(str(png_path), scale=12, border=4,
                                                     dark="#1E1029", light="#FFFFFF")
    print(f"\nQR: {png_path}")
    print(f"Texto: {txt_path}")
    for aviso in avisos:
        print(f"Atenção: {aviso}")
    print("Lembrete: entregar só depois de ver o Pix no app do banco (print de comprovante não vale).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
