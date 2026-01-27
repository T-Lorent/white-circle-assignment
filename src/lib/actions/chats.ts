"use server";

// LIBRARIES
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// DATABASE
import {
  createChat as dbCreateChat,
  deleteChat as dbDeleteChat,
} from "@/lib/db";

/*========== SERVER ACTIONS ==========*/

export async function createChat(title: string): Promise<string> {
  const chat = dbCreateChat(title);
  revalidatePath("/");
  return chat.id;
}

export async function deleteChat(id: string): Promise<void> {
  dbDeleteChat(id);
  revalidatePath("/");
}
