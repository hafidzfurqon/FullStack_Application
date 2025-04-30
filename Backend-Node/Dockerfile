FROM node:20-slim

# Install dependensi yang dibutuhkan Prisma engine
RUN apt-get update && apt-get install -y \
  openssl \
  libssl-dev \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Buat folder upload jika dibutuhkan
RUN mkdir -p src/product/uploads

# Jalankan migrasi dan seeder sebelum start
CMD ["sh", "-c", "npx prisma db push && npm run seed && npm run start"]
