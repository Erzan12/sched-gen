"use client";

import { findConflict, Meeting } from "@/lib/meetingUtils";
import { useCopilotAction } from "@copilotkit/react-core";
import MeetingCard from "./MeetingCard";

export function useCreateMeetingAction(
    existingMeetings: Meeting[],
    onMeetingCreated: (meeting: Meeting) => void
) {
    useCopilotAction({
        name: "createMeeting",
        description: 
            "Create a meeting or call on the user's schedule. Always ask for any missing required field (title, date, time) rather than guessing.",
        parameters: [
            {
                name: "title",
                type: "string",
                description: "Short title for the meeting, e.g. 'Call with Earl",
                required: true,
            },
            {
                name: "date",
                type: "string",
                description: "Meeting date in yyyy-MM-dd format",
                required: true,
            },
            {
                name: "time",
                type: "string",
                description: "Meeting start time in 24h HH:m format",
                required: true,
            },
            {
                name: "durationMinutes",
                type: "number",
                description: "Duration in minutes, default 30 if not specified",
                required: false,
            },
            {
                name: "attendees",
                type: "string[]",
                description: "Names or emails of people invited",
                required: false,
            },
            {
                name: "notes",
                type: "string",
                description: "Optional agenda or notes for the meeting",
                required: false,
            },
        ],
        render: ({ status, args, result }) => {
            const draft = {
                title: args.title,
                date: args.date,
                time: args.time,
                attendees: args.attendees,
                notes: args.notes
            };

            if (status === "executing" || status === "inProgress") {
                return <MeetingCard meeting={draft} status="generating" />
            }

            if (status === "complete" && result) {
                if (result.conflict) {
                    return (
                        <MeetingCard
                            meeting={draft}
                            status="conflict"
                            conflictWith={result.conflict}
                        />
                    );
                }
                return <MeetingCard meeting={result.meeting} status="confirmed"/>
            }

            return <MeetingCard meeting={draft} status="generating"/>
        },

        handler: async ({ title, date, time, durationMinutes, attendees, notes }) => {
            const candidate = {
                date,
                time,
                durationMinutes: durationMinutes || 30,
            };

            const conflictCheck = findConflict(candidate, existingMeetings);

            if (conflictCheck.hasConflict) {
                return {
                    conflict: conflictCheck.conflictingMeeting,
                    message: `This overlaps with "${conflictCheck.conflictingMeeting?.title}". Want me to pick a different time?`
                };
            }

            const newMeeting: Meeting = {
                id: crypto.randomUUID(),
                title,
                date,
                time,
                durationMinutes: durationMinutes || 30,
                attendees: attendees || [],
                notes,
            };

            onMeetingCreated(newMeeting);

            return {
                meeting: newMeeting,
                message: `Scheduled "${title}" successfully.`,
            };
        },
    });
}