### Multi-stage Dockerfile (mais resiliente para dependências nativas)
### Stage 1: builder (instala dependências nativas e node modules)
FROM node:20-slim AS builder
WORKDIR /app

# Instala pacotes necessários para compilar dependências nativas (sharp, node-gyp, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
		python3 \
		build-essential \
		git \
		pkg-config \
		libcairo2-dev \
		libpango1.0-dev \
		libjpeg-dev \
		libgif-dev \
		librsvg2-dev \
		libpng-dev \
		zlib1g-dev \
	&& rm -rf /var/lib/apt/lists/*

# Copia package files e instala dependências
COPY package*.json ./
# Use npm install aqui (mais tolerante quando não há package-lock.json)
# Adiciona --legacy-peer-deps para evitar falhas com peerDependencies em alguns pacotes
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Copia o restante do código para o builder (para caso haja build steps)
COPY . .
# Tenta rodar build caso exista, não depende de 'jq' (mais simples)
RUN npm run build || true

### Stage 2: runtime
FROM node:20-slim AS runner
WORKDIR /app

# Cria usuário não-root opcional (melhora segurança)
RUN groupadd -r app && useradd -r -g app app || true

# Copia node_modules e aplicação do builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Ajusta permissões e usa usuário não-root
RUN chown -R app:app /app || true
USER app

EXPOSE 3000

# Rodar em modo dev por padrão (compose já passa command quando necessário)
CMD ["npm", "run", "dev"]