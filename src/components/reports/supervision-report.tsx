import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Profile, RBT } from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#333",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerLabel: {
    fontFamily: "Helvetica-Bold",
  },
  summary: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  clientSection: {
    marginBottom: 16,
  },
  clientHeader: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    backgroundColor: "#e0e0e0",
    padding: 6,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 4,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  colDate: { width: "18%" },
  colStart: { width: "14%" },
  colEnd: { width: "14%" },
  colDuration: { width: "14%" },
  colNotes: { width: "40%" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
  },
  metLabel: {
    color: "#16a34a",
    fontFamily: "Helvetica-Bold",
  },
  notMetLabel: {
    color: "#dc2626",
    fontFamily: "Helvetica-Bold",
  },
});

interface SessionWithClient {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  notes: string | null;
  clients: { full_name: string };
}

interface ReportProps {
  bcba: Profile | null;
  rbt: RBT | null;
  sessions: SessionWithClient[];
  totalPracticeHours: number;
  month: number;
  year: number;
}

export function SupervisionReport({
  bcba,
  rbt,
  sessions,
  totalPracticeHours,
  month,
  year,
}: ReportProps) {
  const requiredHours = Number(totalPracticeHours) * 0.05;
  const totalSupervised = sessions.reduce(
    (sum, s) => sum + Number(s.duration_hours),
    0
  );
  const remaining = Math.max(0, requiredHours - totalSupervised);

  // Group sessions by client
  const sessionsByClient: Record<string, SessionWithClient[]> = {};
  for (const session of sessions) {
    const clientName = session.clients.full_name;
    if (!sessionsByClient[clientName]) {
      sessionsByClient[clientName] = [];
    }
    sessionsByClient[clientName].push(session);
  }

  function formatTime(time: string) {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  }

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Supervision Report</Text>
          <View style={styles.headerRow}>
            <Text>
              <Text style={styles.headerLabel}>BCBA: </Text>
              {bcba?.full_name || "N/A"}
              {bcba?.certification_number
                ? ` (${bcba.certification_number})`
                : ""}
            </Text>
          </View>
          <View style={styles.headerRow}>
            <Text>
              <Text style={styles.headerLabel}>RBT: </Text>
              {rbt?.full_name || "N/A"}
              {rbt?.certification_number
                ? ` (${rbt.certification_number})`
                : ""}
            </Text>
          </View>
          <View style={styles.headerRow}>
            <Text>
              <Text style={styles.headerLabel}>Period: </Text>
              {MONTH_NAMES[month - 1]} {year}
            </Text>
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>
              <Text style={styles.headerLabel}>Total Practice Hours: </Text>
              {Number(totalPracticeHours).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>
              <Text style={styles.headerLabel}>
                Required Supervision (5%):{" "}
              </Text>
              {requiredHours.toFixed(2)} hours
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>
              <Text style={styles.headerLabel}>
                Total Supervision Provided:{" "}
              </Text>
              {totalSupervised.toFixed(2)} hours
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>
              <Text style={styles.headerLabel}>Status: </Text>
              <Text style={remaining > 0 ? styles.notMetLabel : styles.metLabel}>
                {remaining > 0
                  ? `${remaining.toFixed(2)} hours remaining`
                  : "Requirement met"}
              </Text>
            </Text>
          </View>
        </View>

        {Object.entries(sessionsByClient).map(
          ([clientName, clientSessions]) => (
            <View key={clientName} style={styles.clientSection}>
              <Text style={styles.clientHeader}>Client: {clientName}</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.colDate}>Date</Text>
                <Text style={styles.colStart}>Start</Text>
                <Text style={styles.colEnd}>End</Text>
                <Text style={styles.colDuration}>Duration</Text>
                <Text style={styles.colNotes}>Notes</Text>
              </View>
              {clientSessions.map((session) => (
                <View style={styles.tableRow} key={session.id}>
                  <Text style={styles.colDate}>{session.session_date}</Text>
                  <Text style={styles.colStart}>
                    {formatTime(session.start_time)}
                  </Text>
                  <Text style={styles.colEnd}>
                    {formatTime(session.end_time)}
                  </Text>
                  <Text style={styles.colDuration}>
                    {Number(session.duration_hours).toFixed(2)}h
                  </Text>
                  <Text style={styles.colNotes}>
                    {session.notes || "—"}
                  </Text>
                </View>
              ))}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 4,
                }}
              >
                <Text style={styles.headerLabel}>
                  Subtotal:{" "}
                  {clientSessions
                    .reduce((sum, s) => sum + Number(s.duration_hours), 0)
                    .toFixed(2)}
                  h
                </Text>
              </View>
            </View>
          )
        )}

        {sessions.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 40, color: "#999" }}>
            No supervision sessions recorded for this period.
          </Text>
        )}

        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()} — BCBA Supervision
          Tracker
        </Text>
      </Page>
    </Document>
  );
}
