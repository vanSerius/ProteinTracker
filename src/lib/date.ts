import { format, startOfDay, subDays, isSameDay } from 'date-fns';

export function todayISO(d: Date = new Date()): string {
  return format(startOfDay(d), 'yyyy-MM-dd');
}

export function lastNDates(n: number, end: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(todayISO(subDays(end, i)));
  return out;
}

export function isToday(iso: string): boolean {
  return isSameDay(new Date(iso), new Date());
}

export function shortDay(iso: string): string {
  return format(new Date(iso), 'EEE');
}

export function shortDate(iso: string): string {
  return format(new Date(iso), 'd MMM');
}
