export function parseDate(value: string) {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day,
  );
}

export function formatMonth(value: string) {
  return parseDate(value).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );
}

export function formatDay(value: string) {
  return parseDate(value)
    .getDate()
    .toString()
    .padStart(2, "0");
}

export function formatShortMonth(value: string) {
  return parseDate(value)
    .toLocaleDateString(
      "en-US",
      {
        month: "short",
      },
    )
    .toUpperCase();
}

export function formatFullDate(value: string) {
  return parseDate(value).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}