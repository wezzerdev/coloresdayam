# Stage 1: Build Frontend React + Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar todas las dependencias para compilar
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar la aplicación estática para producción (genera dist/)
RUN npm run build

# Stage 2: Runtime del Servidor Express
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data


COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el build compilado y el servidor
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Crear carpeta persistente para SQLite
RUN mkdir -p /app/data

# Volumen persistente para almacenar la base de datos de Dokploy
VOLUME ["/app/data"]

EXPOSE 3000

CMD ["node", "server/server.js"]
