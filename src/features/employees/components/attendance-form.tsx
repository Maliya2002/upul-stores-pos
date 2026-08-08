"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Clock, Coffee } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { markAttendanceAction } from "../actions/attendance-actions";

interface AttendanceFormProps {
  userId: string;
  userName: string;
}

const statuses = [
  {
    value: "PRESENT" as const,
    label: "Present",
    icon: CheckCircle,
    color: "bg-emerald-500 hover:bg-emerald-600",
  },
  {
    value: "LATE" as const,
    label: "Late",
    icon: Clock,
    color: "bg-amber-500 hover:bg-amber-600",
  },
  {
    value: "HALF_DAY" as const,
    label: "Half Day",
    icon: Coffee,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    value: "ABSENT" as const,
    label: "Absent",
    icon: XCircle,
    color: "bg-red-500 hover:bg-red-600",
  },
  {
    value: "LEAVE" as const,
    label: "Leave",
    icon: Coffee,
    color: "bg-purple-500 hover:bg-purple-600",
  },
];

export function AttendanceForm({ userId, userName }: AttendanceFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleMark = (
    status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "LEAVE"
  ) => {
    startTransition(async () => {
      const result = await markAttendanceAction(userId, status);
      if (result.success) {
        toast.success(`${userName} marked as ${status.toLowerCase()}.`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed.");
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">
          Mark Today&apos;s Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {statuses.map((status, i) => (
            <motion.div
              key={status.value}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Button
                onClick={() => handleMark(status.value)}
                disabled={isPending}
                className={`w-full flex flex-col items-center gap-1 h-auto py-3 text-white ${status.color}`}
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <status.icon className="h-5 w-5" />
                )}
                <span className="text-xs font-bold">{status.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}