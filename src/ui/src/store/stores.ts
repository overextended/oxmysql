import { writable } from "svelte/store";

export const visibility = writable(false);
export const currentResource = writable('');