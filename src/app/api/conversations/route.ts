import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET /api/conversations - List all conversations
export async function GET() {
  try {
    const conversations = await db
      .select()
      .from(schema.conversations)
      .orderBy(desc(schema.conversations.updatedAt));

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = body.title || "New Chat";

    const now = new Date();
    const conversation = {
      id: nanoid(),
      title,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(schema.conversations).values(conversation);

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
