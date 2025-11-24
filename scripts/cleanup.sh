#!/usr/bin/env bash
set -e
echo "Removendo node_modules, .next e .env.local se existirem"
[ -d node_modules ] && rm -rf node_modules && echo "node_modules removido" || echo "node_modules não encontrado"
[ -d .next ] && rm -rf .next && echo ".next removido" || echo ".next não encontrado"
[ -f .env.local ] && rm -f .env.local && echo ".env.local removido" || echo ".env.local não encontrado"
echo "Pronto. Para remover do git: git add .gitignore && git rm --cached node_modules .next .env.local && git commit -m 'clean: remove local artifacts'"
