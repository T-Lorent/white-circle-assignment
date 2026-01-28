import { sql } from "@vercel/postgres";

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

export async function getChats(): Promise<Chat[]> {
  const { rows } = await sql<Chat>`
    SELECT id, title, created_at, updated_at 
    FROM chat 
    ORDER BY updated_at DESC
  `;
  return rows;
}

export async function getChat(id: string): Promise<Chat | undefined> {
  const { rows } = await sql<Chat>`
    SELECT id, title, created_at, updated_at 
    FROM chat 
    WHERE id = ${id}
  `;
  return rows[0];
}

export async function createChat(title: string): Promise<Chat> {
  const id = generateId();
  const timestamp = now();

  await sql`
    INSERT INTO chat (id, title, created_at, updated_at)
    VALUES (${id}, ${title}, ${timestamp}, ${timestamp})
  `;

  return { id, title, created_at: timestamp, updated_at: timestamp };
}

export async function updateChatTitle(id: string, title: string): Promise<void> {
  const timestamp = now();
  await sql`
    UPDATE chat SET title = ${title}, updated_at = ${timestamp} WHERE id = ${id}
  `;
}

export async function updateChatTimestamp(id: string): Promise<void> {
  const timestamp = now();
  await sql`
    UPDATE chat SET updated_at = ${timestamp} WHERE id = ${id}
  `;
}

export async function deleteChat(id: string): Promise<void> {
  // Delete messages first (cascade should handle this, but being explicit)
  await sql`DELETE FROM message WHERE chat_id = ${id}`;

  // Delete chat
  await sql`DELETE FROM chat WHERE id = ${id}`;
}

/*---------- MESSAGE FUNCTIONS ----------*/

export async function getMessages(chatId: string): Promise<Message[]> {
  const { rows } = await sql<Message>`
    SELECT id, chat_id, role, content, created_at 
    FROM message 
    WHERE chat_id = ${chatId}
    ORDER BY created_at ASC
  `;
  return rows;
}

export async function createMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string
): Promise<Message> {
  const id = generateId();
  const timestamp = now();

  await sql`
    INSERT INTO message (id, chat_id, role, content, created_at)
    VALUES (${id}, ${chatId}, ${role}, ${content}, ${timestamp})
  `;

  // Update chat timestamp
  await updateChatTimestamp(chatId);

  return { id, chat_id: chatId, role, content, created_at: timestamp };
}

export async function getMessageCount(chatId: string): Promise<number> {
  const { rows } = await sql<{ count: string }>`
    SELECT COUNT(*) as count FROM message WHERE chat_id = ${chatId}
  `;
  return parseInt(rows[0].count, 10);
}
