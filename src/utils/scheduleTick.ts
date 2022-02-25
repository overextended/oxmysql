import { resourceName } from '../config';
import { serverReady } from '../database';

export const scheduleTick = async () => {
  if (!serverReady) {
    await new Promise<void>((resolve) => {
      (function wait() {
        if (serverReady) {
          return resolve();
        }
        setTimeout(wait);
      })();
    });
  }

  ScheduleResourceTick(resourceName);
};
