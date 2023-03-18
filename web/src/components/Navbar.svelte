<script lang="ts">
  import { IconLayoutDashboard, IconLogout, IconSourceCode } from '@tabler/icons-svelte';
  import NavLink from './NavLink.svelte';
</script>

<div class="bg-slate-800 w-[80px] h-full rounded-tl-md rounded-bl-md p-4 flex flex-col justify-between items-center">
  <div class="flex flex-col gap-2">
    <NavLink route="/">
      <IconLayoutDashboard />
    </NavLink>
    <NavLink route="/resources">
      <IconSourceCode />
    </NavLink>
  </div>
  <div
    class="bg-red-500 bg-opacity-30 text-red-500 hover:bg-opacity-40 rounded-md w-[50px] h-[50px] flex justify-center items-center"
  >
    <IconLogout />
  </div>
</div>
