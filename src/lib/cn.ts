import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind class names, deduplicating conflicting utilities.
 * Use everywhere we conditionally apply Tailwind classes.
 *
 *   cn('px-2', condition && 'px-4', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
