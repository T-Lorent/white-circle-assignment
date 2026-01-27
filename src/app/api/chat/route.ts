// LIB
import {
  anthropic,
  CLAUDE_SONNET_4_MODEL,
  DEFAULT_MAX_TOKENS,
} from "@/lib/anthropic";

// DATABASE
import { createMessage, getMessageCount, updateChatTitle } from "@/lib/db";

/*========== POST ==========*/
export async function POST(request: Request) {
  const { messages, chatId } = await request.json();

  // Get the latest user message
  const userMessage = messages[messages.length - 1];

  // Save user message to database if chatId is provided
  if (chatId && userMessage) {
    createMessage(chatId, "user", userMessage.content);

    // Auto-generate title from first message
    const messageCount = getMessageCount(chatId);
    if (messageCount === 1) {
      const title =
        userMessage.content.slice(0, 50) +
        (userMessage.content.length > 50 ? "..." : "");
      updateChatTitle(chatId, title);
    }
  }

  const stream = anthropic.messages.stream({
    model: CLAUDE_SONNET_4_MODEL,
    max_tokens: DEFAULT_MAX_TOKENS,
    messages: messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  });

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          fullResponse += event.delta.text;
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }

      // Save assistant message to database after streaming completes
      if (chatId && fullResponse) {
        createMessage(chatId, "assistant", fullResponse);
      }

      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
