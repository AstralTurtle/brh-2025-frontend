"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Send, X } from "lucide-react";
import { apiService } from "@/lib/api";

interface ReplyComponentProps {
    postId: string;
    onReplyCreated?: () => void;
    onCancel?: () => void;
}

export function ReplyComponent({ postId, onReplyCreated, onCancel }: ReplyComponentProps) {
    const [content, setContent] = useState("");
    const [isReplying, setIsReplying] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsReplying(true);

        try {
            const replyData = {
                content: content.trim(),
                to: ["https://www.w3.org/ns/activitystreams#Public"],
                cc: [],
                in_reply_to: postId
            };

            await apiService.createPost(replyData);

            setContent("");
            onReplyCreated?.();
        } catch (error) {
            console.error('Error creating reply:', error);
        } finally {
            setIsReplying(false);
        }
    };

    return (
        <Card className="w-full p-3 mt-2 bg-zinc-700 border-zinc-600 border-l-4 border-l-violet-500">
            <form onSubmit={handleSubmit}>
                <div className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-violet-600 text-white text-sm">
                            U
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your reply..."
                            className="w-full min-h-[80px] p-2 text-white bg-zinc-600 border border-zinc-500 rounded resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder-zinc-400 text-sm"
                            disabled={isReplying}
                        />

                        <div className="flex justify-between items-center">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onCancel}
                                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-600"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={!content.trim() || isReplying}
                                size="sm"
                                className="bg-violet-600 hover:bg-violet-700 text-white disabled:bg-zinc-600 disabled:text-zinc-400"
                            >
                                {isReplying ? (
                                    "Replying..."
                                ) : (
                                    <>
                                        <Send className="w-3 h-3 mr-1" />
                                        Reply
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Card>
    );
}