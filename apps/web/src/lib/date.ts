export const toLocalizedIso = (date: Date): string => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .replace(/T.*/, '');
};

export const toEpochSeconds = (date: Date): number => {
  return date.getTime() / 1000;
};
