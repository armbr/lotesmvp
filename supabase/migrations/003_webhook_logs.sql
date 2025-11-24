-- 003_webhook_logs.sql
-- Cria tabela para armazenar logs de webhooks recebidos/encaminhados e verificação HMAC

create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  source text,
  payload jsonb,
  signature text,
  verified boolean,
  headers jsonb,
  received_at timestamptz default now()
);
