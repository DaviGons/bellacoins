import type { Metadata, Viewport } from "next";
import { DM_Mono, Fraunces, Plus_Jakarta_Sans, Unbounded } from "next/font/google";
import "./globals.css";

// Fontes da identidade visual v2 (docs/identidade-visual.md).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: "italic",
  weight: "900",
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "BellaCoins · Tibia Coins no Pix",
  description: "Pagou no Pix, chegou no char. Tibia Coins com pagamento por Pix e entrega no seu personagem.",
};

export const viewport: Viewport = {
  themeColor: "#160A24",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${unbounded.variable} ${jakarta.variable} ${dmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
