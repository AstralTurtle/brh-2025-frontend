export type LocalUser = {
  isRemote: false
  slug: string // local slug/username
}

export type RemoteUser = {
  isRemote: true
  actorUrl?: string // full ActivityPub actor URL (preferred)
  handle?: string   // e.g. @alice@example.com (fallback)
}

export type KnownUser = LocalUser | RemoteUser

export function profileHref(user: KnownUser): string {
  if (user.isRemote) {
    const target = user.actorUrl ?? user.handle ?? ""
    return `/profile/${encodeURIComponent(target)}?remote=1`
  }
  return `/profile/${encodeURIComponent(user.slug)}`
}