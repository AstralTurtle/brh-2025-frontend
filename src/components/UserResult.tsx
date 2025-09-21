"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ExternalLink, User } from "lucide-react";
// import { useRouter } from "next/navigation"; // remove: we’ll use Link only
import { getDiceBearAvatar } from "@/lib/utils";
import Link from "next/link";
import { profileHref, type KnownUser } from "@/lib/profileHref";

type AnyUser = {
  id?: string;
  url?: string;
  username?: string;
  preferredUsername?: string;
  display_name?: string;
  name?: string;
  icon?: string | { url?: string };
  host?: string;
  summary?: string;
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
  handle?: string;
  domain?: string;
  isRemote?: boolean; // provided by your data separation
};

function toKnownUser(u: AnyUser): KnownUser {
  if (u.isRemote) {
    const actorUrl =
      (typeof u.url === "string" && u.url.startsWith("http") && u.url) ||
      (typeof u.id === "string" && u.id.startsWith("http") && u.id) ||
      undefined;

    const handle =
      u.handle ||
      (u.domain && u.username ? `@${u.username}@${u.domain}` : undefined);

    return { isRemote: true, actorUrl, handle };
  }
  const slug = u.username || (typeof u.id === "string" ? u.id : "");
  return { isRemote: false, slug };
}

export default function UserResult({ user }: { user: AnyUser }) {
  // const router = useRouter(); // no longer needed

  const displayUsername = user.preferredUsername || user.username || "unknown";
  const displayName = user.display_name || user.name || displayUsername;
  const avatarUrl =
    (typeof user.icon === "string" ? user.icon : user.icon?.url) ||
    getDiceBearAvatar(displayUsername);

  const getHost = () => {
    if (user.host) return user.host;
    try {
      const raw =
        (typeof user.url === "string" ? user.url : undefined) ||
        (typeof user.id === "string" ? user.id : undefined);
      if (!raw) return "unknown";
      return new URL(raw).hostname;
    } catch {
      return "unknown";
    }
  };

  const known = toKnownUser(user);
  const href = profileHref(known);
  const isRemote = known.isRemote;

  return (
    <Link href={href} className="block">
      <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors cursor-pointer">
        <CardContent className="p-4">
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
                {isRemote && (
                  <ExternalLink className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-1 text-sm text-zinc-400">
                <User className="w-3 h-3" />
                <span>@{displayUsername}</span>
                {isRemote && <span className="text-zinc-500">@{getHost()}</span>}
              </div>

              {user.summary && (
                <p className="text-sm text-zinc-300 mt-1 line-clamp-2">
                  {user.summary.replace(/<[^>]*>/g, "").substring(0, 100)}
                  {user.summary.length > 100 && "..."}
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
              // No onClick. The outer Link navigates, so the button will as well.
            >
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}