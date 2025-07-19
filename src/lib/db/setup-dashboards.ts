const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'src/lib/db/main.db');

async function openDb() {
  return sqlite.open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

async function setupDashboardDatabase() {
  console.log('Setting up dashboard database...');
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS dashboards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      widgets_order TEXT,
      layout TEXT
    )
  `);
  console.log('✅ "dashboards" table created or already exists.');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS widgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      config TEXT
    )
  `);
  console.log('✅ "widgets" table created or already exists.');

  await db.close();
  console.log('Dashboard database setup finished.');
}

if (require.main === module) {
    setupDashboardDatabase().catch(err => {
    console.error('Failed to set up dashboard database:', err);
  });
} 