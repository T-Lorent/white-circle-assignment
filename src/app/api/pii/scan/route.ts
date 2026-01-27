import { anthropic } from "@/lib/anthropic";

const PII_DETECTION_MODEL = "claude-haiku-4-5-20251001";

export interface PiiRange {
  start: number;
  end: number;
  type:
    | "email"
    | "phone"
    | "name"
    | "address"
    | "ssn"
    | "credit_card"
    | "other";
}

interface ScanRequest {
  text: string;
  offset?: number; // For progressive scanning, offset from start of full text
}

interface ScanResponse {
  piiRanges: PiiRange[];
}

const SYSTEM_PROMPT = `You are a PII (Personally Identifiable Information) detector. Your task is to identify and locate PII in the given text.

Identify the following types of PII:
- email: Email addresses
- phone: Phone numbers (any format)
- name: Personal names (first names, last names, full names)
- address: Physical addresses
- ssn: Social Security Numbers
- credit_card: Credit card numbers
- other: Any other PII (dates of birth, account numbers, etc.)

IMPORTANT: Return ONLY a valid JSON array of objects with these exact fields:
- start: The character index where the PII starts (0-based)
- end: The character index where the PII ends (exclusive)
- type: One of the types listed above

If no PII is found, return an empty array: []

Example input: "Contact John Smith at john@email.com or 555-123-4567"
Example output: [{"start":8,"end":18,"type":"name"},{"start":22,"end":36,"type":"email"},{"start":40,"end":52,"type":"phone"}]

Return ONLY the JSON array, no explanation or markdown.`;

export async function POST(request: Request) {
  try {
    const body: ScanRequest = await request.json();
    const { text, offset = 0 } = body;

    if (!text || text.trim().length === 0) {
      return Response.json({ piiRanges: [] } satisfies ScanResponse);
    }

    const response = await anthropic.messages.create({
      model: PII_DETECTION_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
    });

    // Extract the text content from the response
    const content = response.content[0];
    if (content.type !== "text") {
      return Response.json({ piiRanges: [] } satisfies ScanResponse);
    }

    // Parse the JSON response (strip markdown code fences if present)
    let piiRanges: PiiRange[] = [];
    try {
      let jsonText = content.text.trim();
      // Remove markdown code fences if present
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
      }
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        // Apply offset to all ranges and validate
        piiRanges = parsed
          .filter(
            (item) =>
              typeof item.start === "number" &&
              typeof item.end === "number" &&
              typeof item.type === "string" &&
              item.start >= 0 &&
              item.end > item.start,
          )
          .map((item) => ({
            start: item.start + offset,
            end: item.end + offset,
            type: item.type,
          }));
      }
    } catch {
      // If parsing fails, return empty array
      console.error("Failed to parse PII detection response:", content.text);
    }

    return Response.json({ piiRanges } satisfies ScanResponse);
  } catch (error) {
    console.error("PII scan error:", error);
    return Response.json({ error: "Failed to scan for PII" }, { status: 500 });
  }
}
