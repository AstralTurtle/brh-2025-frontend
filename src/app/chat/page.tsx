"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import NavBar from "@/components/NavigationBar"

type Role = "user" | "assistant";
type Msg = { role: Role; content: string; createdAt?: string };
type ConversationMeta = { id: string; title: string; updatedAt: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [modelLabel, setModelLabel] = useState<string>(process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-1.5-flash");
  const [mode, setMode] = useState<"general" | "game-dev">("general");

  const endRef = useRef<HTMLDivElement>(null);
  const canSend = input.trim().length > 0 && !isSending;

  const refreshConversations = useCallback(async () => {
    const res = await fetch("/api/chat/conversations", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as ConversationMeta[];
      setConversations(data);
    }
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    setLoadingConv(true);
    try {
      const res = await fetch(`/api/chat/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load conversation");
      const data = await res.json();
      setConversationId(id);
      setMessages(data.messages || []);
    } finally {
      setLoadingConv(false);
    }
  }, []);

  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const startNewChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setInput("");
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      await fetch(`/api/chat/${id}`, { method: "DELETE" });
      if (conversationId === id) startNewChat();
      void refreshConversations();
    },
    [conversationId, refreshConversations, startNewChat],
  );

  const send = useCallback(async () => {
    if (!canSend) return;
    const text = input.trim();
    setInput("");
    setIsSending(true);

    // Optimistic push
    setMessages((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationId: conversationId ?? undefined,
          mode, // send mode to server
        }),
      });
      if (!res.ok || !res.body) {
        const msg =
          res.status === 401 ? "You are not signed in. Please log in and try again." : `Request failed: ${res.status}`;
        throw new Error(msg);
      }

      const cid = res.headers.get("X-Conversation-Id");
      if (cid && cid !== conversationId) setConversationId(cid);

      const hdrModel = res.headers.get("X-Model");
      if (hdrModel) setModelLabel(hdrModel);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          const chunk = decoder.decode(value);
          setMessages((prev) => {
            const next = [...prev];
            for (let i = next.length - 1; i >= 0; i--) {
              if (next[i].role === "assistant") {
                next[i] = { ...next[i], content: (next[i].content || "") + chunk };
                break;
              }
            }
            return next;
          });
        }
      }

      void refreshConversations();
    } catch (err: any) {
      const msg = err?.message || "Error generating response. Please try again.";
      setMessages((prev) => {
        const next = [...prev];
        if (next.length > 0 && next[next.length - 1].role === "assistant") {
          next[next.length - 1] = { role: "assistant", content: msg };
        }
        return next;
      });
    } finally {
      setIsSending(false);
    }
  }, [canSend, input, conversationId, mode, refreshConversations]);

  // Render Markdown with basic styling and code highlighting
  function Markdown({ text }: { text: string }) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: (props) => <h1 className="my-2 text-lg font-semibold" {...props} />,
          h2: (props) => <h2 className="my-2 text-base font-semibold" {...props} />,
          h3: (props) => <h3 className="my-2 text-sm font-semibold" {...props} />,
          // Paragraphs and lists
          p: (props) => <p className="my-2 leading-relaxed" {...props} />,
          ul: (props) => <ul className="my-2 list-disc space-y-1 pl-6" {...props} />,
          ol: (props) => <ol className="my-2 list-decimal space-y-1 pl-6" {...props} />,
          li: (props) => <li className="leading-relaxed" {...props} />,
          blockquote: (props) => <blockquote className="my-2 border-l-2 pl-3 italic text-zinc-300" {...props} />,
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-white underline" {...props}>
              {children}
            </a>
          ),
          table: (props) => <table className="my-2 border-collapse" {...props} />,
          th: (props) => <th className="border px-2 py-1 text-left" {...props} />,
          td: (props) => <td className="border px-2 py-1 align-top" {...props} />,
          // Code blocks and inline code
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            if (!inline) {
              return (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match?.[1] || "text"}
                  PreTag="div"
                  customStyle={{ margin: "8px 0", borderRadius: 6, fontSize: "0.85rem" }}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              );
            }
            return (
              <code className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-[0.85em]" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-violet-600 to-indigo-600">
        {/* Top bar (matches landing) */}
        <NavBar></NavBar>

        {/* Two-column layout (matches landing spacing) */}
        <div className="flex w-full flex-1 flex-row gap-12 p-12">
          {/* Right: Sidebar (1/3) */}
          <div className="flex basis-1/3 flex-col items-stretch">
            <div className="flex flex-1 flex-col gap-4 rounded-lg bg-zinc-900 p-6 text-white">
              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  onClick={startNewChat}
                  disabled={isSending}
                  className="bg-white font-semibold text-black hover:bg-zinc-200"
                >
                  New chat
                </Button>
              </div>

              {/* Mode selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-300">Mode</label>
                <select
                  className="flex-1 rounded border-2 border-zinc-800 bg-zinc-900 px-2 py-1 text-sm text-white"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as "general" | "game-dev")}
                  disabled={isSending}
                >
                  <option value="general">General</option>
                  <option value="game-dev">Game design/dev</option>
                </select>
              </div>

              <div className="text-xs text-zinc-300">Conversations</div>
              <div className="flex-1 space-y-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="text-xs text-zinc-400">No conversations yet</div>
                ) : (
                  conversations.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <button
                        className={`flex-1 rounded border border-zinc-800 px-2 py-2 text-left text-sm hover:bg-zinc-800 ${
                          conversationId === c.id ? "bg-zinc-800" : "bg-zinc-900"
                        }`}
                        onClick={() => loadConversation(c.id)}
                        disabled={loadingConv || isSending}
                        title={c.title}
                      >
                        <span className="truncate">{c.title}</span>
                      </button>
                      <button
                        className="px-2 text-xs text-zinc-400 hover:text-white"
                        onClick={() => deleteConversation(c.id)}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {/* Left: Main chat panel (2/3) */}
          <div className="flex basis-2/3 flex-col gap-6 text-white">
            <h2 className="text-4xl font-extrabold md:text-5xl">Idea Collaborator</h2>

            {/* Chat panel card */}
            <div className="flex flex-1 flex-col gap-4 rounded-lg bg-slate-800 p-4">
              {/* Message list */}
              <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border-2 border-slate-700 bg-slate-800 p-4">
                {messages.length === 0 ? (
                  <div className="text-sm text-zinc-300">
                    Share your idea. I’ll give feedback and ask probing questions.
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isUser = m.role === "user";
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <Avatar className="mt-1 h-8 w-8">
                          <AvatarFallback>{isUser ? "U" : "AI"}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`whitespace-pre-wrap rounded-lg border px-4 py-2 text-sm leading-relaxed ${
                            isUser ? "border-zinc-700 bg-zinc-900" : "border-slate-600 bg-slate-700"
                          }`}
                        >
                          <Markdown text={m.content} />
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              {/* Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
                className="flex gap-2"
              >
                <textarea
                  className="flex-1 resize-none rounded-md border-2 border-slate-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/40"
                  rows={3}
                  placeholder={mode === "game-dev" ? "Pitch your game idea..." : "Describe your idea..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isSending}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    disabled={!canSend}
                    className="bg-white font-semibold text-black hover:bg-zinc-200"
                  >
                    {isSending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </form>

              <div className="text-[11px] text-zinc-300">
                Model: {modelLabel}. Mode: {mode}. Temp 0.4, max 4000 tokens.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
