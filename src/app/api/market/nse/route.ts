import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SYMBOL_MAP: Record<string, string> = {
  // Indian Equities
  RELIANCE: 'RELIANCE.NS',
  TCS: 'TCS.NS',
  INFY: 'INFY.NS',
  HDFCBANK: 'HDFCBANK.NS',
  
  // US Equities
  AAPL: 'AAPL',
  NVDA: 'NVDA',
  TSLA: 'TSLA',
  MSFT: 'MSFT',
  GOOGL: 'GOOGL',
  AMZN: 'AMZN',
  
  // ETFs
  SPY: 'SPY',
  QQQ: 'QQQ',
  
  // Crypto
  BTCUSD: 'BTC-USD',
  ETHUSD: 'ETH-USD',
  SOLUSD: 'SOL-USD',
  AVAXUSD: 'AVAX-USD',
  
  // Commodities
  GOLD: 'GC=F',
  OIL: 'CL=F',
  
  // Forex
  EURUSD: 'EURUSD=X',
  GBPUSD: 'GBPUSD=X',
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');

    if (!symbol || !SYMBOL_MAP[symbol]) {
      return NextResponse.json(
        { error: 'Invalid or unsupported trading symbol' },
        { status: 400 }
      );
    }

    const yfSymbol = SYMBOL_MAP[symbol];

    // Fetch near-real-time NSE chart from Yahoo Finance public REST endpoint
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?interval=1m&range=1d`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        next: { revalidate: 12 }, // Cache response for 12 seconds to prevent rate limits
      }
    );

    if (!res.ok) {
      throw new Error(`Yahoo Finance API returned status: ${res.status}`);
    }

    const data = await res.json();
    const result = data.chart?.result?.[0];
    
    if (!result) {
      throw new Error('Yahoo Finance returned empty result');
    }

    const price = result.meta?.regularMarketPrice;
    const prevClose = result.meta?.chartPreviousClose || price;
    const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

    return NextResponse.json({
      symbol,
      price: price || 100.0,
      change24h: change,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('NSE Price fetch failed:', error);
    // Graceful fallback status so client is aware but doesn't break
    return NextResponse.json(
      { error: 'NSE live stream degraded, utilizing local simulation fallback' },
      { status: 500 }
    );
  }
}
