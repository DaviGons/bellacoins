import type { Metadata } from "next";
import { DM_Mono, Fraunces, Plus_Jakarta_Sans, Unbounded } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LOJA } from "@/config/loja";
import "./globals.css";

// As quatro fontes da marca (docs/identidade-visual.md).
const fraunces = Fraunces({ variable: "--fonte-fraunces", subsets: ["latin"], style: "italic", weight: "900" });
const unbounded = Unbounded({ variable: "--fonte-unbounded", subsets: ["latin"], weight: ["500", "700", "800"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--fonte-jakarta", subsets: ["latin"] });
const dmMono = DM_Mono({ variable: "--fonte-dmmono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: `${LOJA.nome} · Tibia Coins no Pix`, template: `%s · ${LOJA.nome}` },
  description: `Tibia Coins com pagamento no Pix e entrega no seu personagem. ${LOJA.slogan}`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${unbounded.variable} ${jakarta.variable} ${dmMono.variable}`}
    >
      <body>
        <header className="vitrine">
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "14px 16px" }}>
            <Link href="/" aria-label={`${LOJA.nome}, página inicial`} style={{ textDecoration: "none" }}>
              <Logo />
            </Link>
          </div>
          <div className="vitrine-faixa" />
        </header>
        {children}
        <footer className="rodape">
          {LOJA.nome} é uma loja independente, sem ligação com a CipSoft. Tibia é marca da CipSoft GmbH.
        </footer>
      </body>
    </html>
  );
}
