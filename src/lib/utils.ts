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
