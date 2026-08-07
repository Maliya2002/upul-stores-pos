import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-custom";
import { getEmployees } from "@/features/employees/actions/employee-actions";
import { EmployeesTable, type EmployeeRow } from "@/features/employees/components";

export default async function EmployeesPage() {
  const employees = await getEmployees();

  const rows: EmployeeRow[] = employees.map((e: (typeof employees)[number]) => ({
    id: e.id, name: e.name, email: e.email, role: e.role, phone: e.phone ?? "-", orders: e._count.orders, isActive: e.isActive,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" badge={`${rows.length}`} description="Manage staff, attendance and salaries." />
      <Card><CardContent className="p-5"><EmployeesTable data={rows} /></CardContent></Card>
    </div>
  );
}