-- ==============================================
-- Mentoria Avva — Aplicações (existente)
-- ==============================================

create table aplicacoes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  origem text not null check (origem in ('flora', 'ingrid')),
  nome text not null,
  whatsapp text not null,
  email text not null,
  instagram text not null,
  nicho text not null,
  tempo_atuacao text not null,
  faturamento_atual text not null,
  objetivo_faturamento text not null,
  preco_produto_principal text not null,
  tem_equipe text not null,
  o_que_trava text not null,
  experiencia_mentoria text not null,
  como_chegou text not null,
  momento_atual text not null,
  visao_futuro text not null,
  por_que_eu text not null,
  status text default 'nova' not null check (status in ('nova', 'lida', 'em_analise', 'aprovada', 'recusada')),
  notas_internas text
);

alter table aplicacoes enable row level security;

create policy "Permitir inserção pública"
  on aplicacoes for insert
  to anon
  with check (true);

create policy "Permitir leitura"
  on aplicacoes for select
  to anon
  using (true);

create policy "Permitir atualização"
  on aplicacoes for update
  to anon
  using (true)
  with check (true);

create index idx_aplicacoes_origem on aplicacoes (origem);
create index idx_aplicacoes_status on aplicacoes (status);
create index idx_aplicacoes_created_at on aplicacoes (created_at desc);


-- ==============================================
-- Acervo de Criativos — Área de Membros
-- ==============================================

-- Perfis de usuárias (membros)
create table users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  has_order_bump boolean default false,
  created_at timestamptz default now() not null,
  hotmart_transaction_id text
);

alter table users enable row level security;

create policy "Usuárias leem próprio perfil"
  on users for select
  using (auth.uid() = id);

create policy "Service role insere usuárias"
  on users for insert
  with check (true);

create policy "Usuárias atualizam próprio perfil"
  on users for update
  using (auth.uid() = id);

-- Módulos
create table modules (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  "order" int not null,
  description text
);

alter table modules enable row level security;

create policy "Módulos visíveis para autenticados"
  on modules for select
  to authenticated
  using (true);

-- Anúncios
create table ads (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references modules on delete cascade not null,
  title text not null,
  subniche text,
  format text,
  moment text check (moment in ('topo', 'meio', 'fundo')),
  drive_url text,
  analysis text,
  created_at timestamptz default now() not null
);

alter table ads enable row level security;

create policy "Anúncios visíveis para autenticados"
  on ads for select
  to authenticated
  using (true);

-- Progresso por módulo
create table user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users on delete cascade not null,
  module_id uuid references modules on delete cascade not null,
  section_key text,
  completed_at timestamptz default now() not null,
  unique(user_id, module_id, section_key)
);

alter table user_progress enable row level security;

create policy "Progresso próprio - leitura"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "Progresso próprio - inserção"
  on user_progress for insert
  with check (auth.uid() = user_id);

create policy "Progresso próprio - exclusão"
  on user_progress for delete
  using (auth.uid() = user_id);

-- Favoritos
create table user_favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users on delete cascade not null,
  ad_id uuid references ads on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, ad_id)
);

alter table user_favorites enable row level security;

create policy "Favoritos próprios - leitura"
  on user_favorites for select
  using (auth.uid() = user_id);

create policy "Favoritos próprios - inserção"
  on user_favorites for insert
  with check (auth.uid() = user_id);

create policy "Favoritos próprios - exclusão"
  on user_favorites for delete
  using (auth.uid() = user_id);

-- Dados iniciais: módulos
insert into modules (slug, title, "order", description) values
  ('boas-vindas', 'Boas-vindas', 0, 'Vídeo de boas-vindas e orientações iniciais'),
  ('o-basico', 'O básico que ninguém explica', 1, 'Fundamentos de criativos que convertem'),
  ('negocio-local', 'Negócio local', 2, 'Anúncios para negócios locais'),
  ('infoproduto', 'Infoproduto', 3, 'Anúncios para infoprodutos'),
  ('servico', 'Serviço', 4, 'Anúncios para prestação de serviços'),
  ('ecommerce', 'E-commerce', 5, 'Anúncios para e-commerce'),
  ('bonus-datas', 'Datas especiais', 6, 'Anúncios para datas sazonais'),
  ('kit-execucao', 'Kit de Execução', 7, 'Ganchos, estruturas narrativas e prompts de IA');

-- Índices
create index idx_ads_module on ads (module_id);
create index idx_ads_moment on ads (moment);
create index idx_ads_format on ads (format);
create index idx_ads_subniche on ads (subniche);
create index idx_user_progress_user on user_progress (user_id);
create index idx_user_favorites_user on user_favorites (user_id);
