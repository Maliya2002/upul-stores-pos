export function cashBalance(opening: number, sales: number[], refunds: number[], movements: { amount: number; direction: string }[]) {
  const cents = (value: number) => Math.round(value * 100);
  return (cents(opening) + sales.reduce((n, v) => n + cents(v), 0)
    - refunds.reduce((n, v) => n + cents(v), 0)
    + movements.reduce((n, v) => n + (v.direction === "IN" ? 1 : -1) * cents(v.amount), 0)) / 100;
}
