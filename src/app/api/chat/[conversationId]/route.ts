import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { conversationId: string } }) {
  const auth = await getUserFromRequest(req);
  if (!auth?.userId) return new Response("Unauthorized", { status: 401 });

  const { conversationId } = params;
  if (!ObjectId.isValid(conversationId)) return new Response("Invalid id", { status: 400 });

  const db = await getDb();
  const conv = await db.collection("conversations").findOne(
    { _id: new ObjectId(conversationId), userId: auth.userId },
    { projection: { _id: 1, title: 1, messages: 1, updatedAt: 1 } }
  );
  if (!conv) return new Response("Not found", { status: 404 });

  return Response.json({
    id: conv._id.toString(),
    title: conv.title || "Untitled",
    updatedAt: conv.updatedAt,
    messages: conv.messages ?? [],
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { conversationId: string } }) {
  const auth = await getUserFromRequest(req);
  if (!auth?.userId) return new Response("Unauthorized", { status: 401 });

  const { conversationId } = params;
  if (!ObjectId.isValid(conversationId)) return new Response("Invalid id", { status: 400 });

  const db = await getDb();
  await db.collection("conversations").deleteOne({ _id: new ObjectId(conversationId), userId: auth.userId });
  return new Response(null, { status: 204 });
}