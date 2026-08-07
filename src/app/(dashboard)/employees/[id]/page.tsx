import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, ShoppingCart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatusBadge } from "@/components/ui-custom";
import { GradientCard } from "@/components/shared/gradient-card";
import { AttendanceCard } from "@/features/employees/components";
import { getEmployeeById } from "@/features/employees/actions/employee-actions";
import { formatDateTime } from "@/lib/utils";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await getEmployeeById(id);
  if (!employee) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.name}
        badge={employee.role}
        description={employee.email}
        actions={<Link href="/employees"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></Link>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <GradientCard title="Total Sales" value={String(employee._count.orders)} icon={ShoppingCart} gradient="bg-blue-500/10" iconColor="text-blue-500" />
        <GradientCard title="Attendance Records" value={String(employee._count.attendances)} icon={Calendar} gradient="bg-emerald-500/10" iconColor="text-emerald-500" delay={0.1} />
        <GradientCard title="Status" value={employee.isActive ? "Active" : "Inactive"} icon={User} gradient="bg-purple-500/10" iconColor="text-purple-500" delay={0.2} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardContent className="p-5 grid gap-4 sm:grid-cols-2">
            <InfoItem label="Phone" value={employee.phone ?? "-"} />
            <InfoItem label="Role" value={employee.role} />
            <InfoItem label="Last Login" value={employee.lastLogin ? formatDateTime(employee.lastLogin) : "Never"} />
            <InfoItem label="Joined" value={formatDateTime(employee.createdAt)} />
          </CardContent>
        </Card>

        <AttendanceCard records={employee.attendances.map((a: (typeof employee.attendances)[number]) => ({
          id: a.id, date: a.date, status: a.status, checkIn: a.checkIn, checkOut: a.checkOut,
        }))} />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}