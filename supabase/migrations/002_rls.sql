-- 002_rls.sql
-- Ative Row Level Security (RLS) e crie políticas de acesso por role.
-- Execute este arquivo no SQL Editor do Supabase APÓS rodar 001_init.sql

-- 1) Tabela de mapeamento de usuários da app para roles (relacionada ao auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  role text not null default 'cliente',
  criado_em timestamptz default now()
);

-- 2) Função utilitária para checar roles
create or replace function public.user_has_role(roles text[])
returns boolean stable language sql as $$
  select exists(
    select 1 from public.users u where u.id = auth.uid()::uuid and u.role = any(roles)
  );
$$;

-- 3) Habilitar RLS nas tabelas sensíveis
alter table public.gastos enable row level security;
alter table public.documentos enable row level security;
alter table public.notificacoes enable row level security;
alter table public.cronograma_obras enable row level security;
alter table public.processos_licencas enable row level security;
alter table public.lotes enable row level security;
alter table public.empreendimentos enable row level security;
alter table public.clientes enable row level security;

-- 4) Políticas gerais

-- Empreendimentos: SELECT = qualquer usuário autenticado, INSERT/UPDATE/DELETE = admin/socio
create policy empreendimentos_select_auth on public.empreendimentos
  for select using ( auth.uid() IS NOT NULL );

create policy empreendimentos_modify_admins on public.empreendimentos
  for all using ( public.user_has_role(ARRAY['admin','socio']) ) with check ( public.user_has_role(ARRAY['admin','socio']) );

-- Lotes: SELECT = autenticados, UPDATE (status venda/reserva) = admin, corretor, engenheiro
create policy lotes_select_auth on public.lotes for select using ( auth.uid() IS NOT NULL );
create policy lotes_update_roles on public.lotes for update using ( public.user_has_role(ARRAY['admin','corretor','engenheiro']) ) with check ( public.user_has_role(ARRAY['admin','corretor','engenheiro']) );

-- Gastos: INSERT = admin ou socio; SELECT = autenticados; UPDATE/DELETE = admin
create policy gastos_select_auth on public.gastos for select using ( auth.uid() IS NOT NULL );
create policy gastos_insert_socio_admin on public.gastos for insert with check ( public.user_has_role(ARRAY['admin','socio']) );
create policy gastos_update_admin on public.gastos for update using ( public.user_has_role(ARRAY['admin']) ) with check ( public.user_has_role(ARRAY['admin']) );
create policy gastos_delete_admin on public.gastos for delete using ( public.user_has_role(ARRAY['admin']) );

-- Documentos: SELECT = autenticados (com a restrição de cliente ver apenas seus docs pode ser adicionada depois);
-- INSERT = admin, socio, corretor; UPDATE (assinatura) = autenticados
create policy documentos_select_auth on public.documentos for select using ( auth.uid() IS NOT NULL );
create policy documentos_insert_roles on public.documentos for insert with check ( public.user_has_role(ARRAY['admin','socio','corretor']) );
create policy documentos_update_signed on public.documentos for update using ( auth.uid() IS NOT NULL ) with check ( auth.uid() IS NOT NULL );

-- Cronograma: SELECT = autenticados; INSERT/UPDATE = admin/engenheiro
create policy cronograma_select_auth on public.cronograma_obras for select using ( auth.uid() IS NOT NULL );
create policy cronograma_modify on public.cronograma_obras for all using ( public.user_has_role(ARRAY['admin','engenheiro']) ) with check ( public.user_has_role(ARRAY['admin','engenheiro']) );

-- Processos/Licenças: SELECT = autenticados; INSERT/UPDATE = admin/engenheiro
create policy processos_select_auth on public.processos_licencas for select using ( auth.uid() IS NOT NULL );
create policy processos_modify on public.processos_licencas for all using ( public.user_has_role(ARRAY['admin','engenheiro']) ) with check ( public.user_has_role(ARRAY['admin','engenheiro']) );

-- Clientes: cada cliente pode ver seu próprio registro; admins podem ver todos
create policy clientes_select_owner on public.clientes for select using (
  auth.uid() IS NOT NULL and (
    public.user_has_role(ARRAY['admin']) OR id = auth.uid()::uuid
  )
);
create policy clientes_modify_admin on public.clientes for all using ( public.user_has_role(ARRAY['admin']) ) with check ( public.user_has_role(ARRAY['admin']) );

-- Notificações: INSERT restrito a admin/sócio ou ao service role (service role ignora RLS)
create policy notificacoes_select_auth on public.notificacoes for select using ( auth.uid() IS NOT NULL );
create policy notificacoes_insert_admin on public.notificacoes for insert with check ( public.user_has_role(ARRAY['admin','socio']) );
create policy notificacoes_update_admin on public.notificacoes for update using ( public.user_has_role(ARRAY['admin','socio']) ) with check ( public.user_has_role(ARRAY['admin','socio']) );

-- Observação: o SUPABASE_SERVICE_ROLE_KEY ignora RLS, portanto ações server-side (rotas) podem usar esse client para operações administrativas e envio de webhooks.
