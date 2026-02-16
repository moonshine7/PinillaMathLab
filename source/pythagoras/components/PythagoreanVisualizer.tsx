
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface VisualizerProps {
  type: 'triangle' | 'plane';
  data?: {
    a?: number;
    b?: number;
    c?: number;
    points?: { x: number; y: number }[];
  };
}

const PythagoreanVisualizer: React.FC<VisualizerProps> = ({ type, data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 450;
    const height = 350;
    const padding = 50;

    if (type === 'triangle') {
      const a = data?.a || 3;
      const b = data?.b || 4;
      const scale = Math.min((width - padding * 2) / Math.max(b, 1), (height - padding * 2) / Math.max(a, 1));

      const x0 = padding + 20;
      const y0 = height - padding;
      const x1 = x0 + b * scale;
      const y1 = y0;
      const x2 = x0;
      const y2 = y0 - a * scale;

      // Draw shadow
      svg.append("path")
        .attr("d", `M ${x0+5} ${y0+5} L ${x1+5} ${y1+5} L ${x2+5} ${y2+5} Z`)
        .attr("fill", "#00000011");

      // Draw triangle
      svg.append("path")
        .attr("d", `M ${x0} ${y0} L ${x1} ${y1} L ${x2} ${y2} Z`)
        .attr("fill", "url(#grad1)")
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round");

      // Gradient
      const defs = svg.append("defs");
      const grad = defs.append("linearGradient").attr("id", "grad1").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", "#e0e7ff");
      grad.append("stop").attr("offset", "100%").attr("stop-color", "#c7d2fe");

      // Labels
      svg.append("text").attr("x", (x0 + x1) / 2).attr("y", y0 + 25).attr("text-anchor", "middle").attr("class", "font-bold fill-indigo-800").text(`b = ${b}`);
      svg.append("text").attr("x", x0 - 35).attr("y", (y0 + y2) / 2).attr("class", "font-bold fill-indigo-800").text(`a = ${a}`);
      svg.append("text").attr("x", (x1 + x2) / 2 + 15).attr("y", (y1 + y2) / 2 - 15).attr("class", "font-bold fill-indigo-900").text(`c = ?`);

      // Right angle square
      const size = 20;
      svg.append("rect")
        .attr("x", x0)
        .attr("y", y0 - size)
        .attr("width", size)
        .attr("height", size)
        .attr("fill", "none")
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", 2);
    } else {
      // Cartesian Plane
      const margin = { top: 30, right: 30, bottom: 30, left: 30 };
      const xScale = d3.scaleLinear().domain([-10, 10]).range([margin.left, width - margin.right]);
      const yScale = d3.scaleLinear().domain([-10, 10]).range([height - margin.bottom, margin.top]);

      // Grid lines
      svg.append("g")
        .attr("class", "grid")
        .selectAll(".line-x")
        .data(d3.range(-10, 11))
        .enter()
        .append("line")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "#f3f4f6");

      svg.append("g")
        .attr("class", "grid")
        .selectAll(".line-y")
        .data(d3.range(-10, 11))
        .enter()
        .append("line")
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("stroke", "#f3f4f6");

      // Main Axes
      svg.append("line").attr("x1", margin.left).attr("x2", width - margin.right).attr("y1", yScale(0)).attr("y2", yScale(0)).attr("stroke", "#9ca3af").attr("stroke-width", 2);
      svg.append("line").attr("y1", margin.top).attr("y2", height - margin.bottom).attr("x1", xScale(0)).attr("x2", xScale(0)).attr("stroke", "#9ca3af").attr("stroke-width", 2);

      // Ticks
      svg.selectAll(".tick-x").data(d3.range(-10, 11, 2)).enter().append("text")
        .attr("x", d => xScale(d)).attr("y", yScale(0) + 15).attr("text-anchor", "middle").attr("font-size", "10px").attr("class", "fill-gray-400").text(d => d === 0 ? "" : d);
      
      svg.selectAll(".tick-y").data(d3.range(-10, 11, 2)).enter().append("text")
        .attr("x", xScale(0) - 10).attr("y", d => yScale(d) + 4).attr("text-anchor", "end").attr("font-size", "10px").attr("class", "fill-gray-400").text(d => d === 0 ? "" : d);

      if (data?.points && data.points.length >= 2) {
        const p1 = data.points[0];
        const p2 = data.points[1];
        
        // Define points for the right triangle
        const vertex = { x: p2.x, y: p1.y }; // Corner point for right angle

        // 1. Shaded area for the triangle
        svg.append("path")
          .attr("d", `M ${xScale(p1.x)} ${yScale(p1.y)} L ${xScale(vertex.x)} ${yScale(vertex.y)} L ${xScale(p2.x)} ${yScale(p2.y)} Z`)
          .attr("fill", "#9333ea11")
          .attr("class", "animate-pulse");

        // 2. Right Angle Indicator at the vertex
        const raSize = 12;
        const dirX = Math.sign(p1.x - p2.x) || 1;
        const dirY = Math.sign(p2.y - p1.y) || 1;
        svg.append("path")
          .attr("d", `M ${xScale(vertex.x) + dirX * raSize} ${yScale(vertex.y)} 
                     L ${xScale(vertex.x) + dirX * raSize} ${yScale(vertex.y) + dirY * raSize} 
                     L ${xScale(vertex.x)} ${yScale(vertex.y) + dirY * raSize}`)
          .attr("fill", "none")
          .attr("stroke", "#9333ea")
          .attr("stroke-width", 1.5);

        // 3. Highlighted Legs (Horizontal and Vertical)
        // Horizontal leg
        svg.append("line")
          .attr("x1", xScale(p1.x))
          .attr("y1", yScale(p1.y))
          .attr("x2", xScale(vertex.x))
          .attr("y2", yScale(vertex.y))
          .attr("stroke", "#f97316") // Orange for leg a
          .attr("stroke-width", 4)
          .attr("stroke-linecap", "round");

        // Vertical leg
        svg.append("line")
          .attr("x1", xScale(vertex.x))
          .attr("y1", yScale(vertex.y))
          .attr("x2", xScale(p2.x))
          .attr("y2", yScale(p2.y))
          .attr("stroke", "#ef4444") // Red for leg b
          .attr("stroke-width", 4)
          .attr("stroke-linecap", "round");

        // 4. Distance Line (Hypotenuse)
        svg.append("line")
          .attr("x1", xScale(p1.x))
          .attr("y1", yScale(p1.y))
          .attr("x2", xScale(p2.x))
          .attr("y2", yScale(p2.y))
          .attr("stroke", "#9333ea") // Purple for hypotenuse c
          .attr("stroke-width", 5)
          .attr("stroke-linecap", "round");

        // 5. Explicit Labels for dx and dy
        const dx = Math.abs(p2.x - p1.x);
        const dy = Math.abs(p2.y - p1.y);

        // dx label
        svg.append("text")
          .attr("x", (xScale(p1.x) + xScale(vertex.x)) / 2)
          .attr("y", yScale(p1.y) + (dirY === -1 ? -10 : 20))
          .attr("text-anchor", "middle")
          .attr("class", "font-black text-[10px] fill-orange-600")
          .text(`Δx = ${dx}`);

        // dy label
        svg.append("text")
          .attr("x", xScale(vertex.x) + (dirX === 1 ? -15 : 15))
          .attr("y", (yScale(vertex.y) + yScale(p2.y)) / 2)
          .attr("text-anchor", dirX === 1 ? "end" : "start")
          .attr("class", "font-black text-[10px] fill-red-600")
          .text(`Δy = ${dy}`);

        // 6. Points and Coordinates
        [p1, p2].forEach((p, i) => {
          svg.append("circle")
            .attr("cx", xScale(p.x))
            .attr("cy", yScale(p.y))
            .attr("r", 7)
            .attr("fill", "#ffffff")
            .attr("stroke", i === 0 ? "#f97316" : "#ef4444")
            .attr("stroke-width", 3);
          
          svg.append("text")
            .attr("x", xScale(p.x))
            .attr("y", yScale(p.y) - 15)
            .attr("text-anchor", "middle")
            .attr("class", "font-black text-[11px] fill-gray-800 bg-white")
            .text(`(${p.x}, ${p.y})`);
        });
      }
    }
  }, [type, data]);

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl border border-gray-200 p-6 shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="flex space-x-4 mb-4 text-[10px] font-black uppercase tracking-tighter">
        <div className="flex items-center"><span className="w-3 h-3 bg-orange-500 rounded-full mr-1"></span> Horizontal Leg</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span> Vertical Leg</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-purple-600 rounded-full mr-1"></span> Hypotenuse</div>
      </div>
      <svg ref={svgRef} width="450" height="350" className="max-w-full h-auto" />
    </div>
  );
};

export default PythagoreanVisualizer;
