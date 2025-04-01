import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string to WIB (UTC+7) time
 * @param dateString - The date string to format
 * @returns Formatted time string in WIB timezone
 */
export function formatToWIBTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    // Create a date string with the UTC+7 offset for WIB timezone
    // First get UTC time in milliseconds
    const utcTime = date.getTime();
    // Add 7 hours (7 * 60 * 60 * 1000 milliseconds)
    const wibTime = new Date(utcTime + 7 * 60 * 60 * 1000);

    // Format time to show in 24-hour format
    return wibTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    return "Invalid date";
  }
}

/**
 * Formats a date string to show date and days elapsed
 * @param dateString - The date string to format
 * @returns Object with formatted date and days elapsed
 */
export function formatJoinDate(dateString: string): {
  formattedDate: string;
  daysElapsed: string;
} {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return { formattedDate: "Invalid date", daysElapsed: "" };
    }

    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${String(date.getFullYear()).slice(2)}`;
    const daysElapsed = `${diffDays} ${diffDays === 1 ? "day" : "days"}`;

    return { formattedDate, daysElapsed };
  } catch (error) {
    return { formattedDate: "Invalid date", daysElapsed: "" };
  }
}
