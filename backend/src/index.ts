import app from './app';
import { config } from './config';
import { pool } from './db/pool';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

const connectWithRetry = async (retries = 0): Promise<void> => {
  try {
    const conn = await pool.getConnection();
    await conn.execute('SELECT 1');
    conn.release();
    console.log('✅ Database connected');
  } catch (err) {
    if (retries < MAX_RETRIES) {
      console.log(`⏳ Database not ready, retrying in ${RETRY_DELAY_MS}ms... (${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return connectWithRetry(retries + 1);
    }
    throw err;
  }
};

const start = async (): Promise<void> => {
  try {
    await connectWithRetry();

    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

start();
