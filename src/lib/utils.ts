import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    console.log('getCookie: document is undefined (SSR)');
    return null;
  }

  console.log('All cookies:', document.cookie);

  // Handle case where no cookies exist
  if (!document.cookie) {
    console.log('getCookie: no cookies found');
    return null;
  }

  const cookies = document.cookie.split(';');
  console.log('Split cookies:', cookies);

  for (let cookie of cookies) {
    const [cookieName, ...cookieValueParts] = cookie.trim().split('=');
    const cookieValue = cookieValueParts.join('='); // Handle values with '=' in them

    console.log(`Checking cookie: "${cookieName}" = "${cookieValue}"`);

    if (cookieName === name) {
      console.log(`Found ${name}:`, cookieValue);
      return cookieValue || null;
    }
  }

  console.log(`Cookie "${name}" not found`);
  return null;
}

// DiceBear avatar cache and rate limiting
const avatarCache = new Map<string, string>();
const avatarQueue: string[] = [];
let isProcessingQueue = false;

export function getDiceBearAvatar(username: string): string {
  // Return cached avatar if available
  if (avatarCache.has(username)) {
    return avatarCache.get(username)!;
  }

  // Generate avatar URL
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${encodeURIComponent(username)}`;

  // Cache the avatar URL
  avatarCache.set(username, avatarUrl);

  // Add to queue for preloading (respecting rate limits)
  if (!avatarQueue.includes(username)) {
    avatarQueue.push(username);
    processAvatarQueue();
  }

  return avatarUrl;
}

async function processAvatarQueue() {
  if (isProcessingQueue || avatarQueue.length === 0) return;

  isProcessingQueue = true;

  while (avatarQueue.length > 0) {
    const username = avatarQueue.shift()!;
    const avatarUrl = avatarCache.get(username)!;

    try {
      // Preload the image
      const img = new Image();
      img.src = avatarUrl;
    } catch (error) {
      console.log(`Failed to preload avatar for ${username}`);
    }

    // Rate limit: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  isProcessingQueue = false;
}
