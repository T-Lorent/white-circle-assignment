// COMPONENTS
import { ChatContainer } from "@/components/chat/ChatContainer";

/*========== PAGE ==========*/
export default function Home() {
  /*---------- RENDERER ----------*/
  return (
    <main className="flex-1 h-full bg-background">
      <ChatContainer />
    </main>
  );
}
