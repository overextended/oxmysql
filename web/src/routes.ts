import Dashboard from './pages/dashboard/Dashboard.svelte';
import Resources from './pages/resources/Resources.svelte';
import type { RouteDefinition } from 'svelte-spa-router';

export const routes: RouteDefinition = {
  '/': Dashboard,

  '/resources': Resources,
};
