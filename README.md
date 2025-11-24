Loteadora MVP
=================

Stack: Next.js 14 (App Router) + TypeScript + Tailwind + Supabase (Auth/Postgres/Storage/Realtime)

Rápido (5 linhas) para rodar localmente e deploy:
1. Copie `.env.example` para `.env.local` e preencha as variáveis do Supabase e `NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL`.
2. Importe `supabase/migrations/001_init.sql` no editor SQL do Supabase e crie os buckets `comprovantes` e `documentos` no Storage.
3. `npm install`
4. `npm run dev`
5. Deploy: `vercel` ou conectar repositório ao Vercel e configurar as variáveis de ambiente.

Observações:
- O app já implementa os módulos essenciais: autenticação via Supabase (use painel Supabase Auth para criar usuários), lista de empreendimentos, detalhe com módulo financeiro, uploads para Storage, assinatura digital básica e mapa com React-Leaflet.
- Para completar fluxos avançados (assinaturas compositing PDF histórico, WhatsApp via Evolution API) configure um webhook em `NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL`.

Recebimento seguro de webhooks (HMAC):
- Rota para receber webhooks externos: `POST /api/webhook/receive` — a app verifica `x-signature` usando `WHATSAPP_WEBHOOK_SECRET` e registra logs na tabela `webhook_logs`.
- Para enviar webhooks SAÍDA: o `NotificationsProvider` chama `/api/webhook` com `Authorization: Bearer <access_token>`; a rota valida token via Supabase e reencaminha ao `NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL` assinando com `WHATSAPP_WEBHOOK_SECRET`.

Testes locais — gerar assinatura HMAC:
- Um utilitário de teste está disponível em `scripts/sign.js`.
	- Gerar assinatura (PowerShell):
```powershell
node scripts/sign.js '{ "title": "Teste", "message": "OK" }' mysecret
# imprime o HMAC em hex
```
	- Exemplo de envio assinado (PowerShell):
```powershell
$body = '{"title":"Teste","message":"OK"}'
$sig = '<hex-hmac>'
Invoke-RestMethod -Uri http://localhost:3000/api/webhook/receive -Method POST -Body $body -ContentType 'application/json' -Headers @{ 'x-signature' = $sig }
```

Auditoria de forwarding:
- Quando o app reencaminha notificações (via `/api/webhook`) ele agora grava o status e parte do corpo da resposta na tabela `webhook_logs` (campo `headers` contém `response_status` e `response_body` truncado) para facilitar troubleshooting.
- Para enviar webhooks SAÍDA: o `NotificationsProvider` chama `/api/webhook` com `Authorization: Bearer <access_token>`; a rota valida token via Supabase e reencaminha ao `NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL` assinando com `WHATSAPP_WEBHOOK_SECRET`.
