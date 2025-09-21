"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ExternalLink, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { getDiceBearAvatar } from "@/lib/utils";

export interface UserSearchResult {
    id: string;
    username: string;
    preferredUsername?: string;
    display_name?: string;
    name?: string;
    summary?: string;
    icon?: string;
    followers_count?: number;
    following_count?: number;
    posts_count?: number;
    isLocal: boolean;
    host?: string;
}

interface UserResultProps {
    user: UserSearchResult;
    onUserClick?: (user: UserSearchResult) => void;
}

export function UserResult({ user, onUserClick }: UserResultProps) {
    const router = useRouter();

    // Extract username for display
    const displayUsername = user.preferredUsername || user.username || 'unknown';
    const displayName = user.display_name || user.name || displayUsername;
    const avatarUrl = user.icon || getDiceBearAvatar(displayUsername);

    // Extract host from ActivityPub ID for remote users
    const getHost = () => {
        if (user.host) return user.host;
        try {
            const url = new URL(user.id);
            return url.hostname;
        } catch {
            return 'unknown';
        }
    };

    const handleClick = () => {
        if (onUserClick) {
            onUserClick(user);
        } else {
            // Navigate to user profile
            router.push(`/profile/${displayUsername}`);
        }
    };

    return (
        <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors cursor-pointer">
            <CardContent className="p-4" onClick={handleClick}>
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-violet-600 text-white">
                            {displayUsername.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white truncate">{displayName}</h3>
                            {!user.isLocal && (
                                <ExternalLink className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                            )}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-zinc-400">
                            <User className="w-3 h-3" />
                            <span>@{displayUsername}</span>
                            {!user.isLocal && (
                                <span className="text-zinc-500">@{getHost()}</span>
                            )}
                        </div>

                        {user.summary && (
                            <p className="text-sm text-zinc-300 mt-1 line-clamp-2">
                                {user.summary.replace(/<[^>]*>/g, '').substring(0, 100)}
                                {user.summary.length > 100 && '...'}
                            </p>
                        )}

                        <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                            {user.posts_count !== undefined && (
                                <span>{user.posts_count} posts</span>
                            )}
                            {user.followers_count !== undefined && (
                                <span>{user.followers_count} followers</span>
                            )}
                            {user.following_count !== undefined && (
                                <span>{user.following_count} following</span>
                            )}
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="text-violet-400 border-violet-400 hover:bg-violet-400 hover:text-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                    >
                        View Profile
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}