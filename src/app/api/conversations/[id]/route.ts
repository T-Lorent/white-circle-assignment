import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/conversations/[id] - Get a single conversation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const conversation = await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.id, id))
      .get();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Delete a conversation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Messages will be cascade deleted due to foreign key constraint
    await db
      .delete(schema.conversations)
      .where(eq(schema.conversations.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}

// PATCH /api/conversations/[id] - Update a conversation (e.g., title)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Partial<{ title: string; updatedAt: Date }> = {
      updatedAt: new Date(),
    };

    if (body.title) {
      updates.title = body.title;
    }

    await db
      .update(schema.conversations)
      .set(updates)
      .where(eq(schema.conversations.id, id));

    const conversation = await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.id, id))
      .get();

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}
