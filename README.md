<div align="center">

# 🚀 Biawak (`create-biawak-app`)

**Production-Ready, High-Performance RESTful API & Real-Time Boilerplate**  
*Powered by Bun, Hono v4, Zero-Config SQLite, MySQL, Drizzle ORM, Better Auth & Hybrid JWT.*

[![Bun](https://img.shields.io/badge/Bun-v1.3+-black?style=for-the-badge&logo=bun)](https://bun.sh)
[![Hono](https://img.shields.io/badge/Hono-v4-orange?style=for-the-badge&logo=hono)](https://hono.dev)
[![MySQL](https://img.shields.io/badge/MySQL-v8.0+-blue?style=for-the-badge&logo=mysql)](https://www.mysql.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-v1.0-green?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Developer Portal](http://localhost:8000/) • [Interactive Manual Book](http://localhost:8000/manual-book) • [Swagger UI](http://localhost:8000/api/doc) • [GitHub Repo](https://github.com/robyajo/biawak)

</div>

---

## 🌟 Highlights & Key Features

- **⚡ Lightning Fast Runtime**: Built on top of **Bun v1.3+** and **Hono v4** web framework.
- **🐬 Type-Safe MySQL ORM**: **Drizzle ORM** with relational schema mapping (`defineRelations`).
- **🔐 Hybrid Authentication**:
  - **JWT Bearer Tokens** with short-lived `accessToken` (15 min) & auto-rotating `refreshToken` (7 days).
  - **Better Auth** session cookies and social OAuth support (Google Sign-In).
  - Native Google Credential Manager integration for Android/iOS apps (`/api/auth/google-mobile`).
- **👤 User Management & Profile System**:
  - `/api/auth/me` — Authenticated profile retriever with social media links (`sosial_media` table).
  - `/api/auth/update-profile` — Update display name and download/save avatars to local storage.
  - `/api/auth/update-password` — Password change endpoint requiring old password verification.
- **📡 Real-time WebSockets (Optional)**: Built-in native Hono + Bun WebSocket support (`WS_ENABLED=true`).
- **🔄 Redis & BullMQ Queue (Optional)**: Optional background job worker with safe fallback execution when Redis is disabled.
- **🛡️ Production Ready**:
  - Multi-OS port collision protection (suggests `Stop-Process` on Windows, `kill-port`, etc.).
  - Environment guards (`APP_ENV=development` vs `production`).
  - PM2 configuration with native Bun interpreter (`ecosystem.config.cjs`).
  - Production-ready **Nginx** proxy configuration (`nginx.conf`).

---

## 🛠️ Tech Stack Overview

| Category | Technology | Purpose |
|---|---|---|
| **Engine** | [Bun](https://bun.sh) `v1.3+` | Runtime, bundler, and package manager |
| **Framework** | [Hono](https://hono.dev) `v4.x` | Ultra-fast, lightweight web framework |
| **Database** | [MySQL](https://www.mysql.com) `v8.0+` | Relational database via `mysql2` |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team) | Schema migration and query builder |
| **Auth** | [Better Auth](https://www.better-auth.com) & JWT | Cookie sessions and Bearer token rotation |
| **Realtime** | [Bun WebSocket](https://hono.dev/helpers/websocket) | Native WebSockets on `/ws` path |
| **Background Queue** | [BullMQ](https://docs.bullmq.io) & [Redis](https://redis.io) | Asynchronous task processing |
| **API Docs** | [Swagger UI](https://swagger.io) & OpenAPI 3.0 | Interactive API documentation |

---

## 📁 Directory Architecture

```
biawak/
├── .env                  # Active environment variables
├── .env.example          # Environment template
├── docker-compose.yml    # Docker services (MySQL container on 3306 & Redis container on 6380)
├── ecosystem.config.cjs  # PM2 production configuration with Bun interpreter
├── nginx.conf            # Production Nginx reverse proxy configuration
├── drizzle.config.ts     # Drizzle Kit configuration (MySQL dialect)
├── manual-book-dev.md    # Full developer manual documentation
└── src/
    ├── index.ts          # Server entry point & static asset serving
    ├── auth.ts           # Better Auth instance & social OAuth provider setup
    ├── config/
    │   └── drizzle.ts    # Zod environment variable validation & config export
    ├── db/
    │   ├── index.ts      # Drizzle database client & combined schema export
    │   ├── relations.ts  # Drizzle v1.0 relational mappings (defineRelations)
    │   ├── seed.ts       # Seeding script for Admin, User, & Social Media profiles
    │   ├── reset.ts      # MySQL database reset & migration script
    │   └── schema/
    │       ├── user.ts         # User, session, account, verification, refreshToken tables
    │       └── sosial-media.ts # Social media links table (sosial_media)
    ├── html/
    │   ├── index.html        # Glassmorphic developer landing portal
    │   └── manual-book.html  # Interactive HTML Markdown reader template
    ├── lib/
    │   ├── crypto.ts     # Bun native password hashing & credential sync
    │   ├── avatar.ts     # Local avatar downloader utility
    │   ├── logger.ts     # Custom file logger writing to src/storage/log/log.log
    │   ├── port.ts       # Next.js-style cross-platform port collision detection
    │   ├── queue.ts      # Optional BullMQ Redis task queue & fallback handler
    │   ├── server.ts     # Graceful server shutdown & storage directory setup
    │   └── websocket.ts  # Optional Hono + Bun WebSocket server
    ├── middleware/
    │   ├── auth.ts          # Hybrid session & JWT Bearer authentication middleware
    │   ├── ensureAdmin.ts   # Admin role guard middleware
    │   └── errorHandler.ts  # Global exception handler
    └── routes/
        ├── index.ts      # Main API router (/api/health, /api/doc, /api/openapi, etc.)
        └── auth.ts       # Auth endpoints (/register, /login, /refresh, /me, /update-profile, /update-password)
```

---

## ⚡ Quick Start & Installation

### Option A: Create New Project via Initializer (Recommended)

```bash
# Using Bun (Recommended)
bun create biawak-app@latest my-app

# Or using NPX
npx create-biawak-app@latest my-app
```

The installer wizard will automatically set up your project directory, install dependencies, initialize a zero-config **SQLite** database (`sqlite.db`), and seed initial Admin & User accounts!

---

### Option B: Clone & Manual Setup

```bash
git clone https://github.com/robyajo/biawak.git
cd biawak
bun install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your MySQL database credentials:

```bash
cp .env.example .env
```

```env
PORT=8000
BASE_URL=http://localhost:8000
APP_NAME="Biawak"
APP_ENV=development

# Database Configuration (sqlite | mysql)
# Default is 'sqlite' so the app works out of the box without any DB server installation!
DB_DRIVER=sqlite
DB_FILE_NAME=sqlite.db

# MySQL Connection (Set DB_DRIVER=mysql to use MySQL)
DB_USER=root
DB_PASSWORD=123
DB_NAME=biawak
DB_HOST=127.0.0.1
DB_PORT=3306
```

### 3. Setup Database Schema & Seed Data
```bash
# Push schema directly to MySQL database
npm run db:push

# Reset database schema and seed default Admin, User, & Social Media profiles
npm run db:reset -- --seed
```

### 4. Start Development Server
```bash
npm run dev
```

Visit the Developer Portal in your browser:
- **Dashboard**: [http://localhost:8000/](http://localhost:8000/)
- **Interactive Manual Book**: [http://localhost:8000/manual-book](http://localhost:8000/manual-book)
- **Swagger UI**: [http://localhost:8000/api/doc](http://localhost:8000/api/doc)

---

## 🔑 Default Seeded Accounts

| Account | Email | Password | Role | Social Media Profiles |
|---|---|---|---|---|
| 👑 **Admin** | `admin@gmail.com` | `Password123` | `ADMIN` | GitHub, LinkedIn, Instagram |
| 👤 **User** | `user@gmail.com` | `Password123` | `USER` | Instagram, TikTok |

---

## 🚀 Production Deployment Guide

```bash
# 1. Build TypeScript and copy HTML assets
npm run build

# 2. Start PM2 Process Manager
pm2 start ecosystem.config.cjs

# 3. Reload Nginx configuration
sudo nginx -t && sudo systemctl reload nginx
```

---

## 👨‍💻 Author & Developer Information

- **Developer / Author**: **Roby** ([@robyajo](https://github.com/robyajo))
- **GitHub Repository**: [https://github.com/robyajo/biawak](https://github.com/robyajo/biawak)
- **License**: MIT
