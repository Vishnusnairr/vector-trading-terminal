import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/health
 * Returns server status + database connectivity.
 * Used by uptime checks and as a quick "is everything wired" probe in dev.
 */
export async function GET() {
  const startedAt = Date.now();

  let dbStatus: 'ok' | 'error' = 'ok';
  let dbLatencyMs: number | null = null;
  let dbError: string | null = null;

  try {
    const t = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - t;
  } catch (err) {
    dbStatus = 'error';
    dbError = err instanceof Error ? err.message : 'unknown';
  }

  return NextResponse.json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    service: 'vector-algo-terminal',
    version: '0.1.0',
    env: process.env.NODE_ENV,
    db: { status: dbStatus, latencyMs: dbLatencyMs, error: dbError },
    uptimeMs: process.uptime() * 1000,
    responseTimeMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  });
}
