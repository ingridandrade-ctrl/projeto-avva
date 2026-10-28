-- ══════════════════════════════════════════════════════
-- MIGRAÇÃO: escolher qual coleção a home das alunas destaca
-- Rodar no SQL Editor do Supabase (uma vez só)
-- ══════════════════════════════════════════════════════

alter table collections add column if not exists featured boolean not null default false;

-- Sem nenhuma marcada, a home continua destacando o "Melhores do mês" mais recente.
