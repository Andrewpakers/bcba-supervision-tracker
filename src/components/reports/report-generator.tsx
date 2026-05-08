"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchReportData } from "@/app/dashboard/reports/actions";
import type { RBT } from "@/types";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function ReportGenerator({ rbts }: { rbts: RBT[] }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [generating, setGenerating] = useState<string | null>(null);

  function navigateMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    setMonth(newMonth);
    setYear(newYear);
  }

  async function handleGeneratePDF(rbt: RBT) {
    setGenerating(rbt.id);
    try {
      const data = await fetchReportData(rbt.id, month, year);

      // Dynamic import to avoid SSR issues with @react-pdf/renderer
      const { pdf } = await import("@react-pdf/renderer");
      const { SupervisionReport } = await import("./supervision-report");

      const blob = await pdf(
        SupervisionReport({
          bcba: data.profile,
          rbt: data.rbt,
          sessions: data.sessions,
          totalPracticeHours: data.monthlyHours?.total_practice_hours || 0,
          month,
          year,
        })
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `supervision-report-${rbt.full_name.replace(/\s+/g, "-")}-${MONTH_NAMES[month - 1]}-${year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Monthly Reports</h2>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-lg font-medium min-w-[180px] text-center">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {rbts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No active RBTs. Add RBTs first to generate reports.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Generate Report by RBT</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RBT Name</TableHead>
                  <TableHead>Certification #</TableHead>
                  <TableHead className="w-[150px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rbts.map((rbt) => (
                  <TableRow key={rbt.id}>
                    <TableCell className="font-medium">
                      {rbt.full_name}
                    </TableCell>
                    <TableCell>{rbt.certification_number || "—"}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleGeneratePDF(rbt)}
                        disabled={generating === rbt.id}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {generating === rbt.id ? "Generating..." : "Download PDF"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
