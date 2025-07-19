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

export async function GET(
  request: Request,
  { params }: { params: { tableName: string } }
) {
  const tableName = params.tableName;
  try {
    const db = await openDb();
    // IMPORTANT: In a real application, you MUST validate and sanitize the table name
    // to prevent SQL injection attacks. For this example, we are trusting the input.
    const data = await db.all(`SELECT * FROM ${tableName}`);
    await db.close();
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: `Error fetching data for table ${tableName}` },
      { status: 500 }
    );
  }
} 