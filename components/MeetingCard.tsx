"use client";

import { formatMeetingDateTime, Meeting } from "@/lib/meetingUtils";

interface MeetingCardProps {
    meeting: Partial<Meeting>;
    status: "generating" | "conflict" | "confirmed";
    conflictWith?: Meeting;
}

/**
 * Generative UI piece: CopilotKit calls this via the `render` prop of
 * useCopilotAction. It re-renders on every partial update as the LLM
 * streams in args (title -> date -> time -> attendees -> notes), so the
 * user visually sees the meeting "build itself" before confirming.
 */
export default function MeetingCard({ meeting, status, conflictWith }: MeetingCardProps) {
    const isReady = meeting.title && meeting.date && meeting.time;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 max-w-sm space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                    {meeting.title || "Untitle meeting..."}
                </h3>
                <StatusBadge status={status}/>
            </div>

            {isReady && (
                <p className="text-sm text-gray-600">
                    {formatMeetingDateTime(meeting.date!, meeting.time!)}
                </p>
            )}

            {meeting.attendees && meeting.attendees.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {meeting.attendees.map((a) => (
                        <span
                            key={a}
                            className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5"
                        >
                            {a}
                        </span>
                    ))}
                </div>
            )}

            {meeting.notes && (
                <p className="text-sm text-gray-500 italic">{meeting.notes}</p>
            )}

            {status === "conflict" && conflictWith && (
                <p className="text-sm text-red-600">
                    ⚠️ Overlaps with "{conflictWith.title}" at{" "}
                    {formatMeetingDateTime(conflictWith.date, conflictWith.time)}
                </p>
            )}
        </div>    
    );
}

function StatusBadge({ status }: { status: MeetingCardProps["status"] }) {
    const styles: Record<MeetingCardProps["status"], string> = {
        generating: "bg-yellow-100 text-yellow-800",
        conflict: "bg-red-100 text-red-800",
        confirmed: "bg-green-100 text-green-800",
    };
    const labels: Record<MeetingCardProps["status"], string> = {
        generating: "Darfting...",
        conflict: "Conflict",
        confirmed: "Confirmed",
    };
    return (
        <span className={`text-xs rounded-full px-2 py-0.5 ${styles[status]}`}>
            {labels[status]}
        </span>
    )
}