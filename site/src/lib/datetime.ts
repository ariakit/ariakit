export function getUnixTime(date?: Date) {
  return Math.floor((date?.getTime() ?? Date.now()) / 1000);
}
