import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatItem } from "./ChatItem";
import { Chat } from "@/lib/db";

/*========== PROPS ==========*/
interface ChatListProps {
  chats: Chat[];
}

/*========== COMPONENT ==========*/
export function ChatList({ chats }: ChatListProps) {
  /*---------- RENDERER ----------*/
  if (chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-muted-foreground text-sm">
        No chats yet
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 max-w-full">
      <div className="flex flex-col gap-1 p-2">
        {chats.map((chat) => (
          <ChatItem key={chat.id} chat={chat} />
        ))}
      </div>
    </ScrollArea>
  );
}
