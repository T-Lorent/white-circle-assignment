import Database from "better-sqlite3";
import path from "path";

/*========== TYPES ==========*/
export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

/*========== DATABASE CONNECTION ==========*/
const dbPath = path.join(process.cwd(), "data", "chat.db");
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

/*========== SCHEMA INITIALIZATION ==========*/
db.exec(`
  CREATE TABLE IF NOT EXISTS chat (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS message (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (chat_id) REFERENCES chat(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_message_chat_id ON message(chat_id);
`);

/*========== HELPER FUNCTIONS ==========*/

// Generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Get current ISO timestamp
function now(): string {
  return new Date().toISOString();
}

/*---------- CHAT FUNCTIONS ----------*/

export function getChats(): Chat[] {
  const stmt = db.prepare(`
    SELECT id, title, created_at, updated_at 
    FROM chat 
    ORDER BY updated_at DESC
  `);
  return stmt.all() as Chat[];
}

export function getChat(id: string): Chat | undefined {
  const stmt = db.prepare(`
    SELECT id, title, created_at, updated_at 
    FROM chat 
    WHERE id = ?
  `);
  return stmt.get(id) as Chat | undefined;
}

export function createChat(title: string): Chat {
  const id = generateId();
  const timestamp = now();

  const stmt = db.prepare(`
    INSERT INTO chat (id, title, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, title, timestamp, timestamp);

  return { id, title, created_at: timestamp, updated_at: timestamp };
}

export function updateChatTitle(id: string, title: string): void {
  const stmt = db.prepare(`
    UPDATE chat SET title = ?, updated_at = ? WHERE id = ?
  `);
  stmt.run(title, now(), id);
}

export function updateChatTimestamp(id: string): void {
  const stmt = db.prepare(`
    UPDATE chat SET updated_at = ? WHERE id = ?
  `);
  stmt.run(now(), id);
}

export function deleteChat(id: string): void {
  // Delete messages first (cascade)
  const deleteMessages = db.prepare(`DELETE FROM message WHERE chat_id = ?`);
  deleteMessages.run(id);

  // Delete chat
  const deleteChat = db.prepare(`DELETE FROM chat WHERE id = ?`);
  deleteChat.run(id);
}

/*---------- MESSAGE FUNCTIONS ----------*/

export function getMessages(chatId: string): Message[] {
  const stmt = db.prepare(`
    SELECT id, chat_id, role, content, created_at 
    FROM message 
    WHERE chat_id = ? 
    ORDER BY created_at ASC
  `);
  return stmt.all(chatId) as Message[];
}

export function createMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string
): Message {
  const id = generateId();
  const timestamp = now();

  const stmt = db.prepare(`
    INSERT INTO message (id, chat_id, role, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, chatId, role, content, timestamp);

  // Update chat timestamp
  updateChatTimestamp(chatId);

  return { id, chat_id: chatId, role, content, created_at: timestamp };
}

export function getMessageCount(chatId: string): number {
  const stmt = db.prepare(`SELECT COUNT(*) as count FROM message WHERE chat_id = ?`);
  const result = stmt.get(chatId) as { count: number };
  return result.count;
}
