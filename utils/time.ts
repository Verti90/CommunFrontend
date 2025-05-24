import { addDays, startOfWeek, endOfWeek, format, isWithinInterval } from 'date-fns';
import moment from 'moment-timezone';

const CENTRAL_TZ = 'America/Chicago';

/**
 * Converts a local date to a UTC ISO string based on fixed Central Time zone.
 * Ensures consistent behavior across environments regardless of user time zone.
 */
export const toCentralUtcISOString = (date: Date): string =>
  moment(date).tz(CENTRAL_TZ).utc().format();

/**
 * Formats a date as 'YYYY-MM-DD' in Central Time for display or backend consistency.
 */
export const formatDateLocal = (date: Date): string =>
  moment(date).tz(CENTRAL_TZ).format('YYYY-MM-DD');

/**
 * Returns the start and end of the week (Sunday to Saturday) for a given date.
 */
export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const base = new Date(date);
  return {
    start: startOfWeek(base, { weekStartsOn: 0 }),
    end: endOfWeek(base, { weekStartsOn: 0 }),
  };
};

/**
 * Returns the specific date for a weekday index (0 = Sunday) within the week of a given reference date.
 */
export const getDateForWeekdayIndex = (reference: Date, index: number): Date =>
  addDays(getWeekRange(reference).start, index);

export const formatTimeDisplay = (isoString: string): string => {
  const date = new Date(isoString);
  return format(date, 'MMMM d, yyyy h:mm a');
};

export const isInTimeBlock = (
  isoString: string,
  selectedDate: Date,
  startHour: number,
  endHour: number
): boolean => {
  const localDateTime = new Date(isoString);

  if (format(localDateTime, 'yyyy-MM-dd') !== format(selectedDate, 'yyyy-MM-dd')) return false;

  const blockStart = new Date(selectedDate);
  blockStart.setHours(startHour, 0, 0, 0);

  const blockEnd = new Date(selectedDate);
  blockEnd.setHours(endHour, 0, 0, 0);

  return localDateTime >= blockStart && localDateTime < blockEnd;
};

/**
 * Converts a UTC or ISO string Date object to the local device time zone.
 * Used when interpreting backend-stored UTC times for frontend display.
 */
export const convertToLocal = (date: Date): Date => {
  if (!date || isNaN(date.getTime())) return new Date('Invalid Date');

  const localString = date.toLocaleString('en-US', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const converted = new Date(localString);
  return isNaN(converted.getTime()) ? new Date('Invalid Date') : converted;
};