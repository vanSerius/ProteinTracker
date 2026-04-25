export function grams(n: number): string {
  return `${Math.round(n)} g`;
}

export function timeAgo(ts: number, now: number = Date.now()): string {
  const diffMs = now - ts;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export function clockTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
