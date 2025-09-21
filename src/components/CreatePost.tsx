"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { Send, Image, X } from "lucide-react";
import { apiService } from "@/lib/api";

interface CreatePostProps {
    onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [summary, setSummary] = useState("");
    const [sensitive, setSensitive] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsPosting(true);

        try {
            const postData = {
                content: content.trim(),
                to: ["https://www.w3.org/ns/activitystreams#Public"],
                cc: [],
                ...(summary && { summary }),
                sensitive
            };

            await apiService.createPost(postData);

            // Clear all form fields after successful post creation
            setContent("");
            setSummary("");
            setSensitive(false);
            onPostCreated?.();
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <Card className="w-full p-4 mb-4 bg-zinc-800 border-zinc-700">
            <form onSubmit={handleSubmit}>
                <div className="flex gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-violet-600 text-white">
                            U
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                        <div>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What's happening in your game development journey?"
                                className="w-full min-h-[100px] p-3 text-white bg-zinc-700 border border-zinc-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder-zinc-400"
                                disabled={isPosting}
                            />
                        </div>

                        {/* Content Warning/Summary */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="sensitive"
                                    checked={sensitive}
                                    onChange={(e) => setSensitive(e.target.checked)}
                                    className="w-4 h-4 text-violet-600 bg-zinc-700 border-zinc-600 rounded focus:ring-violet-500"
                                />
                                <label htmlFor="sensitive" className="text-sm text-zinc-300">
                                    Mark as sensitive content
                                </label>
                            </div>

                            {sensitive && (
                                <input
                                    type="text"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="Content warning (summary)"
                                    className="w-full p-2 text-white bg-zinc-700 border border-zinc-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder-zinc-400"
                                />
                            )}
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-violet-400 hover:text-violet-300 hover:bg-zinc-700"
                                    disabled={isPosting}
                                >
                                    <Image className="w-4 h-4 mr-2" />
                                    Media
                                </Button>
                            </div>

                            <Button
                                type="submit"
                                disabled={!content.trim() || isPosting}
                                className="bg-violet-600 hover:bg-violet-700 text-white disabled:bg-zinc-600 disabled:text-zinc-400"
                            >
                                {isPosting ? (
                                    "Posting..."
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Post
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