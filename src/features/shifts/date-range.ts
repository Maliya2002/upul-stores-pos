/** POS dates use Sri Lanka's current UTC+05:30 offset (since April 2006). */
export function shiftDateRange(from = "", through = ""): {
  error: string | null; openedAt?: { gte?: Date; lt?: Date };
} {
  const valid = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "2007-01-01") return false;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  if ((from && !valid(from)) || (through && !valid(through))) {
    return { error: "Enter valid dates on or after 1 January 2007." };
  }
  if (from && through && from > through) {
    return { error: "Opened from must be on or before Opened through." };
  }
  if (!from && !through) return { error: null };
  return {
    error: null,
    openedAt: {
      ...(from ? { gte: new Date(`${from}T00:00:00+05:30`) } : {}),
      ...(through ? { lt: new Date(new Date(`${through}T00:00:00+05:30`).getTime() + 86400000) } : {}),
    },
  };
}
