# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos construidos
COPY --from=build /app/dist /usr/share/nginx/html

# Puerto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
