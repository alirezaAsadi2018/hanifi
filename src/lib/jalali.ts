// Jalali (Persian) calendar helpers built on Intl — no date library needed.

const partsFormat = new Intl.DateTimeFormat("en-US-u-ca-persian", { year: "numeric", month: "numeric", day: "numeric" });
const monthTitleFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "long", year: "numeric" });
const longFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long" });
const shortFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "long" });

export const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export function jalaliParts(date: Date) {
  const parts = partsFormat.formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** First day of the Jalali month containing `date`, shifted by `offset` months. */
export function jalaliMonthStart(date: Date, offset = 0) {
  let first = addDays(startOfDay(date), 1 - jalaliParts(date).day);
  for (let i = 0; i < Math.abs(offset); i += 1) {
    first = offset > 0 ? addDays(first, 32) : addDays(first, -1);
    first = addDays(first, 1 - jalaliParts(first).day);
  }
  return first;
}

/** Days of a Jalali month plus the number of blank cells before day 1 (week starts Saturday). */
export function jalaliMonth(date: Date, offset = 0) {
  const first = jalaliMonthStart(date, offset);
  const month = jalaliParts(first).month;
  const days: Date[] = [];
  for (let day = first; jalaliParts(day).month === month; day = addDays(day, 1)) days.push(day);
  return { title: monthTitleFormat.format(first), leading: (first.getDay() + 1) % 7, days };
}

export const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();
export const formatJalaliLong = (date: Date) => longFormat.format(date);
export const formatJalaliShort = (date: Date) => shortFormat.format(date);
export const formatJalaliDay = (date: Date) => jalaliParts(date).day.toLocaleString("fa-IR");
