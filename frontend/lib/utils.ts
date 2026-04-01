import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * STRATEGIC TEMPORAL SYNC:
 * Synchronizes all mission readouts with Indian Standard Time (IST) 
 * or the user's primary operational locale.
 */
export function formatToIST(date: string | Date | number, includeTime = true) {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      ...(includeTime ? {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      } : {})
    }).format(d);
  } catch (err) {
    return "INVALID_STAMP";
  }
}

export function getCurrentISTTime() {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}
