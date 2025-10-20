export function isValidDate(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return false;
  
  const year = date.getFullYear();
  return year >= 1900 && year <= 2100;
}

export function safeFormatDate(
  dateString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!isValidDate(dateString)) return '';
  
  const date = new Date(dateString!);
  return date.toLocaleDateString('ru-RU', options || {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function safeDateCompare(
  dateA: string | null | undefined,
  dateB: string | null | undefined
): number {
  const validA = isValidDate(dateA);
  const validB = isValidDate(dateB);
  
  if (!validA && !validB) return 0;
  if (!validA) return 1;
  if (!validB) return -1;
  
  return new Date(dateB!).getTime() - new Date(dateA!).getTime();
}

export function filterValidDates<T>(
  items: T[],
  dateKey: keyof T
): T[] {
  return items.filter(item => isValidDate(item[dateKey] as any));
}
