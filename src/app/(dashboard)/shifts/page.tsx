import { getShifts } from "@/features/shifts/actions";
import { ShiftPanel } from "@/features/shifts/shift-panel";
import { cashBalance } from "@/features/shifts/balance";
import { requireStaff } from "@/lib/authorization";
import Link from "next/link";

export default async function ShiftsPage() {
  const staff = await requireStaff(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);
  const shifts = await getShifts();
  const active = shifts.find(s => !s.closedAt);
  const expected = active ? cashBalance(active.openingCash, active.orders.filter(o => o.paymentMethod === "CASH").map(o => o.total), active.refunds.filter(r => r.method === "CASH").map(r => r.amount), active.movements) : 0;
  const currency = (value: number) => new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(value);
  return <div className="space-y-6">
    {["OWNER", "ADMIN", "MANAGER"].includes(staff.role) && <Link href="/shifts/reconciliation" className="inline-block rounded border px-4 py-2">Review all staff shifts</Link>}
    <div><h1 className="text-2xl font-bold">Cash shifts</h1><p className="text-sm text-muted-foreground">Your drawer activity. Only transactions recorded while your shift is open are included. Cash refunds belong to the staff member recording the return.</p></div>
    <ShiftPanel shiftId={active?.id} openingCash={active?.openingCash ?? 0} expected={expected} />
    {active && <section className="rounded-lg border p-4"><h2 className="font-semibold">Cash movements</h2>{active.movements.length === 0 ? <p>No cash in/out recorded.</p> : <ul className="divide-y">{active.movements.map(m => <li key={m.id} className="flex flex-wrap justify-between gap-2 py-3"><span>{m.direction} · {m.reason}</span><strong>{currency(m.amount)}</strong></li>)}</ul>}</section>}
    <section><h2 className="mb-3 font-semibold">Recent shifts</h2><div className="space-y-3">{shifts.map(s => <article key={s.id} className="rounded-lg border p-4 text-sm space-y-1"><p className="font-semibold">{s.closedAt ? "Closed" : "Open"} · {s.openedAt.toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}</p><p>Opening: {currency(s.openingCash)}</p>{s.closedAt && <><p>Expected: {currency(s.expectedCash ?? 0)} · Counted: {currency(s.countedCash ?? 0)}</p><p>Difference: {currency(s.variance ?? 0)}</p><p>{s.closeNote}</p></>}</article>)}</div></section>
  </div>;
}
