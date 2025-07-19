import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/lib/db/main.db');

let db: any = null;

export async function openDb() {
  if (db) {
    return db;
  }
  
  try {
    const newDb = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });
    db = newDb;
    return db;
  } catch (error) {
    console.error('Failed to open database:', error);
    throw new Error('Failed to open database');
  }
} 