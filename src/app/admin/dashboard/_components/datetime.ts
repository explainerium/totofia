/** Date → value for `<input type="datetime-local">` (local time, minutes). */
export function toLocalInput(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
