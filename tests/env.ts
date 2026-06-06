/**
 * Defines minimal FXServer native and global stubs so oxmysql can run in a
 * standalone environment.
 */

const noop = () => {};
const g = global as any;

g.GetConvar = (name: string, value: string) => value;
g.GetConvarInt = (name: string, value: number) => value;
g.GetCurrentResourceName = () => '';
g.GetInvokingResource = () => '';
g.ScheduleResourceTick = noop;
g.GetResourceMetadata = noop;
g.RegisterCommand = noop;
g.on = noop;
g.onNet = noop;
g.TriggerEvent = noop;
g.exports = {
  oxmysql: await import('../src').then((m) => m.default),
};

export {};
