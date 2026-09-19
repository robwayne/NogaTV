import { LOCK } from "@/data/content";

/**
 * Is the birthday window open right now? The window starts on the birthday
 * and runs for LOCK.openDays days, every year, in the viewer's own timezone.
 */
export function windowIsOpen(now = new Date()): boolean {
  const start = new Date(now.getFullYear(), LOCK.month - 1, LOCK.day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + LOCK.openDays);

  if (now >= start && now < end) return true;

  // A window that runs past New Year also counts for the year before.
  const previous = new Date(start);
  previous.setFullYear(start.getFullYear() - 1);
  const previousEnd = new Date(previous);
  previousEnd.setDate(previousEnd.getDate() + LOCK.openDays);
  return now >= previous && now < previousEnd;
}

/** When it next opens, for the "come back on" line. */
export function nextOpening(now = new Date()): Date {
  const thisYear = new Date(now.getFullYear(), LOCK.month - 1, LOCK.day);
  thisYear.setHours(0, 0, 0, 0);
  if (thisYear > now) return thisYear;
  const nextYear = new Date(thisYear);
  nextYear.setFullYear(thisYear.getFullYear() + 1);
  return nextYear;
}

export function checkPassword(input: string): boolean {
  return input.trim().toLowerCase() === LOCK.password.trim().toLowerCase();
}
