# FullStack Application: Express & Next.js

## 📝 Overview

This is a full-stack web application built using:

- **Frontend**: [Next.js](https://nextjs.org/)
- **Backend**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Containerized with**: [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

The app allows clean separation between frontend and backend logic, uses PostgreSQL as the main database, and is fully containerized for development ease.

---

## ✅ Prerequisites

Before you begin, make sure you have the following installed:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en/) (optional, for running outside Docker)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/hafidzfurqon/FullStack_Application
cd FullStack_Application
```

### 2. Create Environment Files

follow the example in env.example for frontend
i highly recommend you to pointing your env url backend to this url (http://localhost:3001) 
once you set up with that youre good to go.

for backend in .env.development 

### 3. Run the Project with Docker Compose

docker compose up --build

This will:

Build and run the Next.js frontend on http://localhost:3000

Start the Express backend on http://localhost:3001

Run the PostgreSQL database inside a Docker container

### NOTED
Saya sengaja menyimpan environment variable secara langsung di docker-compose.yml agar memudahkan review dan pengujian pada saat demo. Namun, saya paham bahwa ini tidak ideal untuk produksi. Untuk production, saya akan memindahkan semua secrets ke .env yang tidak di-push ke repository, atau menggunakan secret management seperti Docker secrets, Kubernetes Secrets, atau env manager CI/CD.