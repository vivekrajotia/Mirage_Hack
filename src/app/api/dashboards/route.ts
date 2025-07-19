import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, layout, widgets } = body;

    const db = await openDb();
    const result = await db.run(
      'INSERT INTO dashboards (name, layout, widgets_order) VALUES (?, ?, ?)',
      [name, JSON.stringify(layout), JSON.stringify(widgets)]
    );

    return NextResponse.json({
      message: 'Dashboard saved successfully',
      dashboardId: result.lastID,
    });
  } catch (error) {
    console.error('Error saving dashboard:', error);
    return NextResponse.json(
      { message: 'Error saving dashboard' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await openDb();
    const dashboards = await db.all('SELECT id, name, updated_at FROM dashboards ORDER BY updated_at DESC');
    return NextResponse.json({ dashboards });
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return NextResponse.json(
      { message: 'Error fetching dashboards' },
      { status: 500 }
    );
  }
} 