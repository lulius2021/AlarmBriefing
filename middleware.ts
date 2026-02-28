import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (per-instance, resets on cold start)
const rateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > maxRequests;
}

// Clean up old entries periodically (prevent memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(key);
  }
}, 60000);

const LIMITS: Record<string, { max: number; window: number }> = {
  '/api/auth/login': { max: 5, window: 60000 },
  '/api/auth/register': { max: 3, window: 60000 },
  '/api/auth/delete': { max: 3, window: 60000 },
  '/api/auth/bot-key': { max: 5, window: 60000 },
  '/api/bot/': { max: 60, window: 60000 },
  '/api/': { max: 30, window: 60000 },
};

function getLimit(pathname: string) {
  // Match most specific first
  for (const [prefix, limit] of Object.entries(LIMITS)) {
    if (pathname.startsWith(prefix)) return limit;
  }
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             req.headers.get('x-real-ip') || 'unknown';
  
  // For bot routes, use the bot key as identifier
  const botKey = req.headers.get('x-bot-key');
  const identifier = botKey ? `bot:${botKey.substring(0, 16)}` : `ip:${ip}`;
  
  const limit = getLimit(pathname);
  if (!limit) return NextResponse.next();

  const key = `${identifier}:${pathname}`;
  if (isRateLimited(key, limit.max, limit.window)) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte warte kurz.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
