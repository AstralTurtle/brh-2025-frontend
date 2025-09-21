import { getUserFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await getUserFromRequest(req);
  if (!auth?.userId) return new Response("Unauthorized", { status: 401 });

  const db = await getDb();
  const conversations = db.collection("conversations");

  const list = await conversations
    .find({ userId: auth.userId }, { projection: { _id: 1, title: 1, updatedAt: 1 } })
    .sort({ updatedAt: -1 })
    .limit(100)
    .toArray();

  return Response.json(
    list.map((c) => ({ id: c._id.toString(), title: c.title || "Untitled", updatedAt: c.updatedAt })),
  );
}
