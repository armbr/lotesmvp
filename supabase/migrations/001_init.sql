-- Supabase schema para Loteadora MVP
-- Crie essas tabelas no SQL editor do Supabase

-- users será gerenciado pelo Supabase Auth. Teremos uma view/role no app.

create table empreendimentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cidade text,
  total_lotes int default 0,
  area_total numeric,
  foto_aerea text,
  percentual_obra int default 0,
  criado_em timestamptz default now()
);

create table lotes (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid references empreendimentos(id) on delete cascade,
  quadra text,
  numero text,
  area_m2 numeric,
  valor_venda numeric,
  status text default 'disponivel',
  cliente_id uuid,
  criado_em timestamptz default now()
);

create table clientes (
  id uuid primary key default gen_random_uuid(),
  nome text,
  contato jsonb,
  criado_em timestamptz default now()
);

create table cronograma_obras (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid references empreendimentos(id) on delete cascade,
  etapa text,
  descricao text,
  data_inicio_previsto date,
  data_fim_previsto date,
  percentual_concluido int default 0,
  status text default 'pendente'
);

create table processos_licencas (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid references empreendimentos(id) on delete cascade,
  nome text,
  orgao text,
  status text,
  data_prevista date
);

create table documentos (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid references empreendimentos(id) on delete cascade,
  tipo text,
  url text,
  descricao text,
  requer_assinatura boolean default false,
  assinaturas_pendentes uuid[] default array[]::uuid[],
  assinaturas_feitas jsonb default '[]'::jsonb,
  criado_em timestamptz default now()
);

create table categorias_custo (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  editavel boolean default true
);

-- inserir categorias padrão
insert into categorias_custo (id,nome,editavel) values
  (gen_random_uuid(),'Infraestrutura', false),
  (gen_random_uuid(),'Pavimentação', false),
  (gen_random_uuid(),'Redes', false),
  (gen_random_uuid(),'Muros e Guias', false),
  (gen_random_uuid(),'Licenças e Taxas', false),
  (gen_random_uuid(),'Cartório', false),
  (gen_random_uuid(),'Marketing', false),
  (gen_random_uuid(),'Outros', true);

create table gastos (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid references empreendimentos(id) on delete cascade,
  valor numeric not null,
  data date,
  quem_pagou_user_id uuid,
  categoria_id uuid references categorias_custo(id),
  subcategoria_texto text,
  comprovante_url text,
  criado_por uuid,
  criado_em timestamptz default now()
);

create table notificacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  titulo text,
  mensagem text,
  lida boolean default false,
  data timestamptz default now()
);
