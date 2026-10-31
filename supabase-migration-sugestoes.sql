-- ══════════════════════════════════════════════════════
-- MIGRAÇÃO: caixinha de sugestões das alunas
-- Rodar no SQL Editor do Supabase (uma vez só)
-- ══════════════════════════════════════════════════════

create table if not exists sugestoes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users on delete set null,
  email text,
  name text,
  tipo text not null default 'sugestao' check (tipo in ('sugestao', 'curadoria', 'erro', 'elogio')),
  texto text not null,
  pagina text,
  lida boolean not null default false,
  created_at timestamptz default now() not null
);

alter table sugestoes enable row level security;

-- Aluna envia a própria sugestão
drop policy if exists "Aluna envia sugestão" on sugestoes;
create policy "Aluna envia sugestão"
  on sugestoes for insert
  to authenticated
  with check (user_id = auth.uid());

-- Só admin lê, marca como lida e apaga
drop policy if exists "Admin lê sugestões" on sugestoes;
create policy "Admin lê sugestões"
  on sugestoes for select
  to authenticated
  using (exists (select 1 from users where id = auth.uid() and is_admin = true));

drop policy if exists "Admin atualiza sugestões" on sugestoes;
create policy "Admin atualiza sugestões"
  on sugestoes for update
  to authenticated
  using (exists (select 1 from users where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from users where id = auth.uid() and is_admin = true));

drop policy if exists "Admin apaga sugestões" on sugestoes;
create policy "Admin apaga sugestões"
  on sugestoes for delete
  to authenticated
  using (exists (select 1 from users where id = auth.uid() and is_admin = true));

create index if not exists sugestoes_created_idx on sugestoes (created_at desc);
