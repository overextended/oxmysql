<script lang="ts">
  import { currentResource } from '../../store/stores';
  import { fetchNui } from '../../utils/fetchNui';
  import { onMount } from 'svelte';

  export let params: { wild: string };

  interface Data {
    [key: string]: number[];
  }

  let queryData: number[];
  let resource: string;

  const debugQueries: Data = {
    ['luke_garages']: [300, 200, 100],
    ['npwd']: [600, 300, 723],
    ['ox_inventory']: [30, 270, 350],
  };

  onMount(() => currentResource.set(params.wild));

  currentResource.subscribe((value) => {
    resource = value;
    fetchNui('getResourceData', resource)
      .then((retData) => {
        queryData = retData;
      })
      .catch((e) => {
        queryData = debugQueries[resource];
      });
  });
</script>

<div>
  {resource}
  {queryData}
</div>
