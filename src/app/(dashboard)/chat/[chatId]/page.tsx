import { notFound } from "next/navigation";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { getChat, getMessages } from "@/lib/db";

interface ChatPageProps {
  params: Promise<{ chatId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = await params;
  
  const chat = getChat(chatId);
  
  if (!chat) {
    notFound();
  }

  const messages = getMessages(chatId);

  // Convert database messages to the format expected by ChatContainer
  const initialMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  return (
    <div className="flex-1 h-full bg-background">
      <ChatContainer chatId={chatId} initialMessages={initialMessages} />
    </div>
  );
}
