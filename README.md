<div align="center">

# 🚀 🦎 Biawak (`create-biawak-app`)

**Production-Ready, High-Performance RESTful API Framework & Initializer**  
*Powered by Bun, Hono v4, Zero-Config SQLite, Production MySQL, Drizzle ORM, Better Auth & Hybrid JWT.*

[![NPM Version](https://img.shields.io/npm/v/create-biawak-app.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/create-biawak-app)
[![Bun](https://img.shields.io/badge/Bun-v1.3+-black?style=for-the-badge&logo=bun)](https://bun.sh)
[![Hono](https://img.shields.io/badge/Hono-v4-orange?style=for-the-badge&logo=hono)](https://hono.dev)
[![SQLite](https://img.shields.io/badge/SQLite-v3-blue?style=for-the-badge&logo=sqlite)](https://www.sqlite.org)
[![MySQL](https://img.shields.io/badge/MySQL-v8.0+-blue?style=for-the-badge&logo=mysql)](https://www.mysql.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-v1.0-green?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Developer Portal](http://localhost:8000/) • [Interactive Manual Book](http://localhost:8000/manual-book) • [Swagger UI](http://localhost:8000/api/doc) • [NPM Package](https://www.npmjs.com/package/create-biawak-app) • [GitHub Repo](https://github.com/robyajo/biawak)

</div>

---

## 🦎 About Biawak

**Biawak** (Indonesian for *Monitor Lizard*) is named after the resilient and agile lizard native to the author's hometown. Built for developers who want the speed of **Bun** and **Hono** without spending hours setting up authentication, database ORMs, or deployment pipelines.

> *"Kadal Kampung, Performa Metropolitan!"*  
> Starts instantly with zero-config SQLite, scales seamlessly to production MySQL!

---

## 🌟 Highlights & Key Features

- **⚡ Instant Project Initializer (`create-biawak-app`)**:
  - Run `bun create biawak-app@latest my-app` or `npx create-biawak-app my-app`.
  - Features an interactive, animated crawling lizard CLI wizard that clones templates, installs dependencies, initializes SQLite, and seeds initial accounts automatically!
- **⚡ Lightning Fast Runtime**: Powered by **Bun v1.3+** and **Hono v4** web framework.
- **🗄️ Zero-Config SQLite → Production MySQL**:
  - Starts out of the box with zero external database setup using native file-based **SQLite** (`sqlite.db`).
  - Switch anytime to **MySQL** by changing `DB_DRIVER=mysql` in your `.env`.
- **🔐 Hybrid Authentication System**:
  - **JWT Bearer Tokens**: Short-lived `accessToken` (15 min) & auto-rotating `refreshToken` (7 days).
  - **Better Auth Integration**: Session cookies and social OAuth support (Google Sign-In).
  - Native Google Credential Manager integration for Android/iOS mobile apps (`/api/auth/google-mobile`).
- **👤 User Management & Profile System**:
  - `/api/auth/me` — Authenticated profile retriever with social media links (`sosial_media` table).
  - `/api/auth/update-profile` — Update display name and download/save avatars locally.
  - `/api/auth/update-password` — Password change endpoint requiring old password verification.
- **📡 Real-time WebSockets (Optional)**: Built-in native Hono + Bun WebSocket support (`WS_ENABLED=true` on `/ws`).
- **🔄 Redis & BullMQ Queue (Optional)**: Background job queue worker with automatic fallback execution when Redis is disabled.
- **🛡️ Production Ready**:
  - Multi-OS port collision protection (cross-platform port detection).
  - Production process configuration with **PM2** (`ecosystem.config.cjs`).
  - Production-ready **Nginx** reverse proxy configuration (`nginx.conf`).
  - One-command release & publish automation script (`npm run release`).

---

## 🛠️ Tech Stack Overview

| Category | Technology | Purpose |
|---|---|---|
| **CLI Initializer** | [`create-biawak-app`](https://www.npmjs.com/package/create-biawak-app) | Interactive project generator CLI |
| **Engine** | [Bun](https://bun.sh) `v1.3+` | Runtime, bundler, and package manager |
| **Framework** | [Hono](https://hono.dev) `v4.x` | Ultra-fast, lightweight web framework |
| **Default DB** | [SQLite](https://www.sqlite.org) | Zero-config file database (`sqlite.db`) via `bun:sqlite` |
| **Production DB** | [MySQL](https://www.mysql.com) `v8.0+` | Switchable relational database via `mysql2` |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team) | Type-safe schema migration and query builder |
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
├── drizzle.config.ts     # Drizzle Kit dual-dialect configuration (SQLite & MySQL)
├── manual-book-dev.md    # Full developer manual documentation
├── bin/
│   ├── create-biawak-app.js # CLI project initializer script with lizard animation
│   ├── release.js           # Automated versioning, git commit/tag, & NPM publish script
│   └── check-update.js      # CLI update checker utility
└── src/
    ├── index.ts          # Server entry point & static asset serving
    ├── auth.ts           # Better Auth instance & social OAuth provider setup
    ├── config/
    │   └── drizzle.ts    # Zod environment variable validation & config export
    ├── db/
    │   ├── index.ts      # Drizzle database client (Dynamic SQLite & MySQL loader)
    │   ├── relations.ts  # Drizzle v1.0 relational mappings (defineRelations)
    │   ├── seed.ts       # Seeding script for Admin, User, & Social Media profiles
    │   ├── reset.ts      # Database reset script for SQLite & MySQL
    │   └── schema/
    │       ├── index.ts          # Dynamic active schema re-exporter
    │       ├── sqlite/           # SQLite table definitions (user, sosial-media)
    │       └── mysql/            # MySQL table definitions (user, sosial-media)
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
Copy `.env.example` to `.env`:

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
# Push schema directly to active database (SQLite or MySQL)
bun run db:push

# Reset database schema and seed default Admin, User, & Social Media profiles
bun run db:reset -- --seed
```

### 4. Start Development Server
```bash
bun run dev
```

Visit the Developer Portal in your browser:
- **Dashboard**: [http://localhost:8000/](http://localhost:8000/)
- **Interactive Manual Book**: [http://localhost:8000/manual-book](http://localhost:8000/manual-book)
- **Swagger UI**: [http://localhost:8000/api/doc](http://localhost:8000/api/doc)

---

## 🛠️ Developer CLI & Testing Commands

| Command | Purpose |
|---|---|
| `bun test` | Runs automated integration test suite (`tests/api.test.ts`) |
| `bun run make:route <name>` | Scaffolds a new Hono OpenAPI route file in `src/routes/` |
| `bun run make:middleware <name>` | Scaffolds a new middleware file in `src/middleware/` |
| `bun run make:schema <name>` | Scaffolds dual Drizzle schemas for both SQLite & MySQL |
| `bun run db:push` | Pushes Drizzle ORM schema to active database (SQLite / MySQL) |
| `bun run db:seed` | Seeds default Admin, User & Social Media accounts |
| `bun run db:reset -- --seed` | Resets active database & re-seeds data |
| `bun run build` | Compiles TypeScript & bundles static assets to `dist/` |
| `bun run release` | Automated versioning, git commit/tag, & NPM publish wizard |

---

## 🔑 Default Seeded Accounts

| Account | Email | Password | Role | Social Media Profiles |
|---|---|---|---|---|
| 👑 **Admin** | `admin@gmail.com` | `Password123` | `ADMIN` | GitHub, LinkedIn, Instagram |
| 👤 **User** | `user@gmail.com` | `Password123` | `USER` | Instagram, TikTok |

---

## 📦 Release & Publishing Workflow

To automate versioning, Git commit/tag, and NPM publishing:

```bash
bun run release
# or
npm run release
```

- **Quick Git Update**: Choose `y` for fast Git commit and push without version bumping.
- **Full Release**: Auto-detects npm version, increments patch version, updates `package.json`, tags release on Git, and publishes to NPM with 2FA OTP support.

---

## 🚀 Production Deployment Guide

```bash
# 1. Build TypeScript and copy HTML assets
bun run build

# 2. Start PM2 Process Manager
pm2 start ecosystem.config.cjs

# 3. Reload Nginx configuration
sudo nginx -t && sudo systemctl reload nginx
```

---

## 👨‍💻 Author & Developer Information

- **Developer / Author**: **Roby** ([@robyajo](https://github.com/robyajo))
- **NPM Package**: [https://www.npmjs.com/package/create-biawak-app](https://www.npmjs.com/package/create-biawak-app)
- **GitHub Repository**: [https://github.com/robyajo/biawak](https://github.com/robyajo/biawak)
- **License**: MIT
