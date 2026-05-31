const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'github_analyzer',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    const dbName = process.env.DB_NAME || 'github_analyzer';

    const tempPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    const conn = await tempPool.getConnection();
    try {
      await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    } catch (e) {
      // Railway pre-creates the DB, ignore permission errors here
    }
    conn.release();
    await tempPool.end();
  } catch (e) {
    // If connecting without DB fails, just try the main pool directly
  }

  const conn = await pool.getConnection();
  conn.release();
  console.log('DB connected');
}

async function initializeDatabase() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS profiles (
      id                  INT PRIMARY KEY AUTO_INCREMENT,
      github_id           BIGINT,
      username            VARCHAR(255) UNIQUE,
      name                VARCHAR(255),
      bio                 TEXT,
      followers           INT,
      following           INT,
      public_repos        INT,
      account_age         INT,
      most_used_language  VARCHAR(100),
      total_stars         INT,
      total_forks         INT,
      top_repo            VARCHAR(255),
      profile_score       INT,
      profile_url         VARCHAR(500),
      avatar_url          VARCHAR(500),
      created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

module.exports = { pool, testConnection, initializeDatabase };
