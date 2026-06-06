import fs from 'fs';
import path from 'path';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { config } from '../config';

const SQL_DIR = path.join(__dirname, '..', '..', 'db');

const loadSql = (fileName: string): string => {
  const raw = fs.readFileSync(path.join(SQL_DIR, fileName), 'utf8');
  return raw
    .replace(/CREATE\s+DATABASE[^;]*;/gi, '')
    .replace(/USE\s+[^;]*;/gi, '')
    .trim();
};

export const initializeDatabase = async (): Promise<void> => {
  const connection = await mysql.createConnection({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    multipleStatements: true,
  });

  try {
    const schemaSql = loadSql('schema.sql');
    if (schemaSql) {
      await connection.query(schemaSql);
      console.log('✅ Database schema ensured (tables created if missing)');
    }

    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS count FROM products'
    );
    const productCount = Number(rows[0]?.count ?? 0);

    if (productCount === 0) {
      const seedSql = loadSql('seed.sql');
      if (seedSql) {
        await connection.query(seedSql);
        console.log('🌱 Database seeded with initial data');
      }
    } else {
      console.log(`ℹ️  Database already populated (${productCount} products), skipping seed`);
    }
  } finally {
    await connection.end();
  }
};
