# tools-adigicube

Central tools portal untuk adigicube.com ecosystem. Built with React + Express + PostgreSQL + Docker.

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + TailwindCSS |
| Backend | Express.js + TypeScript + Drizzle ORM |
| Database | PostgreSQL 16 |
| Deployment | Docker + GitHub Actions + VPS |

## 🚀 Quick Start (Local)

### Prerequisites
- Docker Desktop
- Node.js 20+ (for local dev without Docker)

### Start with Docker (recommended)

```bash
cd tools-adigicube

# Copy env file
cp backend/.env.example backend/.env

# Build & start all services
docker-compose up -d --build

# Run migrations + seed
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

Then open http://localhost:3000

**Default admin login:**
- Email: `admin@adigicube.com`
- Password: `admin123!`

### Local dev without Docker

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL to your local PostgreSQL
npm install
npm run migrate
npm run seed
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
tools-adigicube/
├── frontend/          # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/     # Login, Dashboard, tools/DataScraper
│   │   ├── components/ # Layout, ToolCard, scraper/...
│   │   ├── store/     # Zustand auth store
│   │   └── lib/       # Axios instance
│   └── Dockerfile
│
├── backend/           # Express + TypeScript + Drizzle ORM
│   ├── src/
│   │   ├── routes/    # auth, tools/index, tools/execute, tools/history
│   │   ├── services/  # tools/scraper (csv, api, web)
│   │   ├── db/        # schema, migrate, connection
│   │   └── middleware/ # auth
│   └── Dockerfile
│
├── docker-compose.yml       # Local dev
├── docker-compose.prod.yml  # Production (pull from Docker Hub)
├── nginx.conf               # Reverse proxy config
└── .github/workflows/       # CI/CD pipelines
```

## 🐳 Production Deployment

### GitHub Secrets yang diperlukan

| Secret | Value |
|--------|-------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub access token |
| `DOCKERHUB_REPO` | `username/tools-adigicube` (tanpa -frontend/-backend) |

### Deploy ke VPS (Wisnu)

```bash
# SSH ke VPS
ssh root@VPS_IP

# Clone repo
git clone https://github.com/woosekie/tools-adigicube.git
cd tools-adigicube

# Create .env for production
cat > .env << EOF
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
SESSION_SECRET=STRONG_RANDOM_SECRET_HERE
DOCKERHUB_REPO=username/tools-adigicube
EOF

# Pull latest images & start
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Run migrations + seed (first time only)
docker-compose -f docker-compose.prod.yml exec backend npm run migrate
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

## 🔧 Available Tools

| Tool | Status | Description |
|------|--------|-------------|
| Data Scraper | ✅ Active | Import dari CSV, API, web scraping |
| AI Content Generator | 🔜 Coming Soon | Generate content dengan AI |
| Vending Client Finder | 🔜 Coming Soon | Cari potential clients vending |

## 📡 API Endpoints

```
GET    /api/health                              # Health check
POST   /api/auth/login                          # Login
POST   /api/auth/logout                         # Logout
GET    /api/auth/me                             # Get current user

GET    /api/tools                               # List tools
GET    /api/tools/:slug                         # Get tool detail
POST   /api/tools/:slug/execute                 # Execute tool
GET    /api/tools/:slug/history                 # Execution history
GET    /api/tools/:slug/history/:execId         # Single execution result
```

## 🧩 Adding a New Tool

1. Create service: `backend/src/services/tools/[new-tool]/index.ts`
2. Add handler in `backend/src/routes/tools/execute.ts`
3. Create frontend page: `frontend/src/pages/tools/NewTool.tsx`
4. Add route in `frontend/src/App.tsx`
5. Add nav item in `frontend/src/components/Layout.tsx`
6. Seed tool in DB: add entry to `backend/src/seed.ts`
