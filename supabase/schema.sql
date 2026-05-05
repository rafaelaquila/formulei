create extension if not exists pgcrypto;

create table if not exists public.formularios (
  id uuid primary key default gen_random_uuid(),
  setor text not null,
  gestor text not null,
  cargo_gestor text not null,
  data_preenchimento date not null,
  email_respondente text,
  created_at timestamptz not null default now()
);

create table if not exists public.colaboradores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  departamento text not null,
  tipo_vinculo text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sistemas (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.colaboradores_diretorio (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text,
  setor text,
  created_at timestamptz not null default now()
);

create table if not exists public.acessos (
  id uuid primary key default gen_random_uuid(),
  formulario_id uuid not null references public.formularios (id) on delete cascade,
  colaborador_id uuid not null references public.colaboradores (id) on delete cascade,
  sistema_id uuid not null references public.sistemas (id),
  utiliza boolean not null default false,
  tipos_acesso text[] not null default '{}',
  detalhamento text,
  observacoes text,
  status text not null,
  ajuste text,
  created_at timestamptz not null default now()
);

alter table public.formularios add column if not exists email_respondente text;
alter table public.colaboradores add column if not exists departamento text;
alter table public.acessos add column if not exists observacoes text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'colaboradores'
      and column_name = 'cargo'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'colaboradores'
      and column_name = 'departamento'
  ) then
    execute 'alter table public.colaboradores rename column cargo to departamento';
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'acessos'
      and column_name = 'rotina'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'acessos'
      and column_name = 'observacoes'
  ) then
    execute 'alter table public.acessos rename column rotina to observacoes';
  end if;
end $$;

alter table public.formularios enable row level security;
alter table public.colaboradores enable row level security;
alter table public.sistemas enable row level security;
alter table public.colaboradores_diretorio enable row level security;
alter table public.acessos enable row level security;

drop policy if exists "authenticated can read formularios" on public.formularios;
drop policy if exists "authenticated can write formularios" on public.formularios;
drop policy if exists "authenticated can read colaboradores" on public.colaboradores;
drop policy if exists "authenticated can write colaboradores" on public.colaboradores;
drop policy if exists "authenticated can read sistemas" on public.sistemas;
drop policy if exists "authenticated can write sistemas" on public.sistemas;
drop policy if exists "authenticated can read acessos" on public.acessos;
drop policy if exists "authenticated can write acessos" on public.acessos;
drop policy if exists "authenticated can read colaboradores_diretorio" on public.colaboradores_diretorio;
drop policy if exists "authenticated can write colaboradores_diretorio" on public.colaboradores_diretorio;
drop policy if exists "anon insert formularios" on public.formularios;
drop policy if exists "anon select formularios" on public.formularios;
drop policy if exists "anon insert colaboradores" on public.colaboradores;
drop policy if exists "anon select colaboradores" on public.colaboradores;
drop policy if exists "anon insert sistemas" on public.sistemas;
drop policy if exists "anon select sistemas" on public.sistemas;
drop policy if exists "anon insert acessos" on public.acessos;
drop policy if exists "anon select acessos" on public.acessos;
drop policy if exists "anon insert colaboradores_diretorio" on public.colaboradores_diretorio;
drop policy if exists "anon select colaboradores_diretorio" on public.colaboradores_diretorio;
drop policy if exists "select_formularios" on public.formularios;
drop policy if exists "insert_formularios" on public.formularios;
drop policy if exists "select_colaboradores" on public.colaboradores;
drop policy if exists "insert_colaboradores" on public.colaboradores;
drop policy if exists "select_sistemas" on public.sistemas;
drop policy if exists "insert_sistemas" on public.sistemas;
drop policy if exists "select_acessos" on public.acessos;
drop policy if exists "insert_acessos" on public.acessos;
drop policy if exists "select_colaboradores_diretorio" on public.colaboradores_diretorio;
drop policy if exists "insert_colaboradores_diretorio" on public.colaboradores_diretorio;

create policy "select_formularios"
  on public.formularios for select to anon, authenticated using (true);

create policy "insert_formularios"
  on public.formularios for insert to anon, authenticated with check (true);

create policy "select_colaboradores"
  on public.colaboradores for select to anon, authenticated using (true);

create policy "insert_colaboradores"
  on public.colaboradores for insert to anon, authenticated with check (true);

create policy "select_sistemas"
  on public.sistemas for select to anon, authenticated using (true);

create policy "insert_sistemas"
  on public.sistemas for insert to anon, authenticated with check (true);

create policy "select_colaboradores_diretorio"
  on public.colaboradores_diretorio for select to anon, authenticated using (true);

create policy "insert_colaboradores_diretorio"
  on public.colaboradores_diretorio for insert to anon, authenticated with check (true);

create policy "select_acessos"
  on public.acessos for select to anon, authenticated using (true);

create policy "insert_acessos"
  on public.acessos for insert to anon, authenticated with check (true);
