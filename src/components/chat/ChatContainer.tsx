"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { Message, MessageProps } from "./Message";

export function ChatContainer() {
  /*---------- STATE ----------*/
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /*---------- METHODS ----------*/
  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    const userMessage: MessageProps = {
      role: "user",
      content: prompt.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
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
          messages: [...messages, userMessage],
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
  };

  /*---------- HOOKS ----------*/
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /*---------- RENDERER ----------*/
  return (
    <div className="w-full h-screen relative">
      {/* MESSAGES */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-8 pb-20">
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
