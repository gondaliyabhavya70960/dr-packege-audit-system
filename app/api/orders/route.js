import { NextResponse } from 'next/server';
import { seedOrders } from '../../../src/data.js';

// Mock data source. In a real deployment this would query a DB / upstream API.
// Static seed data → cache at build time; flip to `force-dynamic` for live data.
export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({ count: seedOrders.length, orders: seedOrders });
}
