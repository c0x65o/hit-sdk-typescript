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
export function parseDate(dateString) {
    if (!dateString)
        return null;
    try {
        // If the string doesn't have timezone info, assume UTC
        if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
            // Handle formats like "2024-01-01 12:00:00" -> "2024-01-01T12:00:00Z"
            if (dateString.includes(' ')) {
                return new Date(dateString.replace(' ', 'T') + 'Z');
            }
            // Handle formats like "2024-01-01T12:00:00" -> "2024-01-01T12:00:00Z"
            if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
                return new Date(dateString + 'Z');
            }
        }
        // Already has timezone info or is a valid format, parse as-is
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return null;
        }
        return date;
    }
    catch {
        return null;
    }
}
/**
 * Format a date as a localized date string (date only, no time).
 * Uses browser's locale and timezone.
 *
 * @example "January 15, 2024"
 */
export function formatDate(dateString, options) {
    const date = typeof dateString === 'string' ? parseDate(dateString) : dateString;
    if (!date)
        return '—';
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
    };
    return date.toLocaleDateString(undefined, defaultOptions);
}
/**
 * Format a date as a localized date and time string.
 * Uses browser's locale and timezone.
 *
 * @example "January 15, 2024 at 3:45 PM"
 */
export function formatDateTime(dateString, options) {
    const date = typeof dateString === 'string' ? parseDate(dateString) : dateString;
    if (!date)
        return '—';
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        ...options,
    };
    return date.toLocaleString(undefined, defaultOptions);
}
/**
 * Format a date as a short date string (compact format).
 * Uses browser's locale and timezone.
 *
 * @example "Jan 15, 2024"
 */
export function formatDateShort(dateString, options) {
    const date = typeof dateString === 'string' ? parseDate(dateString) : dateString;
    if (!date)
        return '—';
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    };
    return date.toLocaleDateString(undefined, defaultOptions);
}
/**
 * Format a date as a time string only (no date).
 * Uses browser's locale and timezone.
 *
 * @example "3:45 PM"
 */
export function formatTime(dateString, options) {
    const date = typeof dateString === 'string' ? parseDate(dateString) : dateString;
    if (!date)
        return '—';
    const defaultOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        ...options,
    };
    return date.toLocaleTimeString(undefined, defaultOptions);
}
/**
 * Format a date as a relative time string (e.g., "2 hours ago", "in 3 days").
 * Uses browser's locale and timezone.
 */
export function formatRelativeTime(dateString, options) {
    const date = typeof dateString === 'string' ? parseDate(dateString) : dateString;
    if (!date)
        return '—';
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const { includeSeconds = false, addSuffix = true } = options || {};
    let value;
    let isPast = diffMs < 0;
    if (diffSeconds < 60 && includeSeconds) {
        value = `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''}`;
    }
    else if (diffMinutes < 60) {
        value = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    }
    else if (diffHours < 24) {
        value = `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }
    else if (diffDays < 7) {
        value = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    else {
        // For older dates, show the actual date
        return formatDateShort(date);
    }
    if (addSuffix) {
        return isPast ? `${value} ago` : `in ${value}`;
    }
    return value;
}
/**
 * Format a date as an ISO string (for API/technical use).
 * Always returns UTC.
 */
export function formatISO(dateString) {
    const date = typeof dateString === 'string' ? parseDate(dateString) : dateString;
    if (!date)
        return '';
    return date.toISOString();
}
/**
 * Get a human-readable date/time string with smart formatting.
 * Shows relative time for recent dates, absolute date/time for older ones.
 * Uses browser's locale and timezone.
 */
export function formatSmart(dateString, options) {
    const date = typeof dateString === 'string' ? parseDate(dateString) : dateString;
    if (!date)
        return '—';
    const { showTime = true, relativeThreshold = 7 } = options || {};
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < relativeThreshold) {
        // Show relative time for recent dates
        return formatRelativeTime(date);
    }
    else {
        // Show absolute date/time for older dates
        return showTime ? formatDateTime(date) : formatDate(date);
    }
}
