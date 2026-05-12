import 'dotenv/config';
import { pool } from './index';

const createTables = `
  CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
  );
  CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

  CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tools (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true NOT NULL,
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_tool_access (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tool_id VARCHAR(36) REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tool_executions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    tool_id VARCHAR(36) REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
    input JSONB,
    output JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    error TEXT,
    duration INTEGER,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scraper_jobs (
    id VARCHAR(36) PRIMARY KEY,
    execution_id VARCHAR(36) REFERENCES tool_executions(id) ON DELETE CASCADE NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_url TEXT,
    file_name VARCHAR(255),
    rows_imported INTEGER DEFAULT 0,
    rows_failed INTEGER DEFAULT 0,
    total_rows INTEGER DEFAULT 0,
    mapping_config JSONB,
    preview_data JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS managed_sites (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'wordpress',
    credentials JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );
`;

async function migrate() {
  console.log('🔄 Running migrations...');
  try {
    await pool.query(createTables);
    console.log('✅ Migrations complete.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
