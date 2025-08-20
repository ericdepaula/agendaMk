# --- ESTÁGIO 1: O Construtor ---
# Aqui usamos o Node para "compilar" nosso site.
FROM node:18-alpine AS builder

# Define o local de trabalho
WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm install

# Copia todo o código do frontend
COPY . .

# O passo mais importante: Roda o comando de build do Vite!
RUN npm run build

# --- ESTÁGIO 2: O Garçom (Servidor) ---
# Agora, pegamos uma base bem levinha, só para servir os arquivos.
FROM nginx:stable-alpine

# Copia os arquivos que o "Construtor" gerou (da pasta /app/dist)
# para a pasta que o Nginx usa para servir sites.
COPY --from=builder /app/dist /usr/share/nginx/html

# Precisamos de uma configuração extra para o React Router funcionar.
# Vamos criar esse arquivo 'nginx.conf' logo em seguida.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Avisa que o Nginx trabalha na porta 80.
EXPOSE 80

# O comando para iniciar o Nginx.
CMD ["nginx", "-g", "daemon off;"]