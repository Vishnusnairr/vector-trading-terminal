# Vector · AI Algorithmic Trading Terminal

**Vector** is a production-grade, institutional-quality algorithmic trading, paper execution, and strategy-backtesting platform. Built on **Next.js 15**, **Prisma**, **Zustand**, and **SQLite**, it features an automated, server-enforced **Ultra Safe Mode**, an interactive no-code **Strategy Builder**, a historical **Backtester**, and an **AI Trading Copilot**.

---

## ⚡ Key Platform Features

Vector is equipped with a comprehensive suite of institutional trading capabilities:

### 1. Multi-Asset Live Market Data Feed
* **Yahoo Finance API Gateway**: Direct REST integration inside [`src/app/api/market/nse/route.ts`](file:///c:/Users/VISHN/OneDrive/Desktop/files/vector-chunk-2/vector/src/app/api/market/nse/route.ts) maps and streams live feeds for **all 20 preseeded instruments** (US stocks like `AAPL` & `NVDA`, Cryptocurrencies like `BTCUSD`, Commodities like `GOLD` futures, Forex pairs, and Indian Stocks like `RELIANCE` and `TCS`).
* **Active Symbol Throttling**: A smart client-side scheduling engine fetches real-time prices for active/watchlist symbols while background assets gracefully utilize the volatility simulator, preventing rate limits and cold starts.
* **Price Feed Switcher**: Easily swap pricing between our high-fidelity, randomized-volatility drift simulator and live Yahoo Finance streams inside the bottom-right terminal settings panel.

### 2. Premium SVG Candlestick Graphing & High-Contrast Styling
* **Legibility Redefined**: Native colors aligned with WCAG AA accessibility standards—featuring a clean, Slate-based typography system (`#f8fafc` primary white, `#cbd5e1` secondary description text, `#94a3b8` muted tick text) ensuring maximum contrast over the deep dark background.
* **Glassmorphic HUD Overlay**: Custom responsive chart with a floating dark overlay panel (`bg-bg-panel/90 px-3 py-1.5 rounded-lg border border-border/80 shadow-lg backdrop-blur-md`). This isolates candles from stats so you always read Open, High, Low, Close, and Volume clearly.
* **Vibrant Indicators**: Fully opaque, thick moving average paths (Neon Golden-Amber `SMA(20)` and Radiant Violet `EMA(9)`) standing out sharply.

### 3. Server-Enforced Ultra Safe Mode
* ** Glowing Animated Toggle**: Client and server-side state checks blocking risky entry executions.
* **Capital Sizing Risk Gate**: Rejects orders that risk more than 1% of total equity based on protective Stop Losses.
* **Volatility Filter**: Blocks access to high-volatility assets (e.g. Bitcoin, Solana, Tesla) under Ultra Safe Mode.
* **Trading Cooldown**: Rejects executions if consecutive trade losses reach your defined threshold (default is 3).

### 4. Edge-Ready NextAuth v5 Authentication
* **Edge Routing Guards**: Robust middleware (`src/middleware.ts`) protecting dashboard routes.
* **Demo Autofill Bypass**: Fast-track button on the credentials login screen allows instant access using seeded database accounts.

### 5. No-Code Strategy Builder & Simulated Backtester
* **Strategy Builder**: Interactive drag-and-drop conditions block panel (e.g., RSI crossovers, moving average breaches) that serialize entry/exit signals into dynamic JSON structures.
* **Historical Replayer**: Simulates trades over customizable historical ranges, generating equity charts, tracking total returns, drawdowns, win-rates, and Sharpe ratios.

### 6. Context-Aware AI Trading Copilot
* **Streaming Assistant**: Interactive terminal companion responding with real-time portfolio data, equity mark-to-markets, active risk guidelines, and strategy audits.

---

## 🛠️ Architecture & Tech Stack

* **Core**: Next.js 15 (App Router, Server Actions, API routes, edge middleware)
* **State Management**: Zustand (high-frequency ticking price state)
* **Styling**: Tailwind CSS & Vanilla Custom CSS Tokens
* **Database & ORM**: Prisma Client + local SQLite `dev.db` database
* **Auth**: NextAuth v5 (Edge-compatible Credentials provider)

---

## 🚀 Quick Start & Local Testing Guide

Get the trading terminal running on your computer in four simple steps:

### 1. Initialize Environment Variables
Create a `.env` file in the root directory and populate it with the baseline variables:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-32-byte-secret-key-use-openssl-rand"
NEXTAUTH_URL="http://localhost:3000"
```
*(You can copy from `.env.example` directly!)*

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate Client & Seed SQLite Database
Generate the database client, push the schema models (16 tables including accounts, trades, positions, watchlists, risk), and seed the demo dataset:
```bash
# Generate database types
npx prisma generate

# Create local SQLite dev.db
npm run db:push

# Load tradeable instruments, strategies, risk settings, and demo trader
npm run db:seed
```

### 4. Boot Up the Server!
Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
* Click **Launch Terminal** or **Sign In**.
* Click the **Autofill Demo Trader** bypass button to automatically enter the seeded user credentials:
  * **Email**: `demo@vector.io`
  * **Password**: `demo123`
* Start trading, configure strategies, and toggle live price feeds!

---

## 📊 Complete Command Catalog

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `next dev` | Launches dev server on port 3000 |
| `npm run build` | `next build` | Compiles optimized, typecheck-clean production bundle |
| `npm run start` | `next start` | Launches compiled production server |
| `npm run typecheck` | `tsc --noEmit` | Validates strict TypeScript type safety |
| `npm run db:push` | `prisma db push` | Pushes Prisma model schema directly to SQLite |
| `npm run db:seed` | `ts-node prisma/seed.ts` | Populates instruments, demo users, watchlists, and strategies |
| `npm run db:studio` | `prisma studio` | Opens a graphical visual UI browser for `dev.db` |

---

## 📈 Going Real-Time (Live Trading Integration)

For guidelines on replacing paper trading fills with live exchange orders (Zerodha Kite Connect in India, Alpaca in the US, or Binance WebSockets for Crypto), read the dedicated production integration roadmap: 

👉 [**LIVE_DATA_INTEGRATION.md**](file:///c:/Users/VISHN/OneDrive/Desktop/files/vector-chunk-2/vector/LIVE_DATA_INTEGRATION.md)

---

## 👨‍💻 Developer & Portfolio

This institutional algorithmic trading terminal was developed as a high-performance web software showcase.

* **Developer Portfolio**: [Explore My Work & Showcase](https://portfolio-ms7h.vercel.app/)

---

## 📬 Contact

For collaborations, freelance projects, custom algorithmic indicators, or broker API configurations, feel free to reach out:

* **Portfolio Link**: [portfolio-ms7h.vercel.app](https://portfolio-ms7h.vercel.app/)

---

## 🔒 License & Copyright

© 2026 Developer. All rights reserved. Private — built for educational, portfolio, and personal algorithmic research.
