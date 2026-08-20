export function getISTTimestamp() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const result = {};

  for (const part of parts) {
    result[part.type] = part.value;
  }

  return {
    date: `${result.year}-${result.month}-${result.day}`,
    time: `${result.hour}-${result.minute}-${result.second}`,
    readable: `${result.year}-${result.month}-${result.day} ${result.hour}:${result.minute}:${result.second} IST`,
  };
}
