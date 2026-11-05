const ETAPAS = ["Pacote", "Personagem", "Pix"];

// Indicador das três telas de compra. `atual` vai de 1 a 3.
export function TrilhaCompra({ atual }: { atual: 1 | 2 | 3 }) {
  return (
    <ol className="trilha" aria-label="Etapas da compra">
      {ETAPAS.map((nome, i) => {
        const n = i + 1;
        return (
          <li key={nome} className={n < atual ? "feito" : undefined} aria-current={n === atual ? "step" : undefined}>
            {nome}
          </li>
        );
      })}
    </ol>
  );
}
