-- ══════════════════════════════════════════════════════
-- MIGRAÇÃO: capa de imagem nas coleções + admin edita coleções
-- Rodar no SQL Editor do Supabase (uma vez só)
-- ══════════════════════════════════════════════════════

-- 1. Campo de capa (link do Drive ou URL de imagem vertical 1080×1920)
alter table collections add column if not exists cover_url text;

-- 2. Admin pode editar/criar/apagar coleções (hoje só existe leitura)
drop policy if exists "Admin atualiza coleções" on collections;
create policy "Admin atualiza coleções"
  on collections for update
  to authenticated
  using (exists (select 1 from users where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from users where id = auth.uid() and is_admin = true));

drop policy if exists "Admin insere coleções" on collections;
create policy "Admin insere coleções"
  on collections for insert
  to authenticated
  with check (exists (select 1 from users where id = auth.uid() and is_admin = true));

drop policy if exists "Admin apaga coleções" on collections;
create policy "Admin apaga coleções"
  on collections for delete
  to authenticated
  using (exists (select 1 from users where id = auth.uid() and is_admin = true));
