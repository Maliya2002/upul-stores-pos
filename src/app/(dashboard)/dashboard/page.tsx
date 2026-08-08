import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/features/dashboard/dashboard-client";
import { getDashboardData } from "@/features/dashboard/dashboard-actions";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getDashboardData();

  const userName =
    (session.user as { name?: string }).name ?? "User";

  return <DashboardClient data={data} userName={userName} />;
}