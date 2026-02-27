import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    database: isSupabaseConfigured() ? 'supabase' : 'in-memory',
    timestamp: new Date().toISOString(),
  });
}
