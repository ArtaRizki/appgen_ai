import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './db/index';

const ADMIN_EMAIL = 'admin@adigicube.com';
const ADMIN_PASSWORD = 'admin123!';
const ADMIN_NAME = 'Administrator';

async function seed() {
  console.log('🌱 Seeding database...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ─── Admin User ──────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const userId = 'usr_admin_001';

    await client.query(`
      INSERT INTO users (id, email, password, name, role)
      VALUES ($1, $2, $3, $4, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [userId, ADMIN_EMAIL, hashedPassword, ADMIN_NAME]);

    // ─── Tools ───────────────────────────────────────────────────────
    const toolsData = [
      {
        id: 'tool_data_scraper',
        name: 'Data Scraper',
        slug: 'data-scraper',
        description: 'Import data dari CSV, API, atau web scraping. Support column mapping dan validation.',
        type: 'scraper',
        icon: '🔍',
        config: JSON.stringify({
          maxFileSize: '50MB',
          supportedFormats: ['csv', 'json'],
          maxRows: 100000,
        }),
      },
      {
        id: 'tool_ai_content',
        name: 'AI Content Generator',
        slug: 'ai-content',
        description: 'Generate konten marketing, deskripsi produk, dan copy dengan AI. (Coming Soon)',
        type: 'generator',
        icon: '✨',
        config: JSON.stringify({ comingSoon: true }),
        isActive: false,
      },
      {
        id: 'tool_vending_finder',
        name: 'Vending Client Finder',
        slug: 'vending-finder',
        description: 'Cari dan track potential clients untuk vending machine business. (Coming Soon)',
        type: 'finder',
        icon: '🏪',
        config: JSON.stringify({ comingSoon: true }),
        isActive: false,
      },
    ];

    for (const tool of toolsData) {
      await client.query(`
        INSERT INTO tools (id, name, slug, description, type, icon, is_active, config)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (slug) DO NOTHING
      `, [
        tool.id,
        tool.name,
        tool.slug,
        tool.description,
        tool.type,
        tool.icon,
        tool.isActive !== false,
        tool.config,
      ]);
    }

    // ─── Grant admin access to all tools ─────────────────────────────
    for (const tool of toolsData) {
      const accessId = `acc_admin_${tool.id}`;
      await client.query(`
        INSERT INTO user_tool_access (id, user_id, tool_id, role)
        VALUES ($1, $2, $3, 'admin')
        ON CONFLICT DO NOTHING
      `, [accessId, userId, tool.id]);
    }

    await client.query('COMMIT');
    console.log('✅ Seed complete!');
    console.log(`   Admin email: ${ADMIN_EMAIL}`);
    console.log(`   Admin password: ${ADMIN_PASSWORD}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
