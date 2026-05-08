"use client";

import dynamic from "next/dynamic";
import type { RBT, Client, SupervisionSessionWithDetails } from "@/types";

const CalendarView = dynamic(
  () =>
    import("@/components/calendar/calendar-view").then(
      (mod) => mod.CalendarView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center text-muted-foreground">
        Loading calendar...
      </div>
    ),
  }
);

interface Props {
  initialSessions: SupervisionSessionWithDetails[];
  rbts: RBT[];
  clients: Client[];
}

export function CalendarWrapper({ initialSessions, rbts, clients }: Props) {
  return (
    <CalendarView
      initialSessions={initialSessions}
      rbts={rbts}
      clients={clients}
    />
  );
}
