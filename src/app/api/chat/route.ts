// LIB
import {
  anthropic,
  CLAUDE_HAIKU_4_5_MODEL,
  CLAUDE_SONNET_4_MODEL,
  DEFAULT_MAX_TOKENS,
} from "@/lib/anthropic";

// DATABASE
import { createMessage, getMessageCount, updateChatTitle } from "@/lib/db";

/*========== PII DETECTION ==========*/
const PII_DETECTION_PROMPT = `Identify PII (emails, phone numbers, physical addresses) in this text.
Return the EXACT same text with PII wrapped in <pii></pii> tags.
Do not modify anything else. If no PII found, return text unchanged.
Do not add any explanation or commentary, just return the text.

Text: `;

async function detectPII(text: string): Promise<string> {
  if (!text.trim()) return text;

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_HAIKU_4_5_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: PII_DETECTION_PROMPT + text,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }
    return text;
  } catch (error) {
    console.error("PII detection error:", error);
    return text; // Return original text if detection fails
  }
}

// Check if buffer contains a complete sentence
function hasSentenceBoundary(text: string): boolean {
  // Match sentence-ending punctuation followed by space or end of string
  return /[.!?]\s/.test(text) || /[.!?]$/.test(text);
}

// Split buffer into complete sentences and remainder
function splitAtSentenceBoundary(text: string): {
  complete: string;
  remainder: string;
} {
  // Find the last sentence boundary
  const matches = [...text.matchAll(/[.!?](?:\s|$)/g)];
  if (matches.length === 0) {
    return { complete: "", remainder: text };
  }

  const lastMatch = matches[matches.length - 1];
  const splitIndex = lastMatch.index! + lastMatch[0].length;

  return {
    complete: text.slice(0, splitIndex),
    remainder: text.slice(splitIndex),
  };
}

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
  let buffer = "";

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          buffer += event.delta.text;

          // Check if we have complete sentences to process
          if (hasSentenceBoundary(buffer)) {
            const { complete, remainder } = splitAtSentenceBoundary(buffer);

            if (complete) {
              // Process complete sentences through PII detection
              const taggedText = await detectPII(complete);
              fullResponse += taggedText;
              controller.enqueue(encoder.encode(taggedText));
            }

            buffer = remainder;
          }
        }
      }

      // Process any remaining buffer
      if (buffer) {
        const taggedText = await detectPII(buffer);
        fullResponse += taggedText;
        controller.enqueue(encoder.encode(taggedText));
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
