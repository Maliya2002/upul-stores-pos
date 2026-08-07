import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  date: Date;
  status: string;
  checkIn: Date | null;
  checkOut: Date | null;
}

export function AttendanceCard({ records }: { records: AttendanceRecord[] }) {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Recent Attendance</CardTitle></CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No attendance records.</p>
        ) : (
          <div className="space-y-2">
            {records.slice(0, 10).map((record) => (
              <div key={record.id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm font-medium">{formatDate(record.date)}</span>
                <Badge variant={record.status === "PRESENT" ? "default" : "destructive"} className="text-xs">{record.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}