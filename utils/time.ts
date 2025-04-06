// utils/time.ts

import { startOfWeek, endOfWeek, addDays } from 'date-fns';

/**
 * Returns the start and end of the week for a given date.
 * Week starts on Sunday (weekStartsOn: 0).
 */
export const getWeekRange = (date: Date) => ({
  start: startOfWeek(date, { weekStartsOn: 0 }),
  end: endOfWeek(date, { weekStartsOn: 0 }),
});

/**
 * Returns the specific date for a weekday index (0 = Sunday, 6 = Saturday)
 * based on the given week's date.
 */
export const getDateForWeekdayIndex = (date: Date, index: number): Date => {
  return addDays(startOfWeek(date, { weekStartsOn: 0 }), index);
};
