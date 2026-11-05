"use client";

import { useActionState, useState } from "react";
import { enviarPedido, type EstadoForm } from "./actions";

export function FormPedido({ tc }: { tc: number }) {
  const [estado, acao, enviando] = useActionState<EstadoForm, FormData>(enviarPedido, { etapa: "digitar" });
  const [editando, setEditando] = useState(false);
  const confirmar = estado.etapa === "confirmar" && !editando;
  const p = estado.personagem;

  return (
    <form action={acao} onSubmit={() => setEditando(false)}>
      <input type="hidden" name="tc" value={tc} />
      {confirmar && <input type="hidden" name="confirmar" value="1" />}

      <div className="campo">
        <label htmlFor="personagem">Nome do personagem</label>
        <input
          id="personagem"
          name="personagem"
          defaultValue={estado.nome}
          key={`p-${estado.nome}`}
          readOnly={confirmar}
          required
          autoComplete="off"
          spellCheck={false}
          maxLength={29}
          placeholder="Ex.: Eldor Vane"
        />
        <span className="ajuda">Igual aparece no jogo. As coins vão para este personagem.</span>
      </div>

      <div className="campo">
        <label htmlFor="contato">Seu WhatsApp</label>
        <input
          id="contato"
          name="contato"
          type="tel"
          inputMode="tel"
          defaultValue={estado.contato}
          key={`c-${estado.contato}`}
          readOnly={confirmar}
          required
          autoComplete="tel"
          placeholder="(11) 91234-5678"
        />
        <span className="ajuda">Só para avisar da entrega ou se algo der errado.</span>
      </div>

      {estado.erro && !editando && (
        <p className="aviso aviso-erro" role="alert">
          {estado.erro}
        </p>
      )}

      {confirmar && p && (
        <div className="aviso aviso-ok" role="status">
          Achamos <strong>{p.nome}</strong>
          {p.mundo && <> · {p.mundo}</>}
          {p.level > 0 && <> · level {p.level}</>}
          {p.vocacao && <> · {p.vocacao}</>}. É esse?
          {p.avisos.map((a) => (
            <div key={a} style={{ marginTop: 6 }}>
              ⚠ {a}
            </div>
          ))}
        </div>
      )}

      {confirmar && estado.naoConferido && (
        <p className="aviso aviso-atencao" role="status">
          Não conseguimos conferir o personagem agora. Confira se o nome está exato antes de seguir: a entrega vai
          para ele.
        </p>
      )}

      <button className="botao" type="submit" disabled={enviando}>
        {enviando ? "Um instante…" : confirmar ? "É esse, ir para o Pix" : "Conferir personagem"}
      </button>

      {confirmar && (
        <p style={{ textAlign: "center", marginTop: 14 }}>
          <button type="button" className="botao-secundario" onClick={() => setEditando(true)}>
            Corrigir dados
          </button>
        </p>
      )}
    </form>
  );
}
