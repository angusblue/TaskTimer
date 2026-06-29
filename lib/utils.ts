import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceCompact(price: number) {
  if (price >= 1000) {
    return `£${(price / 1000).toFixed(1)}k`;
  }
  return `£${price}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDifficultyLabel(level: number) {
  const labels: Record<number, string> = {
    1: "Beginner",
    2: "Easy",
    3: "Intermediate",
    4: "Advanced",
    5: "Professional",
  };
  return labels[level] ?? "Unknown";
}

export function getDifficultyColor(level: number) {
  if (level <= 2) return "text-green-400";
  if (level === 3) return "text-yellow-400";
  return "text-red-400";
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) + "..." : str;
}
