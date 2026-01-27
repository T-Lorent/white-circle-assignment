import { ChatContainer } from "@/components/chat/chat-container";
import { db, schema } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;

  // Check if conversation exists
  const conversation = await db
    .select()
    .from(schema.conversations)
    .where(eq(schema.conversations.id, id))
    .get();

  if (!conversation) {
    notFound();
  }

  // Fetch initial messages
  const messages = await db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, id))
    .orderBy(asc(schema.messages.createdAt));

  return <ChatContainer conversationId={id} initialMessages={messages} />;
}
