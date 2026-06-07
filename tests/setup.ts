import './helpers/db';

const g = globalThis as any;
const noop = () => {};

globalThis.setInterval = (() => 0 as any) as typeof setInterval;

const convars: Record<string, string> = {};

const commands: Record<string, Function> = {};
const netHandlers: Record<string, Function> = {};
let emitNetCalls: any[][] = [];

export function setConvar(name: string, value: string | number | boolean) {
  convars[name] = String(value);
}
export function clearConvars() {
  for (const key of Object.keys(convars)) delete convars[key];
}
export function getCommand(name: string) {
  return commands[name];
}
export function getNetHandler(name: string) {
  return netHandlers[name];
}
export function getEmitNetCalls() {
  return emitNetCalls;
}

export function resetNatives() {
  clearConvars();
  emitNetCalls = [];

  g.GetConvar = (name: string, fallback: string) => convars[name] ?? fallback;
  g.GetConvarInt = (name: string, fallback: number) =>
    convars[name] !== undefined ? parseInt(convars[name], 10) : fallback;
  g.SetConvar = (name: string, value: string) => setConvar(name, value);

  g.GetCurrentResourceName = () => 'oxmysql';
  g.GetInvokingResource = () => 'test-resource';
  g.GetResourceState = () => 'started';
  g.GetResourceMetadata = () => undefined;

  g.ScheduleResourceTick = noop;
  g.LoadResourceFile = () => '';

  g.RegisterCommand = (name: string, handler: Function) => (commands[name] = handler);
  g.on = noop;
  g.onNet = (name: string, handler: Function) => (netHandlers[name] = handler);
  g.emitNet = (...args: any[]) => emitNetCalls.push(args);
  g.TriggerEvent = noop;
  g.IsPlayerAceAllowed = () => false;

  g.source = 0;

  g.exports = {};
}

resetNatives();

export {};
