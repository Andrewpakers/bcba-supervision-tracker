"use client";

import { useState, useCallback, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import { Button } from "@/components/ui/button";
import { SessionForm } from "@/components/sessions/session-form";
import { updateSession } from "@/app/dashboard/calendar/actions";
import type { RBT, Client, SupervisionSession, SupervisionSessionWithDetails } from "@/types";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

interface CalendarViewProps {
  initialSessions: SupervisionSessionWithDetails[];
  rbts: RBT[];
  clients: Client[];
}

export function CalendarView({ initialSessions, rbts, clients }: CalendarViewProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SupervisionSession | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>("");
  const [defaultStartTime, setDefaultStartTime] = useState<string>("");
  const [defaultEndTime, setDefaultEndTime] = useState<string>("");
  const [sessions, setSessions] = useState(initialSessions);

  const supabase = useMemo(() => createClient(), []);

  const events = sessions.map((s) => ({
    id: s.id,
    title: `${s.rbts.full_name} - ${s.clients.full_name}`,
    start: `${s.session_date}T${s.start_time}`,
    end: `${s.session_date}T${s.end_time}`,
    extendedProps: {
      rbt_id: s.rbt_id,
      client_id: s.client_id,
      notes: s.notes,
      session_date: s.session_date,
      start_time: s.start_time,
      end_time: s.end_time,
    },
  }));

  const refreshSessions = useCallback(async () => {
    const { data } = await supabase
      .from("supervision_sessions")
      .select("*, rbts(full_name), clients(full_name)")
      .order("session_date", { ascending: true });
    if (data) setSessions(data as SupervisionSessionWithDetails[]);
  }, [supabase]);

  function handleDateSelect(selectInfo: DateSelectArg) {
    const startDate = selectInfo.start;
    const endDate = selectInfo.end;

    setDefaultDate(format(startDate, "yyyy-MM-dd"));

    if (selectInfo.allDay) {
      setDefaultStartTime("09:00");
      setDefaultEndTime("10:00");
    } else {
      setDefaultStartTime(format(startDate, "HH:mm"));
      setDefaultEndTime(format(endDate, "HH:mm"));
    }

    setEditingSession(null);
    setFormOpen(true);
    selectInfo.view.calendar.unselect();
  }

  function handleEventClick(clickInfo: EventClickArg) {
    const props = clickInfo.event.extendedProps;
    setEditingSession({
      id: clickInfo.event.id,
      bcba_id: "",
      rbt_id: props.rbt_id,
      client_id: props.client_id,
      session_date: props.session_date,
      start_time: props.start_time,
      end_time: props.end_time,
      duration_hours: 0,
      notes: props.notes,
      created_at: "",
      updated_at: "",
    });
    setFormOpen(true);
  }

  async function handleEventDrop(dropInfo: EventDropArg) {
    const event = dropInfo.event;
    const start = event.start;
    const end = event.end;

    if (!start || !end) {
      dropInfo.revert();
      return;
    }

    try {
      await updateSession(event.id, {
        session_date: format(start, "yyyy-MM-dd"),
        start_time: format(start, "HH:mm:ss"),
        end_time: format(end, "HH:mm:ss"),
      });
      await refreshSessions();
      toast.success("Session rescheduled");
    } catch {
      dropInfo.revert();
      toast.error("Failed to reschedule");
    }
  }

  function handleAddNew() {
    setEditingSession(null);
    setDefaultDate(format(new Date(), "yyyy-MM-dd"));
    setDefaultStartTime("");
    setDefaultEndTime("");
    setFormOpen(true);
  }

  // Use a key to force re-mount of the form when switching between edit/create
  const formKey = editingSession?.id ?? `new-${defaultDate}-${defaultStartTime}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
          }}
          events={events}
          editable={true}
          selectable={true}
          selectMirror={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          height="auto"
          eventDisplay="block"
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
        />
      </div>

      <SessionForm
        key={formKey}
        session={editingSession}
        rbts={rbts}
        clients={clients}
        defaultDate={defaultDate}
        defaultStartTime={defaultStartTime}
        defaultEndTime={defaultEndTime}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={refreshSessions}
      />
    </div>
  );
}
