/**
 * Converts a local Date object to a UTC Date object
 */
export const toUTC = (localDate: Date): Date => {
  const utc = new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
  return utc;
};

/**
 * Converts a UTC date string to a local Date object
 */
export const toLocalTime = (utcDateString: string): Date => {
  const utcDate = new Date(utcDateString);
  const local = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
  return local;
};

/**
 * Formats a local Date object as a string in "h:mm AM/PM" format
 */
export const formatLocalTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

/**
 * Groups a list of activities by local weekday
 */
export const groupByDay = (activities: any[]): Record<string, any[]> => {
  const days: Record<string, any[]> = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };

  activities.forEach((activity) => {
    const localTime = toLocalTime(activity.time);
    const dayName = localTime.toLocaleDateString('en-US', { weekday: 'long' });
    days[dayName].push(activity);
  });

  return days;
};
