import Link from "next/link";
import { LOJA } from "@/config/loja";
import { linkWhatsApp, whatsappConfigurado } from "@/lib/whatsapp";
import { Logo } from "./Logo";

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="wrap">
        <div className="rodape-topo">
          <div>
            <Logo />
            <p>
              {LOJA.slogan} Atendimento {LOJA.horario}.
            </p>
          </div>
          <nav aria-label="Rodapé">
            <Link href="/#pacotes">Pacotes</Link>
            <Link href="/#como-funciona">Como funciona</Link>
            <Link href="/#duvidas">Dúvidas</Link>
            <Link href="/regras">Regras da loja</Link>
          </nav>
          <nav aria-label="Contato">
            {whatsappConfigurado ? (
              <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            ) : (
              <span>WhatsApp em breve</span>
            )}
            <span>Instagram em breve</span>
            <span>Discord em breve</span>
          </nav>
        </div>
        <p className="legal">
          {LOJA.nome} é uma loja independente de revenda de Tibia Coins, sem ligação com a CipSoft. Tibia é marca
          registrada da CipSoft GmbH.
        </p>
      </div>
    </footer>
  );
}
