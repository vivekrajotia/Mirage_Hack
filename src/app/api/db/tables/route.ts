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

export async function GET() {
  try {
    const db = await openDb();
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    await db.close();
    
    const tableNames = tables.map(t => t.name).filter(name => !name.startsWith('sqlite_'));

    return NextResponse.json({ tables: tableNames });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching tables' }, { status: 500 });
  }
} 