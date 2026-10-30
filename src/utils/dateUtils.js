// Date-only storage keys represent calendar days, not UTC timestamps.
export const parseLocalDate = (date) =>
  new Date(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00` : date);
