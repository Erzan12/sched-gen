import { addMinutes, areIntervalsOverlapping, format, isValid, parse } from "date-fns";

export interface Meeting {
    id: string;
    title: string;
    date: string; // "yyyy-MM-dd"
    time: string // "HH:mm"
    durationMinutes: number;
    attendees: string[];
    notes?: string;
}

export interface ConflictResult {
    hasConflict: boolean;
    conflictingMeeting?: Meeting;
}

/**
 * Combines a meeting's date + time strings into a real Date object.
 * Returns null if the combination doesn't parse to a valid date.
 */

export function toDateTime(date: string, time: string): Date | null {
    const parsed = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
    return isValid(parsed) ? parsed: null;
}

/**
 * Checks a candidate meeting against an existing list for time overlaps.
 * This is intentionally plain logic — no LLM involvement — so scheduling
 * stays predictable and testable.
 */
export function findConflict(
    candidate: Pick<Meeting, "date" | "time" | "durationMinutes">,
    existingMeetings: Meeting[]
): ConflictResult {
    const candidateStart = toDateTime(candidate.date, candidate.time);
    if (!candidateStart) return { hasConflict: false };

    const candidateEnd = addMinutes(candidateStart, candidate.durationMinutes || 30);

    for (const meeting of existingMeetings) {
        const existingStart = toDateTime(meeting.date, meeting.time);
        if (!existingStart) continue;
        const existingEnd = addMinutes(existingStart, meeting.durationMinutes || 30);

        const overlaps = areIntervalsOverlapping(
            { start: candidateStart, end: candidateEnd },
            { start: existingStart, end: existingEnd }
        );

        if (overlaps) {
            return { hasConflict: true, conflictingMeeting: meeting };
        }
    }

    return { hasConflict: false };
}

/**
 * Friendly display string, e.g. "Tue, Jul 14 2026 · 3:00 PM"
 */
export function formatMeetingDateTime(date: string, time: string): string {
    const dt = toDateTime(date, time);
    if (!dt) return `${date} ${time}`;
    return format(dt, "EEE, MMM d yyyy · h:mm a");
}