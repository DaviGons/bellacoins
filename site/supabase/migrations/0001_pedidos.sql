-- Rascunho da tabela de pedidos para quando o site for para o Supabase.
-- Espelha o tipo Pedido de src/lib/pedidos/tipos.ts. Ainda NÃO aplicado em projeto nenhum.

create sequence if not exists pedidos_numero_seq;

create table if not exists public.pedidos (
  id                    bigint generated always as identity primary key,
  numero                text not null unique default ('BC-' || lpad(nextval('pedidos_numero_seq')::text, 4, '0')),
  token                 text not null unique default replace(gen_random_uuid()::text, '-', ''),
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now(),
  status                text not null default 'aguardando_pix'
                        check (status in ('aguardando_pix', 'pago', 'entregue', 'cancelado', 'reembolsado')),
  tc                    integer not null check (tc > 0 and tc % 25 = 0),
  valor_centavos        integer not null check (valor_centavos > 0),
  personagem            text not null,
  mundo                 text not null default '',
  personagem_conferido  boolean not null default false,
  contato               text not null,
  observacoes           text not null default ''
);

create index if not exists pedidos_status_idx on public.pedidos (status, criado_em desc);

-- Só o servidor do site (chave service_role) lê e escreve. Nenhum acesso direto do navegador.
alter table public.pedidos enable row level security;
