# Institutional Guide: Transitioning to Real-Time Data & Brokerage Execution

Welcome to **Vector**! This document provides a complete technical roadmap for moving from **Paper Trading Simulators** to **Live, Sub-Second Production Feeds & Brokerage Order Execution**.

---

## ⚡ 1. What is Already Connected out-of-the-box?

Unlike simple mock dashboards, **Vector is already wired to live, near-real-time global market data**. 

We have implemented an automated gateway route inside [`src/app/api/market/nse/route.ts`](file:///c:/Users/VISHN/OneDrive/Desktop/files/vector-chunk-2/vector/src/app/api/market/nse/route.ts) that maps **all 20 preseeded instruments** directly to Yahoo Finance's live indices without requiring paid developer keys:

| Symbol Category | Ticker Range | Live Feed Provider |
| :--- | :--- | :--- |
| **Indian Equities (NSE)** | `RELIANCE`, `TCS`, `INFY`, `HDFCBANK` | Yahoo Finance (NSE Feed) |
| **US Equities** | `AAPL`, `NVDA`, `TSLA`, `MSFT`, `GOOGL`, `AMZN` | Yahoo Finance (Global Feed) |
| **ETFs** | `SPY`, `QQQ` | Yahoo Finance (Global Feed) |
| **Cryptocurrencies** | `BTCUSD`, `ETHUSD`, `SOLUSD`, `AVAXUSD` | Yahoo Finance (Crypto Feed) |
| **Commodities** | `GOLD` (`GC=F`), `OIL` (`CL=F`) | Yahoo Finance (Futures Feed) |
| **Forex** | `EURUSD`, `GBPUSD` | Yahoo Finance (Currency Feed) |

### How to Toggle Live Mode
1. Start Vector: `npm run dev`.
2. Access the dashboard: `http://localhost:3000/dashboard`.
3. Locate the **Settings Panel** (bottom-right widget).
4. Swap the **Market Price Feed** toggle from `Volatility Simulator` to `Live Yahoo Finance REST`.
5. The terminal, charts, order tickets, and watchlists will instantly begin ticking and tracking **live market pricing**!

---

## 📡 2. Upgrading to Sub-Second Live WebSockets

While Yahoo Finance's REST endpoints are ideal for learning and tracking hourly or daily trends, professional high-frequency trading requires sub-second streaming updates. 

Here is how you can easily swap the polling mechanism in Vector for a live WebSocket connection.

### Example: Connecting to Binance WebSockets (Crypto)
For crypto assets, Binance offers high-speed public WebSockets that require **no authentication key**. You can wire them directly client-side inside [`useTradeStore.ts`](file:///c:/Users/VISHN/OneDrive/Desktop/files/vector-chunk-2/vector/src/store/useTradeStore.ts):

```typescript
// Add a WebSocket listener inside useTradeStore
export const useTradeStore = create<TradeState>((set, get) => ({
  // ... existing state ...

  connectWebSocket: () => {
    // Open Binance public socket for active watchlists
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const symbol = data.s === 'BTCUSDT' ? 'BTCUSD' : data.s === 'ETHUSDT' ? 'ETHUSD' : null;
      if (!symbol) return;

      const price = parseFloat(data.c);
      const change = parseFloat(data.P);

      // Trigger store price updates in real-time
      set((state) => {
        const curr = state.livePrices[symbol];
        if (!curr) return {};

        const spreads = price * 0.0003;
        return {
          livePrices: {
            ...state.livePrices,
            [symbol]: {
              ...curr,
              price,
              bid: price - spreads,
              ask: price + spreads,
              change24h: change,
              history: [...curr.history, price].slice(-20),
            }
          }
        };
      });
    };

    return () => ws.close();
  }
}));
```

---

## 💼 3. Connecting Real Brokerages for Live Execution

To execute real orders with real money in real-time, you must connect Vector's server-side Actions and store logic to a licensed brokerage. 

Depending on your geographical location and market preference, here are the leading APIs to integrate:

### A. For Indian Markets (NSE / BSE)
To trade Indian stocks (Reliance, TCS, HDFC Bank) with real funds, you should utilize a brokerage API like **Zerodha Kite Connect**, **Upstox API**, **Angel One SmartAPI**, or **Fyers API**.

#### Kite Connect (NodeJS SDK) Integration Example:
1. Install the SDK: `npm install kiteconnect`
2. Create an execution route inside [`src/app/actions/actions.ts`](file:///c:/Users/VISHN/OneDrive/Desktop/files/vector-chunk-2/vector/src/app/actions/actions.ts):

```typescript
import { KiteConnect } from "kiteconnect";

const kite = new KiteConnect({
  api_key: process.env.KITE_API_KEY || ""
});

// Authenticate session
kite.setAccessToken(process.env.KITE_ACCESS_TOKEN || "");

export async function executeRealBrokerOrder(orderData: any) {
  try {
    const orderId = await kite.placeOrder("regular", {
      exchange: "NSE",
      tradingsymbol: orderData.symbol,
      transaction_type: orderData.side.toUpperCase() === "BUY" ? kite.TRANSACTION_TYPE_BUY : kite.TRANSACTION_TYPE_SELL,
      quantity: orderData.qty,
      order_type: orderData.type.toUpperCase() === "MARKET" ? kite.ORDER_TYPE_MARKET : kite.ORDER_TYPE_LIMIT,
      price: orderData.price,
      product: kite.PRODUCT_MIS // Intraday Square-off
    });

    return { success: true, brokerOrderId: orderId };
  } catch (error: any) {
    return { success: false, reason: error.message };
  }
}
```

---

### B. For US & Global Markets
For US stocks and crypto (Apple, NVIDIA, Bitcoin, Gold), the **Alpaca API** is highly recommended. It offers a fully-featured free paper-trading environment as well as zero-commission live trading accounts.

#### Alpaca Integration Example:
1. Install SDK: `npm install @alpacahq/alpaca-trade-api`
2. Configure live execution:

```typescript
import Alpaca from "@alpacahq/alpaca-trade-api";

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_API_KEY || "",
  secretKey: process.env.ALPACA_API_SECRET || "",
  paper: true // Set to false to trade with real money!
});

export async function executeAlpacaOrder(orderData: any) {
  try {
    const alpacaOrder = await alpaca.createOrder({
      symbol: orderData.symbol,
      qty: orderData.qty,
      side: orderData.side,
      type: orderData.type,
      time_in_force: "day"
    });

    return { success: true, brokerOrderId: alpacaOrder.id };
  } catch (error: any) {
    return { success: false, reason: error.message };
  }
}
```

---

## 🛠️ Recommended Path to Transition Safely

Trading in real-time is exciting, but risk management is paramount. To learn and transition safely, we highly recommend following these steps:

1. **Step 1: REST Polling (Current Phase)**: Keep `marketDataSource` set to `real_nse`. Verify your trading strategies using our virtual balance ($100,000) over real price updates.
2. **Step 2: Broker Paper Keys**: Sign up for a developer account with Upstox or Alpaca, obtain a **free Paper Trading API key**, and hook it up to Vector. This lets you practice routing orders to a real exchange sandbox.
3. **Step 3: WebSockets**: Configure live WebSockets to speed up pricing feeds.
4. **Step 4: Go Live**: Only after your strategies have achieved a solid win-rate and profit factor over several weeks of simulation, swap your API key to **Live Production** and start with tiny capital sizes (e.g. 1 share).

*Happy Trading! Vector is built to safeguard your edge, preserve your capital, and grow your algorithmic skills.*

---

## 👨‍💻 Developer & Portfolio

This institutional algorithmic trading terminal was developed as a high-performance web software showcase.

* **Developer Portfolio**: [Explore My Work & Showcase](https://portfolio-ms7h.vercel.app/)
* **Contact Link**: [portfolio-ms7h.vercel.app](https://portfolio-ms7h.vercel.app/)

© 2026 Developer. All rights reserved. Private — built for educational, portfolio, and personal algorithmic research.
