import Link from "next/link";
import { LOJA } from "@/config/loja";
import { Logo } from "./Logo";

export function Topo() {
  return (
    <header className="topo">
      <div className="wrap">
        <Link href="/" aria-label={`${LOJA.nome}, página inicial`} style={{ textDecoration: "none" }}>
          <Logo />
        </Link>
        <nav aria-label="Principal">
          <Link href="/#como-funciona">Como funciona</Link>
          <Link href="/#duvidas">Dúvidas</Link>
          <Link href="/regras">Regras</Link>
          <Link href="/#pacotes" className="nav-principal">
            Pacotes
          </Link>
        </nav>
      </div>
    </header>
  );
}
