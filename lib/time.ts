export function formatTime(time: string) {
  const [hour, minute] = time.split(':');
  return `${hour}:${minute}`;
}
