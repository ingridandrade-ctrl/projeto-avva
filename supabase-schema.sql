-- Criar tabela de aplicações da Mentoria Avva
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

-- Permitir inserção pública (formulário) via anon key
alter table aplicacoes enable row level security;

create policy "Permitir inserção pública"
  on aplicacoes for insert
  to anon
  with check (true);

-- Permitir leitura e atualização via anon key (dashboard usa mesma key)
create policy "Permitir leitura"
  on aplicacoes for select
  to anon
  using (true);

create policy "Permitir atualização"
  on aplicacoes for update
  to anon
  using (true)
  with check (true);

-- Índices para filtros do dashboard
create index idx_aplicacoes_origem on aplicacoes (origem);
create index idx_aplicacoes_status on aplicacoes (status);
create index idx_aplicacoes_created_at on aplicacoes (created_at desc);
