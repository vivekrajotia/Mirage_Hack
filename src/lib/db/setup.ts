import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';

// Define the type for a trade record based on your JSON data
type TradeRecord = {
  [key: string]: string | number | null;
};

// Path to the database file
const DB_PATH = path.join(process.cwd(), 'src/lib/db/main.db');
const EOD_DATA_PATH = path.join(process.cwd(), 'src/app/xceler_eodservice_publisheddata (1).json');

// Function to open the database connection
async function openDb() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

// Function to set up the database and tables
export async function setupDatabase() {
  console.log('Setting up database...');
  const db = await openDb();

  // Create widgets table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS widgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      xAxis TEXT,
      yAxis TEXT,
      valueField TEXT,
      aggregation TEXT,
      filters TEXT
    )
  `);
  console.log('✅ "widgets" table created or already exists.');

  // Read the JSON data
  const jsonData = await fs.readFile(EOD_DATA_PATH, 'utf-8');
  const trades: TradeRecord[] = JSON.parse(jsonData);

  if (!trades || trades.length === 0) {
    console.log('No trade data found to populate the database.');
    return;
  }

  // Dynamically create the trades table based on the keys of the first trade object
  const tradeKeys = Object.keys(trades[0]);
  const createTradesTableQuery = `
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ${tradeKeys.map(key => `${key} TEXT`).join(',\n')}
    )
  `;
  await db.exec(createTradesTableQuery);
  console.log('✅ "trades" table created or already exists.');

  // Check if the table is empty before inserting data
  const rowCount = await db.get('SELECT COUNT(*) as count FROM trades');
  if (rowCount.count > 0) {
    console.log('"trades" table is already populated. Skipping data insertion.');
    await db.close();
    return;
  }

  // Insert data into the trades table
  console.log(`Inserting ${trades.length} records into "trades" table...`);
  const placeholders = tradeKeys.map(() => '?').join(', ');
  const insertQuery = `INSERT INTO trades (${tradeKeys.join(', ')}) VALUES (${placeholders})`;
  
  await db.run('BEGIN TRANSACTION;');
  const stmt = await db.prepare(insertQuery);

  for (const trade of trades) {
    const values = tradeKeys.map(key => trade[key]);
    await stmt.run(values);
  }

  await stmt.finalize();
  await db.run('COMMIT;');

  console.log('✅ Data insertion complete.');
  await db.close();
  console.log('Database setup finished.');
}

// Run the setup function if the script is executed directly
if (require.main === module) {
  setupDatabase().catch(err => {
    console.error('Failed to set up database:', err);
  });
} 