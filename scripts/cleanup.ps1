Write-Host "Removendo pastas grandes: node_modules e .next (se existirem)"
if (Test-Path -Path .\node_modules) {
  Remove-Item -Recurse -Force .\node_modules
  Write-Host "node_modules removido"
} else { Write-Host "node_modules não encontrado" }

if (Test-Path -Path .\.next) {
  Remove-Item -Recurse -Force .\.next
  Write-Host ".next removido"
} else { Write-Host ".next não encontrado" }

if (Test-Path -Path .\.env.local) {
  Remove-Item -Force .\.env.local
  Write-Host ".env.local removido"
} else { Write-Host ".env.local não encontrado" }

Write-Host "Pronto. Se você usa Git, execute: git add .gitignore && git rm --cached node_modules .next .env.local && git commit -m 'clean: remove local artifacts'"
