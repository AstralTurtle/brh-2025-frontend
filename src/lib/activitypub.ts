// Resolve alice@example.com to actor URL via WebFinger
export async function resolveHandleToActor(handle: string): Promise<string> {
  // handle can be @alice@example.com or alice@example.com
  const cleaned = handle.replace(/^@/, "");
  const [user, host] = cleaned.split("@");
  if (!user || !host) throw new Error("Invalid handle");

  const url = `https://${host}/.well-known/webfinger?resource=acct:${encodeURIComponent(
    `${user}@${host}`
  )}`;
  const res = await fetch(url, { headers: { Accept: "application/jrd+json, application/json" } });
  if (!res.ok) throw new Error(`WebFinger failed: ${res.status}`);
  const data = await res.json();
  const self = (data.links || []).find((l: any) => l.rel === "self" && l.type?.includes("activity+json"));
  if (!self?.href) throw new Error("No ActivityPub self link");
  return self.href as string;
}

// Fetch an ActivityPub actor object
export async function fetchRemoteActor(actorUrl: string): Promise<any> {
  const res = await fetch(actorUrl, {
    headers: {
      Accept: 'application/activity+json, application/ld+json; profile="https://www.w3.org/ns/activitystreams"',
    },
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Actor fetch failed: ${res.status}`);
  return res.json();
}