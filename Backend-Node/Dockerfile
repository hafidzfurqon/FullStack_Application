# Dockerfile (Backend)
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 5000
CMD ["node", "src/index.js"] # Ubah jika entry point-mu berbeda
