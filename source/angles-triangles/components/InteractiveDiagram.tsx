import React, { useState, useRef } from 'react';

interface Props {
  mode: 'transversal' | 'triangle';
}

interface Point {
  x: number;
  y: number;
}

const InteractiveDiagram: React.FC<Props> = ({ mode }) => {
  // Changed from single selectedAngle to array of selectedAngles for pair comparison
  const [selectedAngles, setSelectedAngles] = useState<number[]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<Point[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Relationship Logic Map
  const getRelationship = (id1: number, id2: number) => {
    const pair = [id1, id2].sort((a, b) => a - b).join('-');
    
    const relationships: Record<string, { name: string; type: string; description: string }> = {
      // Corresponding
      "1-5": { name: "Corresponding Angles", type: "Congruent (Equal)", description: "They are in the same relative position at each intersection." },
      "2-6": { name: "Corresponding Angles", type: "Congruent (Equal)", description: "They are in the same relative position at each intersection." },
      "3-7": { name: "Corresponding Angles", type: "Congruent (Equal)", description: "They are in the same relative position at each intersection." },
      "4-8": { name: "Corresponding Angles", type: "Congruent (Equal)", description: "They are in the same relative position at each intersection." },
      
      // Alternate Interior
      "3-6": { name: "Alternate Interior Angles", type: "Congruent (Equal)", description: "They are between the parallel lines on opposite sides of the transversal." },
      "4-5": { name: "Alternate Interior Angles", type: "Congruent (Equal)", description: "They are between the parallel lines on opposite sides of the transversal." },
      
      // Alternate Exterior
      "1-8": { name: "Alternate Exterior Angles", type: "Congruent (Equal)", description: "They are outside the parallel lines on opposite sides of the transversal." },
      "2-7": { name: "Alternate Exterior Angles", type: "Congruent (Equal)", description: "They are outside the parallel lines on opposite sides of the transversal." },
      
      // Same-Side Interior
      "3-5": { name: "Same-Side Interior Angles", type: "Supplementary (Add to 180°)", description: "They are between the parallel lines on the same side of the transversal." },
      "4-6": { name: "Same-Side Interior Angles", type: "Supplementary (Add to 180°)", description: "They are between the parallel lines on the same side of the transversal." },

      // Vertical
      "1-4": { name: "Vertical Angles", type: "Congruent (Equal)", description: "They are opposite each other at the intersection." },
      "2-3": { name: "Vertical Angles", type: "Congruent (Equal)", description: "They are opposite each other at the intersection." },
      "5-8": { name: "Vertical Angles", type: "Congruent (Equal)", description: "They are opposite each other at the intersection." },
      "6-7": { name: "Vertical Angles", type: "Congruent (Equal)", description: "They are opposite each other at the intersection." },

      // Linear Pairs
      "1-2": { name: "Linear Pair", type: "Supplementary (Add to 180°)", description: "They form a straight line." },
      "3-4": { name: "Linear Pair", type: "Supplementary (Add to 180°)", description: "They form a straight line." },
      "1-3": { name: "Linear Pair", type: "Supplementary (Add to 180°)", description: "They form a straight line." },
      "2-4": { name: "Linear Pair", type: "Supplementary (Add to 180°)", description: "They form a straight line." },
      "5-6": { name: "Linear Pair", type: "Supplementary (Add to 180°)", description: "They form a straight line." },
      "7-8": { name: "Linear Pair", type: "Supplementary (Add to 180°)", description: "They form a straight line." },
      "5-7": { name: "Linear Pair", type: "Supplementary (Add to 180°)", description: "They form a straight line." },
      "6-8": { name: "Linear Pair", type: "Supplementary (Add to 180°)", description: "They form a straight line." },
    };

    return relationships[pair] || { name: "No Special Relationship", type: "N/A", description: "These two angles do not form a standard named pair." };
  };

  const toggleAngleSelection = (id: number) => {
    if (selectedAngles.includes(id)) {
      // Unclick/Deselect
      setSelectedAngles(prev => prev.filter(a => a !== id));
    } else {
      // Click logic
      if (selectedAngles.length < 2) {
        setSelectedAngles(prev => [...prev, id]);
      } else {
        // If 2 are already selected, start a new pair with this click
        setSelectedAngles([id]);
      }
    }
  };

  const getHighlight = (id: number) => {
    if (isMeasuring) return 'fill-slate-100 text-slate-300 opacity-50';

    if (selectedAngles.includes(id)) {
        return 'fill-blue-500 text-white stroke-blue-600 stroke-2';
    }
    
    return 'fill-slate-200 hover:fill-slate-300';
  };

  const getStatusContent = () => {
    if (isMeasuring) {
        if (measurePoints.length === 0) return "Click the START point of the angle.";
        if (measurePoints.length === 1) return "Click the VERTEX (middle point) of the angle.";
        if (measurePoints.length === 2) return "Click the END point of the angle.";
        return "Angle Measured!";
    }

    if (mode === 'transversal') {
        if (selectedAngles.length === 0) {
            return (
                <div className="text-slate-500 italic">
                    Click any <b>two angles</b> on the diagram to see how they are related!
                </div>
            );
        } else if (selectedAngles.length === 1) {
            return (
                <div className="text-indigo-800">
                    <span className="font-bold">Angle {selectedAngles[0]}</span> selected. Click another angle to compare.
                </div>
            );
        } else {
            const [id1, id2] = selectedAngles;
            const info = getRelationship(id1, id2);
            return (
                <div className="animate-fadeIn">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">Angle {id1}</span>
                        <span className="text-slate-400">&</span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">Angle {id2}</span>
                    </div>
                    <h4 className="text-lg font-bold text-indigo-700">{info.name}</h4>
                    <p className="font-semibold text-sm text-slate-700 mt-1">{info.type}</p>
                    <p className="text-sm text-slate-600 mt-1">{info.description}</p>
                </div>
            );
        }
    }
    
    // Triangle mode default message
    return "Explore the triangle angles. Try measuring them!";
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isMeasuring) return;
    
    // If we already have 3 points, reset to start a new measurement
    if (measurePoints.length >= 3) {
      setMeasurePoints([]);
      // We don't return here, we proceed to add the first point of the new measurement immediately
    }

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 400;
      const y = ((e.clientY - rect.top) / rect.height) * 300;
      
      if (measurePoints.length >= 3) {
        setMeasurePoints([{ x, y }]);
      } else {
        setMeasurePoints([...measurePoints, { x, y }]);
      }
    }
  };

  const calculateAngle = (p1: Point, p2: Point, p3: Point) => {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
    
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    const rad = Math.acos(cosTheta);
    return Math.round((rad * 180 / Math.PI) * 10) / 10;
  };

  const toggleMeasureMode = () => {
    setIsMeasuring(!isMeasuring);
    setMeasurePoints([]);
    setSelectedAngles([]);
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative">
      <div className="flex justify-between w-full items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-700">
            {mode === 'transversal' ? 'Explore Parallel Lines' : 'Explore Triangles'}
        </h3>
        <button 
            onClick={toggleMeasureMode}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1 ${isMeasuring ? 'bg-pink-100 text-pink-700 border border-pink-200' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'}`}
        >
            {isMeasuring ? (
                <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    Stop Measuring
                </>
            ) : (
                <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg>
                    Measure Angle
                </>
            )}
        </button>
      </div>
      
      <svg 
        ref={svgRef}
        width="400" 
        height="300" 
        viewBox="0 0 400 300" 
        className={`bg-slate-50 border rounded-lg transition-colors ${isMeasuring ? 'cursor-crosshair ring-2 ring-pink-100' : ''}`}
        onClick={handleSvgClick}
      >
        <g className={isMeasuring ? "pointer-events-none" : ""}>
        {mode === 'transversal' ? (
          <>
            {/* Parallel Lines */}
            <line x1="50" y1="100" x2="350" y2="100" stroke="#334155" strokeWidth="3" />
            <line x1="50" y1="200" x2="350" y2="200" stroke="#334155" strokeWidth="3" />
            <text x="360" y="105" className="text-xs text-slate-500 italic">a</text>
            <text x="360" y="205" className="text-xs text-slate-500 italic">b</text>

            {/* Transversal */}
            <line x1="120" y1="50" x2="280" y2="250" stroke="#ef4444" strokeWidth="3" />
            <text x="130" y="45" className="text-xs text-red-500 italic">t</text>

            {/* Clickable Zones with Centered Labels */}
            {/* Top Intersection */}
            <g className="cursor-pointer" onClick={() => toggleAngleSelection(1)}>
                <circle cx="145" cy="85" r="16" className={`transition-all duration-200 ${getHighlight(1)}`} />
                <text x="145" y="85" textAnchor="middle" dominantBaseline="central" pointerEvents="none" className="text-base font-bold fill-slate-700 select-none">1</text>
            </g>
            
            <g className="cursor-pointer" onClick={() => toggleAngleSelection(2)}>
                <circle cx="175" cy="85" r="16" className={`transition-all duration-200 ${getHighlight(2)}`} />
                <text x="175" y="85" textAnchor="middle" dominantBaseline="central" pointerEvents="none" className="text-base font-bold fill-slate-700 select-none">2</text>
            </g>

            <g className="cursor-pointer" onClick={() => toggleAngleSelection(3)}>
                <circle cx="145" cy="115" r="16" className={`transition-all duration-200 ${getHighlight(3)}`} />
                <text x="145" y="115" textAnchor="middle" dominantBaseline="central" pointerEvents="none" className="text-base font-bold fill-slate-700 select-none">3</text>
            </g>

            <g className="cursor-pointer" onClick={() => toggleAngleSelection(4)}>
                <circle cx="175" cy="115" r="16" className={`transition-all duration-200 ${getHighlight(4)}`} />
                <text x="175" y="115" textAnchor="middle" dominantBaseline="central" pointerEvents="none" className="text-base font-bold fill-slate-700 select-none">4</text>
            </g>

            {/* Bottom Intersection */}
            <g className="cursor-pointer" onClick={() => toggleAngleSelection(5)}>
                <circle cx="225" cy="185" r="16" className={`transition-all duration-200 ${getHighlight(5)}`} />
                <text x="225" y="185" textAnchor="middle" dominantBaseline="central" pointerEvents="none" className="text-base font-bold fill-slate-700 select-none">5</text>
            </g>

            <g className="cursor-pointer" onClick={() => toggleAngleSelection(6)}>
                <circle cx="255" cy="185" r="16" className={`transition-all duration-200 ${getHighlight(6)}`} />
                <text x="255" y="185" textAnchor="middle" dominantBaseline="central" pointerEvents="none" className="text-base font-bold fill-slate-700 select-none">6</text>
            </g>

            <g className="cursor-pointer" onClick={() => toggleAngleSelection(7)}>
                <circle cx="225" cy="215" r="16" className={`transition-all duration-200 ${getHighlight(7)}`} />
                <text x="225" y="215" textAnchor="middle" dominantBaseline="central" pointerEvents="none" className="text-base font-bold fill-slate-700 select-none">7</text>
            </g>

            <g className="cursor-pointer" onClick={() => toggleAngleSelection(8)}>
                <circle cx="255" cy="215" r="16" className={`transition-all duration-200 ${getHighlight(8)}`} />
                <text x="255" y="215" textAnchor="middle" dominantBaseline="central" pointerEvents="none" className="text-base font-bold fill-slate-700 select-none">8</text>
            </g>
          </>
        ) : (
          <>
            {/* Triangle */}
            <polygon points="100,250 300,250 200,80" fill="none" stroke="#334155" strokeWidth="3" />
            <line x1="300" y1="250" x2="380" y2="250" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />

            {/* Angles A, B, C, Ext */}
            <circle cx="200" cy="100" r="20" className={`transition-colors ${isMeasuring ? 'fill-slate-100 opacity-50' : 'fill-blue-100 opacity-50'}`} />
            <text x="200" y="100" textAnchor="middle" dominantBaseline="central" className="text-base font-bold fill-slate-700 select-none">A</text>

            <circle cx="120" cy="235" r="20" className={`transition-colors ${isMeasuring ? 'fill-slate-100 opacity-50' : 'fill-green-100 opacity-50'}`} />
            <text x="120" y="235" textAnchor="middle" dominantBaseline="central" className="text-base font-bold fill-slate-700 select-none">B</text>

            <circle cx="280" cy="235" r="20" className={`transition-colors ${isMeasuring ? 'fill-slate-100 opacity-50' : 'fill-yellow-100 opacity-50'}`} />
            <text x="280" y="235" textAnchor="middle" dominantBaseline="central" className="text-base font-bold fill-slate-700 select-none">C</text>

            <path d="M 320 250 A 20 20 0 0 1 310 230" fill="none" stroke="red" strokeWidth="2" />
            <text x="325" y="240" className="text-base font-bold text-red-500 select-none">Ext</text>
          </>
        )}
        </g>

        {/* Measurement Overlay */}
        {isMeasuring && (
            <g>
                {measurePoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ec4899" stroke="white" strokeWidth="1" />
                ))}
                {measurePoints.length >= 2 && (
                    <line x1={measurePoints[0].x} y1={measurePoints[0].y} x2={measurePoints[1].x} y2={measurePoints[1].y} stroke="#ec4899" strokeWidth="2" strokeDasharray="4" />
                )}
                {measurePoints.length >= 3 && (
                    <>
                        <line x1={measurePoints[1].x} y1={measurePoints[1].y} x2={measurePoints[2].x} y2={measurePoints[2].y} stroke="#ec4899" strokeWidth="2" strokeDasharray="4" />
                        <circle cx={measurePoints[1].x} cy={measurePoints[1].y} r="15" fill="none" stroke="#ec4899" strokeWidth="2" opacity="0.5" />
                        <rect x={measurePoints[1].x + 10} y={measurePoints[1].y - 30} width="60" height="25" rx="4" fill="white" stroke="#ec4899" />
                        <text x={measurePoints[1].x + 40} y={measurePoints[1].y - 13} textAnchor="middle" className="text-sm font-bold fill-pink-600">
                            {calculateAngle(measurePoints[0], measurePoints[1], measurePoints[2])}°
                        </text>
                    </>
                )}
            </g>
        )}
      </svg>
      
      <div className="mt-4 p-4 bg-slate-50 w-full rounded-lg min-h-[100px] flex items-center justify-center border border-slate-100">
        <div className="text-center w-full">
            {getStatusContent()}
        </div>
      </div>
    </div>
  );
};

export default InteractiveDiagram;