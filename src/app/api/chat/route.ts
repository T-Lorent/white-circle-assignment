import { anthropic, DEFAULT_MODEL, MAX_TOKENS } from "@/lib/anthropic";
import { db, schema } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, message } = body;

    if (!conversationId || !message) {
      return new Response(
        JSON.stringify({ error: "conversationId and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if conversation exists
    const conversation = await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.id, conversationId))
      .get();

    if (!conversation) {
      return new Response(
        JSON.stringify({ error: "Conversation not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Save the user message
    const userMessage = {
      id: nanoid(),
      conversationId,
      role: "user" as const,
      content: message,
      createdAt: new Date(),
    };
    await db.insert(schema.messages).values(userMessage);

    // Get conversation history
    const historyMessages = await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.conversationId, conversationId))
      .orderBy(asc(schema.messages.createdAt));

    // Convert to Anthropic message format
    const anthropicMessages: MessageParam[] = historyMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Create streaming response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = anthropic.messages.stream({
            model: DEFAULT_MODEL,
            max_tokens: MAX_TOKENS,
            messages: anthropicMessages,
          });

          for await (const event of messageStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // Save the assistant message after streaming completes
          const assistantMessage = {
            id: nanoid(),
            conversationId,
            role: "assistant" as const,
            content: fullResponse,
            createdAt: new Date(),
          };
          await db.insert(schema.messages).values(assistantMessage);

          // Update conversation title if this is the first message
          if (historyMessages.length === 1) {
            // Generate a title from the first user message
            const title =
              message.length > 50 ? message.substring(0, 47) + "..." : message;
            await db
              .update(schema.conversations)
              .set({ title, updatedAt: new Date() })
              .where(eq(schema.conversations.id, conversationId));
          } else {
            // Update the conversation's updatedAt
            await db
              .update(schema.conversations)
              .set({ updatedAt: new Date() })
              .where(eq(schema.conversations.id, conversationId));
          }

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
