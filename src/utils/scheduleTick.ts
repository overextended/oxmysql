const resourceName = GetCurrentResourceName();

export async function scheduleTick() {
  ScheduleResourceTick(resourceName);
}
