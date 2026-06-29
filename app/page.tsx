"use client";

import { useCreateMeetingAction } from "@/components/CreateMeeting";
import { formatMeetingDateTime, Meeting } from "@/lib/meetingUtils";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useState } from "react";

export default function HomePage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useCreateMeetingAction(meetings, (meeting) =>
    setMeetings((prev) => [...prev, meeting])
  );

  return (
    <CopilotSidebar
      labels={{
        title: "SchedGen Assistant",
        initial:
          "Hi! Tell me about a call or meeting you'd like to schedule - e.g \"Set up a call with Earl this upcoming Saturday at 3pm.\"",
      }}
    >
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">Your Schedule</h1>

        {meetings.length === 0 ? (
          <p className="text-gray-500">
            No meetings yet - try asking the assistant to schedule one.
          </p>
        ): (
          <ul className="space-y-3">
            {meetings.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm"
              >
                <p className="font-semibold">{m.title}</p>
                <p className="text-sm text-gray-600">
                  {formatMeetingDateTime(m.date, m.time)} · {m.durationMinutes} min
                </p>
                {m.attendees.length > 0 && (
                  <p className="text-sm text-gray-800">
                    With: {m.attendees.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </CopilotSidebar>
  )
}