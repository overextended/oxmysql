const resourceName = GetCurrentResourceName();

const isGameEnhanced = GetConvar('gamename', 'gta5') === 'gta5enhanced';

export async function scheduleTick() {
  if (isGameEnhanced) return;

  ScheduleResourceTick(resourceName);
}
