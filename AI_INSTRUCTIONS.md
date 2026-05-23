# Vector Terminal — AI & Developer Start Guide

This file provides precise, machine-readable instructions for any AI coding assistant or developer to verify, migrate, seed, and spin up the **Vector Algo Trading Platform** local server.

---

## 📂 Project Root Directory
All commands and installations MUST be run in the Next.js root workspace:
```
c:\Users\VISHN\OneDrive\Desktop\files\vector-chunk-2\vector
```
**CRITICAL**: Do NOT execute commands in `c:\Users\VISHN\OneDrive\Desktop\files` or `vector-chunk-1`. The active, fully completed codebase resides in `vector-chunk-2/vector`.

---

## 🛠️ Step-by-Step Execution Sequence

Any AI agent or developer can run the following sequence in their shell to set up and run the terminal:

### 1. Install Dependencies
Installs Next.js, Framer Motion, Prisma Client, NextAuth, Zustand, and TypeScript modules:
```bash
# Navigate to project directory (if not already there)
cd "c:\Users\VISHN\OneDrive\Desktop\files\vector-chunk-2\vector"

# Run install
npm install
```

### 2. Synchronize SQLite Database Schema
Compiles the Prisma schema and creates/syncs the local SQLite database file `prisma/dev.db`:
```bash
npm run db:push
```
*(Alternative direct CLI: `npx prisma db push`)*

### 3. Seed Mock Datasets
Upserts reference data (16 instruments, watches list, sample strategies, notification drawer, and demo account):
```bash
npm run db:seed
```
*(Alternative direct CLI: `npx tsx prisma/seed.ts`)*

### 4. Start the Local Server
Spins up the Next.js local development server:
```bash
npm run dev
```
The server will boot up at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Seeding Credentials Reference
Once started, you can bypass manual signups by autofilling or typing:
* **Demo Email**: `demo@vector.io`
* **Demo Password**: `demo123`
* **Demo Balance**: `$100,000` paper equity pre-seeded.

---

## 🔍 Validation Commands

To check project health, the following validation commands can be executed:

* **TypeScript Typechecks**:
  ```bash
  npm run typecheck
  ```
* **ESLint Checking**:
  ```bash
  npm run lint
  ```
* **Production Build bundle**:
  ```bash
  npm run build
  ```
