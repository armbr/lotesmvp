DC=docker compose
SERVICE=app

.PHONY: build up upd down logs logs-app ps exec restart rebuild sign

build:
	$(DC) build --no-cache

up:
	$(DC) up

upd:
	$(DC) up -d

down:
	$(DC) down

logs:
	$(DC) logs -f

logs-app:
	$(DC) logs -f $(SERVICE)

ps:
	$(DC) ps

exec:
	$(DC) exec $(SERVICE) /bin/sh

restart:
	$(DC) restart $(SERVICE)

rebuild: build upd

# sign: use variables BODY and SECRET, e.g.
# make sign BODY='{"title":"Teste"}' SECRET=mysecret
sign:
	node scripts/sign.js '$(BODY)' '$(SECRET)'
