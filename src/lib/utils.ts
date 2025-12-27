import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
