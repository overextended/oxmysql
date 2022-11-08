import { resourceName } from '../config';

export async function scheduleTick() {
  ScheduleResourceTick(resourceName);
}
