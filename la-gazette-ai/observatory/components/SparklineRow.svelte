<script>
  export let label = "Topic";
  export let values = [10, 15, 25, 40, 80, 120, 95, 70, 60];
  export let active = false;

  const maxVal = Math.max(...values, 1);
  const sparkBlocks = [" ", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

  function getChar(val) {
    const idx = Math.min(Math.floor((val / maxVal) * (sparkBlocks.length - 1)), sparkBlocks.length - 1);
    return sparkBlocks[idx];
  }
</script>

<div class="sparkline-row flex items-center justify-between p-3 rounded-lg border {active ? 'border-blue-500 bg-blue-950/20' : 'border-slate-800 bg-slate-900/60'} hover:border-slate-700 transition-all cursor-pointer">
  <span class="text-sm font-medium text-slate-200">{label}</span>
  <span class="font-mono text-blue-400 tracking-wider text-base">
    {#each values as v}
      {getChar(v)}
    {/each}
  </span>
</div>
