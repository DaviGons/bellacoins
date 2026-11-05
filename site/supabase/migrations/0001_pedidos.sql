-- Tabela de pedidos do site. Espelha o tipo Pedido de src/lib/pedidos/tipos.ts.
-- Aplicada no projeto Supabase "bellacoins" (cyruigouzeigkjhzqdgv) em 05/11/2026.

create sequence if not exists public.pedidos_numero_seq;

create table if not exists public.pedidos (
  id                    bigint generated always as identity primary key,
  numero                text not null unique default ('BC-' || lpad(nextval('public.pedidos_numero_seq')::text, 4, '0')),
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

-- atualizado_em muda sozinho a cada UPDATE
create or replace function public.pedidos_tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists pedidos_atualizado_em on public.pedidos;
create trigger pedidos_atualizado_em
  before update on public.pedidos
  for each row execute function public.pedidos_tocar_atualizado_em();

-- Só o servidor do site (chave service_role, que ignora o RLS) lê e escreve.
-- Nenhum acesso pelo navegador: RLS ligado sem políticas e sem permissões para anon/authenticated.
alter table public.pedidos enable row level security;
revoke all on table public.pedidos from anon, authenticated;
revoke all on sequence public.pedidos_numero_seq from anon, authenticated;
revoke all on function public.pedidos_tocar_atualizado_em() from public, anon, authenticated;
