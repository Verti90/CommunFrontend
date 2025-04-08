import { addDays, startOfWeek, endOfWeek } from 'date-fns';
import moment from 'moment-timezone';

// Converts local Central time to a UTC ISO string
export const toCentralUtcISOString = (localDate: Date): string => {
  return moment(localDate).tz('America/Chicago').utc().format();
};

// Get start and end of the week (Sunday to Saturday) for a given date
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return { start, end };
}

// Get the actual date for a specific weekday index (0 = Sunday)
export function getDateForWeekdayIndex(reference: Date, index: number): Date {
  const { start } = getWeekRange(reference);
  return addDays(start, index);
}