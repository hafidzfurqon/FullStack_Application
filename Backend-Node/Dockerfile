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

RUN npx prisma generate

CMD ["npm", "run", "start"]
