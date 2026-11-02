-- ══════════════════════════════════════════════════════
-- MIGRAÇÃO: foto de perfil das alunas
-- Rodar no SQL Editor do Supabase (uma vez só)
-- ══════════════════════════════════════════════════════

-- 1. Campo da foto no perfil
alter table users add column if not exists avatar_url text;

-- 2. A aluna pode mudar o próprio nome e a própria foto (e nada mais)
grant update (name, avatar_url) on users to authenticated;

-- 3. Espaço para as fotos (bucket público "avatars"); cada aluna só mexe na própria pasta.
--    Limite de 1 MB por foto e só imagens (o site já comprime: cada foto fica em ~50 KB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('avatars', 'avatars', true, 1048576, array['image/webp', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'])
  on conflict (id) do update
    set file_size_limit = 1048576,
        allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'];

drop policy if exists "Fotos públicas" on storage.objects;
create policy "Fotos públicas"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Aluna envia a própria foto" on storage.objects;
create policy "Aluna envia a própria foto"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Aluna troca a própria foto" on storage.objects;
create policy "Aluna troca a própria foto"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Aluna apaga a própria foto" on storage.objects;
create policy "Aluna apaga a própria foto"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
