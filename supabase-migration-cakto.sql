-- ══════════════════════════════════════════════════════
-- MIGRAÇÃO: venda pela Cakto (webhook, bloqueio no reembolso)
-- Rodar no SQL Editor do Supabase (uma vez só)
-- ══════════════════════════════════════════════════════

-- 1. Pedido da Cakto e bloqueio de acesso no perfil
alter table users add column if not exists cakto_order_id text;
alter table users add column if not exists access_blocked boolean not null default false;

-- 2. Eventos já processados (a Cakto pode reenviar o mesmo evento)
create table if not exists cakto_events (
  id text primary key,
  created_at timestamptz default now() not null
);

alter table cakto_events enable row level security;
-- Só o service role (webhook) mexe aqui; nenhuma policy para anon/authenticated.
