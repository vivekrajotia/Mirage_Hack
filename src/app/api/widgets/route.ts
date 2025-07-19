import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/lib/db/main.db');

async function openDb() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, ...config } = body;

    const db = await openDb();
    await db.run(
      'INSERT INTO widgets (name, type, config) VALUES (?, ?, ?)',
      [title, type, JSON.stringify(config)]
    );
    await db.close();

    return NextResponse.json({ message: 'Widget saved successfully' });
  } catch (error) {
    console.error('Error saving widget:', error);
    return NextResponse.json(
      { message: 'Error saving widget' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await openDb();
    const widgets = await db.all('SELECT id, name, type FROM widgets');
    await db.close();

    return NextResponse.json({ widgets });
  } catch (error) {
    console.error('Error fetching widgets:', error);
    return NextResponse.json(
      { message: 'Error fetching widgets' },
      { status: 500 }
    );
  }
} 