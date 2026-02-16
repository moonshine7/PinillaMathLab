import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
  Label,
  TooltipProps
} from 'recharts';
import { GraphDataPoint, MathScenario, LineEquation } from '../types';

interface CartesianPlaneProps {
  data: GraphDataPoint[];
  scenario: MathScenario;
  onChartHover: (x: number | null) => void;
}

const CartesianPlane: React.FC<CartesianPlaneProps> = ({ data, scenario, onChartHover }) => {
  // State to manage visibility of lines (controlled by Legend click)
  const [visibleLines, setVisibleLines] = useState<{ y1: boolean; y2: boolean }>({
    y1: true,
    y2: true,
  });

  // State to manage hover highlighting
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  // Calculate domain padding to make the graph look nice
  // We need strict min/max for the Y-Axis to ensure the 'Area' fills correctly to the edge
  const allYValues = data.flatMap(d => [d.y1, d.y2]);
  const maxY = Math.max(...allYValues);
  const minY = Math.min(...allYValues);
  
  // Ensure 0 is explicitly considered in the range so the origin is viewable
  const paddedMaxY = Math.max(maxY, 5); 
  const paddedMinY = Math.min(minY, -5);

  // Add some padding to the domain
  const domainMax = Math.ceil(paddedMaxY + (paddedMaxY - paddedMinY) * 0.1);
  const domainMin = Math.floor(paddedMinY - (paddedMaxY - paddedMinY) * 0.1);

  const handleLegendClick = (e: any) => {
    const dataKey = e.dataKey as 'y1' | 'y2';
    setVisibleLines((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  const formatEquation = (eq: LineEquation) => {
    const sign = eq.intercept >= 0 ? '+' : '-';
    return `y ${eq.inequality} ${eq.slope}x ${sign} ${Math.abs(eq.intercept)}`;
  };

  // Determine stroke style based on inequality type
  const getStrokeDasharray = (eq: LineEquation) => {
    if (eq.inequality === '<' || eq.inequality === '>') {
      return "10 5"; // Dashed for strict inequalities
    }
    return "0"; // Solid for inclusive
  };

  // Determine fill base value for inequality shading
  const getAreaProps = (eq: LineEquation) => {
    if (eq.inequality === '=') return null;
    
    const isGreater = eq.inequality.includes('>');
    
    return {
      // If greater (> or >=), fill towards the top (domainMax).
      // If less (< or <=), fill towards the bottom (domainMin).
      baseValue: isGreater ? domainMax : domainMin
    };
  };

  const area1Props = getAreaProps(scenario.equation1);
  const area2Props = getAreaProps(scenario.equation2);

  // Custom Tooltip to show specific details
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        // Changed from bg-white to bg-white/80 with backdrop-blur to allow seeing through
        <div className="bg-white/80 backdrop-blur-sm p-3 border border-slate-200 shadow-lg rounded-lg text-sm z-50 pointer-events-none">
          <p className="font-bold text-slate-700 mb-2 border-b border-slate-300/50 pb-1">
            X (Input): {label}
          </p>
          {payload.map((entry: any) => {
            // Filter out area payloads to avoid duplicates in tooltip
            if (entry.dataKey !== 'y1' && entry.dataKey !== 'y2') return null;

            // Determine which equation corresponds to this entry
            const isY1 = entry.dataKey === 'y1';
            const equation = isY1 ? scenario.equation1 : scenario.equation2;
            
            return (
              <div key={entry.dataKey} className="mb-1 last:mb-0">
                <p className={`font-semibold ${isY1 ? 'text-blue-600' : 'text-red-600'}`}>
                  {entry.name}
                </p>
                <p className="text-slate-600 text-xs font-mono">
                  {formatEquation(equation)}
                </p>
                <p className="text-slate-900 font-medium">
                  Boundary Y: {Number(entry.value).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Helper to determine line styling state
  // States: 
  // 1. Active (Hovered Self): Thicker, Opacity 1
  // 2. Inactive (Hovered Other): Normal, Low Opacity
  // 3. Default (No Hover): Normal, Slightly < 1 Opacity (to allow for "increase" effect)
  const getLineStyle = (isTargetLine: boolean, isAnyLineHovered: boolean) => {
    if (!isAnyLineHovered) {
        return { width: 3, opacity: 0.8 }; // Default state
    }
    if (isTargetLine) {
        return { width: 6, opacity: 1 }; // Active state
    }
    return { width: 3, opacity: 0.2 }; // Dimmed state
  };

  return (
    <div className="w-full h-[450px] bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative">
      <h3 className="text-lg font-semibold mb-4 text-slate-700 text-center">Cartesian Visualization</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
          onMouseMove={(state) => {
            if (state.isTooltipActive && state.activeLabel !== undefined) {
              onChartHover(Number(state.activeLabel));
            } else {
              onChartHover(null);
            }
          }}
          onMouseLeave={() => onChartHover(null)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={['auto', 'auto']}
            allowDataOverflow={true}
            stroke="#64748b"
          >
            <Label value="X (Input)" offset={-10} position="insideBottom" />
          </XAxis>
          <YAxis 
            stroke="#64748b"
            domain={[domainMin, domainMax]}
            allowDataOverflow={true}
          >
             <Label value="Y (Output)" angle={-90} position="insideLeft" />
          </YAxis>
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            verticalAlign="top" 
            height={36} 
            onClick={handleLegendClick}
            cursor="pointer"
            wrapperStyle={{ paddingBottom: '10px' }}
          />
          
          {/* Axes Reference Lines - Visual Origin */}
          <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={2} />
          <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={2} />

          {/* Inequality Shading Areas - Rendered first to be behind lines */}
          {area1Props && visibleLines.y1 && (
            <Area
              type="monotone"
              dataKey="y1"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.15}
              baseValue={area1Props.baseValue}
              isAnimationActive={false} 
              legendType="none"
              tooltipType="none"
            />
          )}
          
          {area2Props && visibleLines.y2 && (
            <Area
              type="monotone"
              dataKey="y2"
              stroke="none"
              fill="#ef4444"
              fillOpacity={0.15}
              baseValue={area2Props.baseValue}
              isAnimationActive={false}
              legendType="none"
              tooltipType="none"
            />
          )}

          {/* Equation 1 Line */}
          <Line 
            type="monotone" 
            dataKey="y1" 
            name={scenario.equation1.name} 
            stroke="#3b82f6" 
            strokeWidth={getLineStyle(hoveredLine === 'y1', hoveredLine !== null).width}
            strokeDasharray={getStrokeDasharray(scenario.equation1)}
            strokeOpacity={visibleLines.y1 ? getLineStyle(hoveredLine === 'y1', hoveredLine !== null).opacity : 0}
            dot={false}
            activeDot={{ r: 6 }}
            hide={!visibleLines.y1}
            onMouseEnter={() => setHoveredLine('y1')}
            onMouseLeave={() => setHoveredLine(null)}
            animationDuration={300}
          />

          {/* Equation 2 Line */}
          <Line 
            type="monotone" 
            dataKey="y2" 
            name={scenario.equation2.name} 
            stroke="#ef4444" 
            strokeWidth={getLineStyle(hoveredLine === 'y2', hoveredLine !== null).width}
            strokeDasharray={getStrokeDasharray(scenario.equation2)}
            strokeOpacity={visibleLines.y2 ? getLineStyle(hoveredLine === 'y2', hoveredLine !== null).opacity : 0}
            dot={false}
            activeDot={{ r: 6 }}
            hide={!visibleLines.y2}
            onMouseEnter={() => setHoveredLine('y2')}
            onMouseLeave={() => setHoveredLine(null)}
            animationDuration={300}
          />

          {/* Intersection Point Highlight - Only show if both lines are visible */}
          {visibleLines.y1 && visibleLines.y2 && (
            <ReferenceDot 
              x={scenario.intersectionPoint.x} 
              y={scenario.intersectionPoint.y} 
              r={6} 
              fill="#10b981" 
              stroke="#fff"
              strokeWidth={2}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
           <span className="w-8 h-0 border-t-2 border-slate-400 border-dashed"></span> 
           <span>Strict (&lt;, &gt;)</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-8 h-0 border-t-2 border-slate-400"></span> 
           <span>Inclusive (≤, ≥, =)</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-4 h-4 bg-blue-500 bg-opacity-20 rounded-sm border border-blue-200"></span> 
           <span>Blue Region</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-4 h-4 bg-red-500 bg-opacity-20 rounded-sm border border-red-200"></span> 
           <span>Red Region</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-4 h-4 bg-purple-800 bg-opacity-20 rounded-sm border border-purple-300"></span> 
           <span>Overlap (Solution)</span>
        </div>
      </div>
    </div>
  );
};

export default CartesianPlane;