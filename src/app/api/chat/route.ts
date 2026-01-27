import {
  anthropic,
  CLAUDE_SONNET_4_MODEL,
  DEFAULT_MAX_TOKENS,
} from "@/lib/anthropic";

/*========== POST ==========*/
export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = anthropic.messages.stream({
    model: CLAUDE_SONNET_4_MODEL,
    max_tokens: DEFAULT_MAX_TOKENS,
    messages: messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  });

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
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
