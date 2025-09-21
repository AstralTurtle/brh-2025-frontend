import { getUserFromRequest } from "@/lib/auth";
import { gameDevSystemPrompt, generationConfig, getModel, modelName, safetySettings, systemPrompt } from "@/lib/gemini";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

type Role = "user" | "assistant";
type ChatMessage = { role: Role; content: string; createdAt: Date };

export async function POST(req: NextRequest) {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth?.userId) return new Response("Unauthorized", { status: 401 });

    const { message, conversationId, mode, systemPromptOverride } = (await req.json()) as {
      message: string;
      conversationId?: string;
      mode?: "general" | "game-dev";
      systemPromptOverride?: string;
    };
    if (!message || typeof message !== "string") return new Response("Message required", { status: 400 });

    const db = await getDb();
    const conversations = db.collection("conversations");

    let convId = conversationId && ObjectId.isValid(conversationId) ? new ObjectId(conversationId) : new ObjectId();

    let conversation = conversationId ? await conversations.findOne({ _id: convId, userId: auth.userId }) : null;

    if (!conversation) {
      await conversations.insertOne({
        _id: convId,
        userId: auth.userId,
        title: message.slice(0, 60),
        messages: [] as ChatMessage[],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const userMsg: ChatMessage = { role: "user", content: message, createdAt: new Date() };
    await conversations.updateOne(
      { _id: convId, userId: auth.userId },
      { $push: { messages: userMsg }, $set: { updatedAt: new Date() } },
    );

    const doc = await conversations.findOne({ _id: convId, userId: auth.userId });
    const history = ((doc?.messages ?? []) as ChatMessage[]).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        const model = getModel();

        const selectedPrompt =
          (systemPromptOverride && systemPromptOverride.trim()) ||
          (mode === "game-dev" ? gameDevSystemPrompt : systemPrompt);

        const chat = model.startChat({
          history,
          generationConfig,
          safetySettings,
          // @ts-ignore
          systemInstruction: { parts: [{ text: selectedPrompt }] },
        });

        const result = await chat.sendMessageStream(message);
        let assistantText = "";

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          assistantText += chunkText;
          await writer.write(encoder.encode(chunkText));
        }

        const assistantMsg: ChatMessage = { role: "assistant", content: assistantText, createdAt: new Date() };
        await conversations.updateOne(
          { _id: convId, userId: auth.userId },
          {
            $push: { messages: assistantMsg },
            $set: {
              updatedAt: new Date(),
              ...(doc?.title ? {} : { title: assistantText.split(".")[0]?.slice(0, 60) ?? "New chat" }),
            },
          },
        );

        await writer.close();
      } catch (err) {
        await writer.abort(err as any);
      }
    })();

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Conversation-Id": convId.toString(),
        "X-Model": modelName, // expose model to client
      },
    });
  } catch (e) {
    console.error(e);
    return new Response("Server error", { status: 500 });
  }
}
