import { addDays, startOfWeek, endOfWeek } from 'date-fns';

// Get the correct Central Time offset in minutes (handles DST)
function getCentralOffsetMinutes(date: Date): number {
  const janOffset = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const julOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  const isDST = date.getTimezoneOffset() < Math.max(janOffset, julOffset);
  return isDST ? 300 : 360; // 300 min = UTC-5 (DST), 360 min = UTC-6
}

// Convert local date to UTC ISO string, interpreting it as Central Time
export function toCentralUtcISOString(date: Date): string {
  const centralOffset = getCentralOffsetMinutes(date);
  const localOffset = date.getTimezoneOffset();
  const offsetMs = (localOffset - centralOffset) * 60 * 1000;
  const adjustedDate = new Date(date.getTime() + offsetMs);

  console.log(`Original date: ${date}`);
  console.log(`Adjusted date: ${adjustedDate}`);
  console.log(`Day of week: ${date.getDay()}`);
  console.log(`Hour of day: ${date.getHours()}`);

  // Ensure adjustedDate does not cross into the next day for times after 7pm on Saturday
  if (date.getDay() === 6 && date.getHours() >= 19) {
    console.log('Adjusting for Saturday after 7pm');
    adjustedDate.setUTCHours(adjustedDate.getUTCHours() - (localOffset / 60) + (centralOffset / 60));
  }

  console.log(`Final adjusted date: ${adjustedDate}`);
  return adjustedDate.toISOString();
}

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
