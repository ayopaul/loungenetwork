export function getCurrentShow(schedule: any[]) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return schedule.find((slot) => {
    const [startH, startM] = slot.startTime.split(":").map(Number);
    const [endH, endM] = slot.endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  });
}
