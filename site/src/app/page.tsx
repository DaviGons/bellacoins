import Image from "next/image";
import styles from "./page.module.css";

// Página provisória no modo vitrine. Será trocada pelo catálogo (compra em 3 telas).
export default function Home() {
  return (
    <main className={styles.vitrine}>
      <div className={styles.padrao} aria-hidden="true" />

      <header className={styles.logo} aria-label="BellaCoins">
        <Image src="/simbolo.png" alt="" width={44} height={44} priority />
        <span className={styles.bella}>Bella</span>
        <span className={styles.coins}>COINS</span>
      </header>

      <section className={styles.palco}>
        <div className={styles.moeda}>
          <Image src="/simbolo.png" alt="Moeda da BellaCoins" width={260} height={260} priority />
          <span className={`${styles.brilho} ${styles.brilho1}`} aria-hidden="true">✦</span>
          <span className={`${styles.brilho} ${styles.brilho2}`} aria-hidden="true">✦</span>
          <span className={`${styles.selo} ${styles.selo1}`}>Pix na hora</span>
          <span className={`${styles.selo} ${styles.selo2}`}>Chegou no char</span>
        </div>

        <div className={styles.texto}>
          <h1 className={styles.titulo}>
            Pagou no Pix,
            <br />
            <span className={styles.destaque}>chegou</span> no char.
          </h1>
          <p className={styles.sub}>
            Tibia Coins com pagamento por Pix e entrega no seu personagem. O site está em construção:
            em breve dá para escolher o pacote, conferir o char e pagar por aqui.
          </p>
        </div>
      </section>

      <footer className={styles.rodape}>
        Loja independente, sem vínculo com a CipSoft. Tibia é marca registrada da CipSoft GmbH.
      </footer>
    </main>
  );
}
