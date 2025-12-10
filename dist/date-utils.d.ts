/**
 * Global date/time formatting utilities
 *
 * All functions automatically use the browser's local timezone for display.
 * Dates from the API are assumed to be in UTC/ISO format.
 */
/**
 * Parse a date string from the API (UTC) to a JavaScript Date object.
 * Handles various date formats and ensures proper UTC interpretation.
 */
export declare function parseDate(dateString: string | null | undefined): Date | null;
/**
 * Format a date as a localized date string (date only, no time).
 * Uses browser's locale and timezone.
 *
 * @example "January 15, 2024"
 */
export declare function formatDate(dateString: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string;
/**
 * Format a date as a localized date and time string.
 * Uses browser's locale and timezone.
 *
 * @example "January 15, 2024 at 3:45 PM"
 */
export declare function formatDateTime(dateString: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string;
/**
 * Format a date as a short date string (compact format).
 * Uses browser's locale and timezone.
 *
 * @example "Jan 15, 2024"
 */
export declare function formatDateShort(dateString: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string;
/**
 * Format a date as a time string only (no date).
 * Uses browser's locale and timezone.
 *
 * @example "3:45 PM"
 */
export declare function formatTime(dateString: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string;
/**
 * Format a date as a relative time string (e.g., "2 hours ago", "in 3 days").
 * Uses browser's locale and timezone.
 */
export declare function formatRelativeTime(dateString: string | Date | null | undefined, options?: {
    includeSeconds?: boolean;
    addSuffix?: boolean;
}): string;
/**
 * Format a date as an ISO string (for API/technical use).
 * Always returns UTC.
 */
export declare function formatISO(dateString: string | Date | null | undefined): string;
/**
 * Get a human-readable date/time string with smart formatting.
 * Shows relative time for recent dates, absolute date/time for older ones.
 * Uses browser's locale and timezone.
 */
export declare function formatSmart(dateString: string | Date | null | undefined, options?: {
    showTime?: boolean;
    relativeThreshold?: number;
}): string;
//# sourceMappingURL=date-utils.d.ts.map