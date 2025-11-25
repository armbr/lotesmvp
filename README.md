# Loteadora MVP

Aplicação completa para gestão de loteamentos com autenticação, módulos financeiros, mapas interativos, assinatura digital e notificações em tempo real.

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Mapas**: React-Leaflet + Leaflet
- **PDF**: pdf-lib
- **Gráficos**: Chart.js + react-chartjs-2
- **Notificações**: React Hot Toast + Supabase Realtime
- **Testes**: Jest + React Testing Library
- **DevOps**: Docker, GitHub Actions CI/CD

## 📋 Pré-requisitos

- **Docker Desktop** (recomendado) OU **Node.js 20+** + **npm**
- **Conta Supabase** (gratuita): https://supabase.com
- **Git** para controle de versão

## ⚙️ Configuração Inicial

### 1. Clone o repositório

```bash
git clone https://github.com/armbr/lotesmvp.git
cd lotesmvp
```

### 2. Configure variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Opcional: webhook para notificações externas (WhatsApp, etc)
NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL=https://seu-webhook.com/endpoint
WHATSAPP_WEBHOOK_SECRET=seu-secret-hmac
```

**Onde encontrar as credenciais Supabase:**
1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie `URL`, `anon public` e `service_role` (⚠️ mantenha `service_role` secreta!)

### 3. Configure o banco de dados Supabase

Execute as migrations SQL no editor SQL do Supabase:

```bash
# Na interface do Supabase:
# 1. Vá em SQL Editor
# 2. Cole e execute cada arquivo na ordem:
```

1. `supabase/migrations/001_init.sql` - Tabelas principais
2. `supabase/migrations/002_rls.sql` - Políticas RLS (segurança)
3. `supabase/migrations/003_webhook_logs.sql` - Logs de webhooks

### 4. Configure Storage Buckets

No painel Supabase → **Storage**, crie os buckets:

- `comprovantes` (público)
- `documentos` (privado)
- `fotos` (público)

## 🐳 Desenvolvimento com Docker (Recomendado)

### Primeira execução

```bash
# Build da imagem
docker compose build

# Subir containers
docker compose up -d

# Ver logs
docker compose logs -f app
```

A aplicação estará disponível em: **http://localhost:3000**

### Comandos úteis Docker

```bash
# Parar containers
docker compose down

# Rebuild completo
docker compose build --no-cache

# Rodar testes
docker compose run --rm app npm test

# Executar migrations (se necessário)
docker compose run --rm app npm run migrate

# Limpar volumes
docker compose down -v
```

## 💻 Desenvolvimento Local (sem Docker)

### Instalar dependências

```bash
npm install --legacy-peer-deps
```

### Rodar em desenvolvimento

```bash
npm run dev
```

### Build de produção

```bash
npm run build
npm start
```

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Modo watch (re-executa ao salvar)
npm run test:watch

# Relatório de cobertura
npm run test:coverage
```

**Via Docker:**
```bash
docker compose run --rm app npm test
```

## 📦 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Inicia servidor de produção |
| `npm run lint` | Executa ESLint |
| `npm test` | Executa testes com Jest |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Gera relatório de cobertura |

## 🔐 Autenticação e Segurança

### Criar usuários

Use o painel Supabase Auth para criar usuários:
1. Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User**
3. Preencha email/senha

### Roles de usuário

Roles são armazenadas em `user_metadata.role`:
- `admin` - Acesso total
- `socio` - Gerencia empreendimentos e finanças
- `cliente` - Visualização apenas

### RLS (Row Level Security)

Todas as tabelas têm políticas RLS configuradas em `002_rls.sql`. Exemplo:
- Clientes veem apenas seus próprios lotes
- Sócios veem todos os dados de seus empreendimentos
- Admins têm acesso completo

## 🔔 Webhooks e Notificações

### Receber webhooks externos

Endpoint: `POST /api/webhook/receive`

Headers obrigatórios:
```
Content-Type: application/json
x-signature: <HMAC-SHA256-hex>
```

O HMAC é calculado usando `WHATSAPP_WEBHOOK_SECRET`.

**Gerar assinatura HMAC (teste):**

```bash
node scripts/sign.js '{"title":"Teste","message":"OK"}' seu-secret
```

**Exemplo de chamada:**

```powershell
$body = '{"title":"Teste","message":"OK"}'
$sig = "abc123..." # gerado pelo script acima
Invoke-RestMethod -Uri http://localhost:3000/api/webhook/receive -Method POST -Body $body -ContentType 'application/json' -Headers @{ 'x-signature' = $sig }
```

### Enviar webhooks (notificações)

O sistema envia webhooks automaticamente quando:
- Novos gastos são registrados
- Cronograma de obras atualizado
- Documentos adicionados
- Processos de licença modificados

Configuração: `NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL`

## 📊 Módulos Implementados

- ✅ Autenticação (Supabase Auth)
- ✅ Gestão de Empreendimentos
- ✅ Módulo Financeiro (gastos, sócios, categorias)
- ✅ Mapas Interativos (React-Leaflet + GeoJSON)
- ✅ Upload de Documentos (Supabase Storage)
- ✅ Assinatura Digital (pdf-lib)
- ✅ Notificações em Tempo Real (Supabase Realtime)
- ✅ Exportação Excel (exceljs)
- ✅ Gráficos e Dashboards (Chart.js)
- ✅ PWA (Service Worker + Manifest)
- ✅ Webhooks HMAC-signed

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub ao Vercel
2. Configure variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - (Opcionais) Webhook vars
3. Deploy automático em cada push!

### Docker em servidor

```bash
# Build
docker compose build

# Run com env file
docker compose --env-file .env.production up -d
```

## 🤝 CI/CD

O projeto usa GitHub Actions para:
- ✅ Lint (ESLint)
- ✅ Testes (Jest)
- ✅ Build de produção

Workflow: `.github/workflows/ci.yml`

## 📝 Estrutura do Projeto

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── empreendimento/    # Páginas de detalhes
│   ├── login/             # Autenticação
│   └── page.tsx           # Homepage
├── components/            # Componentes React
├── lib/                   # Utilitários e clients
├── supabase/migrations/   # SQL migrations
├── public/                # Assets estáticos + PWA
├── scripts/               # Scripts utilitários
└── __tests__/             # Testes unitários
```

## 🐛 Troubleshooting

### Erro: "supabaseUrl is required"
- Verifique se `.env.local` existe e tem as variáveis corretas
- Reinicie o servidor de desenvolvimento

### Testes falhando
- Certifique-se que todas as dependências estão instaladas
- Execute `npm install --legacy-peer-deps`

### Docker não inicia
- Verifique se Docker Desktop está rodando
- Execute `docker compose down -v` e tente novamente

### Build falha no CI
- Verifique os logs em GitHub Actions
- Certifique-se que todas as migrations foram executadas no Supabase

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Contato

Para dúvidas ou suporte, abra uma issue no repositório.
