<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let nodes = [
    { id: "وزارة المالية", group: "ministry" },
    { id: "مصرف لبنان", group: "regulator" },
    { id: "رئاسة مجلس الوزراء", group: "executive" },
    { id: "وزارة العدل", group: "ministry" },
    { id: "لجنة الرقابة على المصارف", group: "regulator" },
    { id: "وزارة الاقتصاد والتجارة", group: "ministry" }
  ];

  export let links = [
    { source: "وزارة المالية", target: "مصرف لبنان", value: 45 },
    { source: "وزارة المالية", target: "رئاسة مجلس الوزراء", value: 38 },
    { source: "مصرف لبنان", target: "لجنة الرقابة على المصارف", value: 30 },
    { source: "وزارة الاقتصاد والتجارة", target: "وزارة المالية", value: 20 },
    { source: "وزارة العدل", target: "رئاسة مجلس الوزراء", value: 25 }
  ];

  let svgElement;

  onMount(() => {
    if (!svgElement) return;

    const width = 700;
    const height = 450;

    const svg = d3.select(svgElement)
      .attr("viewBox", [0, 0, width, height]);

    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#475569")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g");

    node.append("circle")
      .attr("r", 14)
      .attr("fill", d => d.group === "regulator" ? "#10b981" : d.group === "executive" ? "#f59e0b" : "#3b82f6")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("x", 18)
      .attr("y", 5)
      .text(d => d.id)
      .attr("fill", "#e2e8f0")
      .attr("font-size", "12px")
      .attr("font-family", "system-ui, sans-serif");

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });
  });
</script>

<div class="network-container bg-slate-950 p-4 rounded-xl border border-slate-800">
  <svg bind:this={svgElement} width="100%" height="450"></svg>
</div>
