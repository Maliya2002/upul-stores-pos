import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireStaff } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStaff();
  return <DashboardLayout>{children}</DashboardLayout>;
}
