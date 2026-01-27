"use client";

// LIBRARIES
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ACTIONS
import { createChat } from "@/lib/actions/chats";

// COMPONENTS
import { ChatInput } from "./ChatInput";
import { Message, MessageProps } from "./Message";

/*========== CONSTANTS ==========*/
const PENDING_MESSAGE_KEY = "pendingChatMessage";

/*========== PROPS ==========*/
interface ChatContainerProps {
  chatId?: string;
  initialMessages?: MessageProps[];
}

/*========== COMPONENT ==========*/
export function ChatContainer({
  chatId,
  initialMessages = [],
}: ChatContainerProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedPendingMessage = useRef(false);

  /*---------- STATE ----------*/
  const [messages, setMessages] = useState<MessageProps[]>(initialMessages);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setLoading] = useState(false);

  /*---------- METHODS ----------*/
  // Stream response from LLM for an existing chat
  const streamResponse = useCallback(
    async (userMessage: MessageProps, currentMessages: MessageProps[]) => {
      if (!chatId) return;

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      // Add empty assistant message for streaming
      const assistantMessage: MessageProps = {
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...currentMessages, userMessage],
            chatId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch response");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No reader available");
        }

        let accumulatedContent = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          // Update the last message with accumulated content
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.content = accumulatedContent;
            }
            return newMessages;
          });
        }
      } catch (error) {
        console.error("Error:", error);
        // Update the assistant message with error
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content = "Sorry, an error occurred. Please try again.";
          }
          return newMessages;
        });
      } finally {
        setLoading(false);
      }
    },
    [chatId],
  );

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    const userMessage: MessageProps = {
      role: "user",
      content: prompt.trim(),
    };

    setPrompt("");

    // If no chatId, create a new chat and redirect (LLM call will happen after redirect)
    if (!chatId) {
      const title =
        userMessage.content.slice(0, 50) +
        (userMessage.content.length > 50 ? "..." : "");
      const newChatId = await createChat(title);

      // Store the pending message to be processed after navigation
      sessionStorage.setItem(PENDING_MESSAGE_KEY, userMessage.content);

      // Navigate to the new chat
      router.push(`/chat/${newChatId}`);
      return;
    }

    // Otherwise, stream the response directly
    await streamResponse(userMessage, messages);
  };

  /*---------- HOOKS ----------*/
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Check for pending message after navigation to a new chat
  useEffect(() => {
    if (!chatId || hasProcessedPendingMessage.current) return;

    const pendingMessage = sessionStorage.getItem(PENDING_MESSAGE_KEY);
    if (pendingMessage) {
      hasProcessedPendingMessage.current = true;
      sessionStorage.removeItem(PENDING_MESSAGE_KEY);

      const userMessage: MessageProps = {
        role: "user",
        content: pendingMessage,
      };

      streamResponse(userMessage, initialMessages);
    }
  }, [chatId, initialMessages, streamResponse]);

  /*---------- RENDERER ----------*/
  return (
    <div className="w-full h-full relative">
      {/* MESSAGES */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-8 pb-32">
          {messages.length === 0 ?
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              Start a conversation...
            </div>
          : messages.map((message, index) => (
              <Message key={index} {...message} />
            ))
          }
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* CHAT INPUT */}
      <div className="w-full p-8 absolute bottom-0">
        <ChatInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleSubmit}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
