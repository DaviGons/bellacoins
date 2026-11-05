"use server";

import { redirect } from "next/navigation";
import { pacoteValido, precoCentavos } from "@/config/loja";
import { pedidos } from "@/lib/pedidos";
import { checarPersonagem, normalizarNome, type Personagem } from "@/lib/tibia";

export type EstadoForm = {
  etapa: "digitar" | "confirmar";
  erro?: string;
  personagem?: Personagem; // o que a API achou
  naoConferido?: boolean; // API fora do ar: o cliente confirma o nome por conta própria
  nome?: string;
  contato?: string;
};

function limparContato(txt: string): string | null {
  const digitos = txt.replace(/\D/g, "");
  return digitos.length >= 10 && digitos.length <= 13 ? digitos : null;
}

// Etapa 1 confere o personagem e mostra o que achou; etapa 2 (confirmar=1) cria o pedido.
export async function enviarPedido(_anterior: EstadoForm, form: FormData): Promise<EstadoForm> {
  const tc = Number(form.get("tc"));
  const nome = normalizarNome(String(form.get("personagem") ?? ""));
  const contatoBruto = String(form.get("contato") ?? "").trim();
  const confirmar = form.get("confirmar") === "1";
  const base = { nome, contato: contatoBruto };

  if (!pacoteValido(tc)) return { ...base, etapa: "digitar", erro: "Pacote inválido. Volte e escolha de novo." };
  if (!nome) return { ...base, etapa: "digitar", erro: "Digite o nome do personagem." };
  const contato = limparContato(contatoBruto);
  if (!contato) return { ...base, etapa: "digitar", erro: "Digite um WhatsApp com DDD, só números." };

  const checagem = await checarPersonagem(nome);
  if (checagem.status === "nao_encontrado") {
    return {
      ...base,
      etapa: "digitar",
      erro: `Não achamos "${nome}" no Tibia. Confira o nome exato, com espaços e letras maiúsculas.`,
    };
  }

  if (!confirmar) {
    return checagem.status === "existe"
      ? { ...base, etapa: "confirmar", personagem: checagem.personagem }
      : { ...base, etapa: "confirmar", naoConferido: true };
  }

  const p = checagem.status === "existe" ? checagem.personagem : null;
  const pedido = await pedidos().criar({
    tc,
    valorCentavos: precoCentavos(tc),
    personagem: p?.nome ?? nome,
    mundo: p?.mundo ?? "",
    personagemConferido: !!p,
    contato,
    observacoes: p?.avisos.join(" ") ?? "Personagem não conferido: API fora do ar no momento do pedido.",
  });
  redirect(`/pedido/${pedido.token}`);
}
