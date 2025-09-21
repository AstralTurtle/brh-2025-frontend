"use client";

import { useEffect, useState } from "react";
import * as ProfileMod from "@/components/Profile";

type Actor = {
  preferredUsername?: string;
  name?: string;
  summary?: string;
  icon?: { url?: string };
  image?: { url?: string };
};

async function resolveHandleToActor(handle: string): Promise<string> {
  const cleaned = handle.replace(/^@/, "");
  const [user, host] = cleaned.split("@");
  if (!user || !host) throw new Error("Invalid handle");
  const res = await fetch(
    `https://${host}/.well-known/webfinger?resource=acct:${encodeURIComponent(`${user}@${host}`)}`,
    { headers: { Accept: "application/jrd+json, application/json" } }
  );
  if (!res.ok) throw new Error(`WebFinger failed: ${res.status}`);
  const data = await res.json();
  const self = (data.links || []).find(
    (l: any) => l.rel === "self" && String(l.type || "").includes("activity+json")
  );
  if (!self?.href) throw new Error("No ActivityPub self link");
  return self.href as string;
}

async function fetchRemoteActor(actorUrl: string): Promise<Actor> {
  const res = await fetch(actorUrl, {
    headers: {
      Accept:
        'application/activity+json, application/ld+json; profile="https://www.w3.org/ns/activitystreams"',
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Actor fetch failed: ${res.status}`);
  return res.json();
}

export default function RemoteProfileClient({ actorHint }: { actorHint: string }) {
  const [loading, setLoading] = useState(true);
  const [actor, setActor] = useState<Actor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actorUrl, setActorUrl] = useState<string>("");

  // Resolve Profile component regardless of export style
  const ProfileComponent =
    // @ts-ignore
    (ProfileMod as any).default || (ProfileMod as any).Profile;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const url =
          actorHint.includes("@") && !actorHint.startsWith("http")
            ? await resolveHandleToActor(actorHint)
            : actorHint;

        if (cancelled) return;
        setActorUrl(url);

        const data = await fetchRemoteActor(url);
        if (cancelled) return;
        setActor(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load remote profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [actorHint]);

  if (!ProfileComponent) {
    return <div className="text-red-300">Profile component not exported (default or named).</div>;
  }

  if (loading) return <div className="text-zinc-300">Loading profile…</div>;
  if (error) return <div className="text-red-300">Error: {error}</div>;
  if (!actor) return <div className="text-zinc-300">Profile not found.</div>;

  const mapped = {
    username: actor.preferredUsername || actor.name || "unknown",
    avatar: actor.icon?.url || actor.image?.url || "",
    date: new Date(),
    message: actor.summary || "",
    slug: actorUrl,
  } as any;

  const Cmp = ProfileComponent as React.ComponentType<any>;
  return <Cmp {...mapped} />;
}