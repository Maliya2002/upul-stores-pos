"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { openShift, closeShift, recordCashMovement } from "./actions";

export function ShiftPanel({ shiftId, openingCash, expected }: { shiftId?: string; openingCash: number; expected: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const request = useRef<{ signature: string; key: string } | null>(null);
  const [message, setMessage] = useState("");
  const [opening, setOpening] = useState("");
  const [cash, setCash] = useState("");
  const [reason, setReason] = useState("");
  const [counted, setCounted] = useState("");
  const [note, setNote] = useState("");
  function run(kind: "OPEN" | "IN" | "OUT" | "CLOSE") {
    if (busy.current) return;
    const raw = kind === "OPEN" ? opening : kind === "CLOSE" ? counted : cash;
    if (!raw.trim()) { setMessage("Enter the cash amount."); return; }
    const signature = JSON.stringify([kind, shiftId, raw, reason, note]);
    if (request.current && request.current.signature !== signature) { setMessage("Retry the previous request with its original details before changing the amount."); return; }
    request.current ??= { signature, key: crypto.randomUUID() };
    const key = request.current.key;
    busy.current = true;
    startTransition(async () => {
      try {
        const result = kind === "OPEN" ? await openShift(key, Number(raw)) : kind === "CLOSE" ? await closeShift(shiftId!, Number(raw), note) : await recordCashMovement(key, shiftId!, kind, Number(raw), reason);
        // Returned validation errors are definitive; thrown transport errors keep
        // the original key so a retry cannot duplicate a committed movement.
        if (result.success || !result.retryable) request.current = null;
        setMessage(result.success ? "Saved successfully." : result.error);
        if (result.success) { setCash(""); setReason(""); setCounted(""); setNote(""); router.refresh(); }
      } catch { setMessage("Response not received. Keep this page open and retry with the same details. Check the shift history before re-entering a movement after reloading."); }
      finally { busy.current = false; }
    });
  }
  return <div className="space-y-4">
    <p role="status" aria-live="polite">{message}</p>
    {!shiftId ? <section className="space-y-3 rounded-lg border p-4"><h2 className="font-semibold">Open your shift</h2><label className="block">Opening cash (LKR)<Input type="number" min="0" step="0.01" value={opening} onChange={e => setOpening(e.target.value)} disabled={pending} /></label><Button disabled={pending} onClick={() => run("OPEN")}>Open shift</Button></section> : <>
      <div className="grid gap-3 sm:grid-cols-2"><p className="rounded-lg border p-4">Opening cash: LKR {openingCash.toFixed(2)}</p><p className="rounded-lg border p-4">Expected cash: LKR {expected.toFixed(2)}</p></div>
      <section className="space-y-3 rounded-lg border p-4"><h2 className="font-semibold">Cash in / out</h2><p className="text-sm text-muted-foreground">Use for drawer adjustments, not sales or refunds already recorded in POS.</p><label className="block">Amount (LKR)<Input type="number" min="0.01" step="0.01" value={cash} onChange={e => setCash(e.target.value)} disabled={pending} /></label><label className="block">Reason<Input maxLength={500} value={reason} onChange={e => setReason(e.target.value)} disabled={pending} /></label><div className="flex flex-wrap gap-2"><Button disabled={pending} onClick={() => run("IN")}>Cash in</Button><Button disabled={pending} variant="outline" onClick={() => run("OUT")}>Cash out</Button></div></section>
      <section className="space-y-3 rounded-lg border p-4"><h2 className="font-semibold">Close shift</h2><label className="block">Counted cash (LKR)<Input type="number" min="0" step="0.01" value={counted} onChange={e => setCounted(e.target.value)} disabled={pending} /></label><label className="block">Difference explanation / note<Input maxLength={500} value={note} onChange={e => setNote(e.target.value)} disabled={pending} /></label><Button disabled={pending} onClick={() => run("CLOSE")}>Close shift and save count</Button></section>
    </>}
  </div>;
}
