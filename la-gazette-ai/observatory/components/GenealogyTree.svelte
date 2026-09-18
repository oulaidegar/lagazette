<script>
  export let lawTitle = "قانون مكافحة تبييض الأموال وتمويل الإرهاب (رقم ٤٤ / ٢٠١٥)";
  export let items = [
    { type: "amended_by", code: "قانون ٥٥ / ٢٠١٦", title: "تبادل المعلومات الضريبية", year: 2016 },
    { type: "referenced_by", code: "مرسوم ١٠٢٤ / ٢٠١٨", title: "معايير الامتثال والشفافية المالية", year: 2018 },
    { type: "implemented_by", code: "قرار ٧٨١ / ٢٠١٩", title: "إجراءات هيئة التحقيق الخاصة", year: 2019 },
    { type: "amended_by", code: "قانون ١٨٩ / ٢٠٢٠", title: "التصريح عن الذمة المالية ومكافحة الإثراء غير المشروع", year: 2020 }
  ];
</script>

<div class="genealogy-tree bg-slate-900 border border-slate-800 rounded-xl p-6 font-sans">
  <div class="root-node border-2 border-blue-500 bg-blue-950/40 p-4 rounded-lg text-white font-bold mb-6 flex items-center justify-between">
    <div>
      <span class="text-xs text-blue-400 block font-mono">ROOT INSTRUMENT</span>
      <h3 class="text-lg mt-1">{lawTitle}</h3>
    </div>
    <span class="px-3 py-1 bg-blue-600/30 text-blue-300 text-xs rounded-full border border-blue-500/30">2015</span>
  </div>

  <div class="branches space-y-4 border-r-2 border-slate-700 pr-6 mr-4">
    {#each items as item}
      <div class="branch-item flex items-start justify-between bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-0.5 rounded font-mono {item.type === 'amended_by' ? 'bg-amber-500/20 text-amber-300' : item.type === 'implemented_by' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'}">
              {item.type.replace('_', ' ').toUpperCase()}
            </span>
            <span class="text-sm font-semibold text-slate-200">{item.code}</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">{item.title}</p>
        </div>
        <span class="text-xs font-mono text-slate-500">{item.year}</span>
      </div>
    {/each}
  </div>
</div>
