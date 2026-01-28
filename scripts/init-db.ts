import { sql } from "@vercel/postgres";

async function initializeDatabase() {
  console.log("Initializing database schema...");

  try {
    // Create chat table
    await sql`
      CREATE TABLE IF NOT EXISTS chat (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log("✓ Created chat table");

    // Create message table
    await sql`
      CREATE TABLE IF NOT EXISTS message (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL REFERENCES chat(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log("✓ Created message table");

    // Create index for message lookups by chat_id
    await sql`
      CREATE INDEX IF NOT EXISTS idx_message_chat_id ON message(chat_id)
    `;
    console.log("✓ Created index on message.chat_id");

    console.log("\n✅ Database initialization complete!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

initializeDatabase();
