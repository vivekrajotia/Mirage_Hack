import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { dashboardId: string } }
) {
  try {
    const db = await openDb();
    const dashboard = await db.get(
      'SELECT * FROM dashboards WHERE id = ?',
      params.dashboardId
    );

    if (!dashboard) {
      return NextResponse.json(
        { message: 'Dashboard not found' },
        { status: 404 }
      );
    }

    // Fetch the full widget data for the dashboard
    const widgetIds = JSON.parse(dashboard.widgets_order);
    const placeholders = widgetIds.map(() => '?').join(',');
    const widgets = await db.all(
      `SELECT * FROM widgets WHERE id IN (${placeholders})`,
      widgetIds
    );

    dashboard.widgets = widgets;
    dashboard.layout = JSON.parse(dashboard.layout);

    return NextResponse.json({ dashboard });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { message: 'Error fetching dashboard' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { dashboardId: string } }
) {
  try {
    const body = await request.json();
    const { name } = body;

    const db = await openDb();
    await db.run(
      'UPDATE dashboards SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, params.dashboardId]
    );

    return NextResponse.json({ message: 'Dashboard updated successfully' });
  } catch (error) {
    console.error('Error updating dashboard:', error);
    return NextResponse.json(
      { message: 'Error updating dashboard' },
      { status: 500 }
    );
  }
} 