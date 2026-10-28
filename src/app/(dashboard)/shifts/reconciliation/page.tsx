import Link from "next/link";
import { getShiftReconciliation } from "@/features/shifts/reconciliation";

const currency = (value: number) => new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(value);
const date = (value: Date) => value.toLocaleString("en-LK", { timeZone: "Asia/Colombo" });

export default async function ReconciliationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const status = typeof params.status === "string" && ["open", "closed", "difference"].includes(params.status) ? params.status : "all";
  const cashierId = typeof params.cashierId === "string" ? params.cashierId : "";
  const data = await getShiftReconciliation({ status, cashierId, page: Number(params.page) });
  const pageUrl = (page: number) => `/shifts/reconciliation?${new URLSearchParams({ status, cashierId, page: String(page) })}`;
  return <div className="space-y-6">
    <header className="space-y-2"><Link href="/shifts" className="text-sm underline">My cash shifts</Link><h1 className="text-2xl font-bold">Shift reconciliation</h1><p className="text-sm text-muted-foreground">Review all staff drawers. Closed shifts show the saved closing balance. Times are Asia/Colombo.</p></header>
    <form key={`${status}:${cashierId}`} className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
      <label className="flex min-w-0 flex-col gap-1">Status<select name="status" defaultValue={status} className="h-10 rounded border bg-background px-3"><option value="all">All shifts</option><option value="open">Open</option><option value="closed">Closed</option><option value="difference">Cash difference</option></select></label>
      <label className="flex min-w-0 max-w-full flex-col gap-1">Cashier<select name="cashierId" defaultValue={cashierId} className="h-10 max-w-full rounded border bg-background px-3"><option value="">All staff</option>{data.cashiers.map(c => <option key={c.id} value={c.id}>{c.name}{c.isActive ? "" : " (inactive)"}</option>)}</select></label>
      <button type="submit" className="h-10 rounded bg-primary px-4 text-primary-foreground">Apply filters</button><Link href="/shifts/reconciliation" className="p-2 underline">Reset</Link>
    </form>
    <p className="text-sm">{data.count} matching shifts · Page {data.page} of {data.pages}</p>
    {data.shifts.length === 0 && <p className="rounded-lg border p-6">No shifts match these filters.</p>}
    <div className="space-y-4">{data.shifts.map(s => <article key={s.id} className="min-w-0 space-y-3 rounded-lg border p-4">
      <header className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold break-words">{s.cashier.name}</h2><span>{s.closedAt ? "Closed" : "Open"}{s.closedAt && s.variance !== 0 ? (s.variance! < 0 ? " · Shortage" : " · Overage") : ""}</span></header>
      <p className="text-sm">Opened {date(s.openedAt)}{s.closedAt ? ` · Closed ${date(s.closedAt)}` : ""}</p>
      <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">{[
        ["Opening cash", s.openingCash], ["Cash sales", s.cashSales], ["Cash refunds", s.cashRefunds], ["Cash in", s.cashIn], ["Cash out", s.cashOut], [s.closedAt ? "Expected at close" : "Current expected cash", s.expected], ["Counted cash", s.countedCash], ["Difference", s.variance],
      ].map(([label, value]) => <div key={label as string}><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold">{value === null ? "—" : currency(value as number)}</dd></div>)}</dl>
      {s.closeNote && <p className="break-words text-sm">Closing note: {s.closeNote}</p>}
      <details className="border-t pt-3"><summary className="cursor-pointer font-medium">Drawer details</summary><div className="space-y-3 pt-3 text-sm"><p>Non-cash sales: {currency(s.nonCashSales)} (excluded from drawer cash)</p><p className="break-all text-muted-foreground">Shift reference: {s.id}</p>{s.movements.length ? <ul className="divide-y">{s.movements.map(m => <li key={m.id} className="space-y-1 py-2"><p>{date(m.createdAt)} · Cash {m.direction.toLowerCase()} · {currency(m.amount)}</p><p className="break-words">{m.reason}</p></li>)}</ul> : <p>No cash adjustments recorded.</p>}</div></details>
    </article>)}</div>
    <nav aria-label="Shift history pages" className="flex flex-wrap gap-4">{data.page > 1 && <Link href={pageUrl(data.page - 1)} className="rounded border px-4 py-2">Previous</Link>}{data.page < data.pages && <Link href={pageUrl(data.page + 1)} className="rounded border px-4 py-2">Next</Link>}</nav>
    <p className="text-sm text-muted-foreground">Only transactions assigned to a shift are included. Cash refunds belong to the staff member who recorded the return. This view is read-only; cash differences remain in the audit trail.</p>
  </div>;
}
