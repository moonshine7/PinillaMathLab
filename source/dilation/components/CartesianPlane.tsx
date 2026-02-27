import React from 'react';
import { ShapeData, Vertex } from '../types';

interface CartesianPlaneProps {
  shapeData: ShapeData | null;
  enlargedShapeData?: ShapeData | null;
  dilationScaleFactor: number | null;
}

interface RenderShapeProps {
  shapeData: ShapeData;
  toSvgCoords: (vertex: { x: number; y: number }) => { x: number; y: number };
  fillColor: string;
  strokeColor: string;
  pointColor: string;
  textColor: string;
  animateFrom?: ShapeData | null;
}

const VIEWBOX_SIZE = 500;
const AXIS_CENTER = VIEWBOX_SIZE / 2;
const GRID_RANGE = 22; // Increased range to accommodate enlarged shapes

const RenderShape: React.FC<RenderShapeProps> = ({ shapeData, toSvgCoords, fillColor, strokeColor, pointColor, textColor, animateFrom }) => {
  const finalPolygonPoints = shapeData.vertices.map(v => {
      const { x, y } = toSvgCoords(v);
      return `${x},${y}`;
  }).join(' ');
  
  const centroid = shapeData.vertices.reduce((acc, v) => {
    const { x: svgX, y: svgY } = toSvgCoords(v);
    acc.x += svgX;
    acc.y += svgY;
    return acc;
  }, { x: 0, y: 0 });
  
  centroid.x /= shapeData.vertices.length;
  centroid.y /= shapeData.vertices.length;

  const initialPolygonPoints = animateFrom ? animateFrom.vertices.map(v => {
    const { x, y } = toSvgCoords(v);
    return `${x},${y}`;
  }).join(' ') : finalPolygonPoints;

  const animationDuration = "4s"; // Increased from 0.7s to 4s for slow motion
  const easingSpline = "0.42 0 0.58 1"; // ease-in-out

  return (
    <g>
      {/* Shape */}
      <polygon points={finalPolygonPoints} fill={fillColor} stroke={strokeColor} strokeWidth="3">
         {animateFrom && (
            <animate 
                attributeName="points"
                from={initialPolygonPoints}
                to={finalPolygonPoints}
                dur={animationDuration}
                calcMode="spline"
                keyTimes="0; 1"
                keySplines={easingSpline}
                fill="freeze"
            />
        )}
      </polygon>

      {/* Vertices and Labels */}
      {shapeData.vertices.map((vertex, index) => {
        const { x: finalSvgX, y: finalSvgY } = toSvgCoords(vertex);
        
        const initialVertex = animateFrom && animateFrom.vertices[index] ? animateFrom.vertices[index] : vertex;
        const { x: initialSvgX, y: initialSvgY } = toSvgCoords(initialVertex);

        const vecX = finalSvgX - centroid.x;
        const vecY = finalSvgY - centroid.y;
        const magnitude = Math.sqrt(vecX * vecX + vecY * vecY);

        const normX = magnitude > 0 ? vecX / magnitude : 0;
        const normY = magnitude > 0 ? vecY / magnitude : 0;
        const LABEL_OFFSET = 25;
        const labelX = finalSvgX + normX * LABEL_OFFSET;
        const labelY = finalSvgY + normY * LABEL_OFFSET;

        const textAnchor = Math.abs(normX) < 0.3 ? 'middle' : (normX > 0 ? 'start' : 'end');
        const dominantBaseline = normY > 0.7 ? 'hanging' : (normY < -0.7 ? 'auto' : 'middle');

        return (
          <g key={index}>
            <circle cx={finalSvgX} cy={finalSvgY} r="5" fill={pointColor} stroke="#111827" strokeWidth="2">
                {animateFrom && (
                    <>
                        <animate attributeName="cx" from={initialSvgX} to={finalSvgX} dur={animationDuration} calcMode="spline" keyTimes="0; 1" keySplines={easingSpline} fill="freeze" />
                        <animate attributeName="cy" from={initialSvgY} to={finalSvgY} dur={animationDuration} calcMode="spline" keyTimes="0; 1" keySplines={easingSpline} fill="freeze" />
                    </>
                )}
            </circle>
            <text
              x={labelX}
              y={labelY}
              fontSize="16"
              fill={textColor}
              fontWeight="bold"
              textAnchor={textAnchor}
              dominantBaseline={dominantBaseline}
              style={{ filter: 'drop-shadow(0 0 3px #000)', opacity: animateFrom ? 0 : 1 }}
            >
              {vertex.label}
               {animateFrom && (
                <animate attributeName="opacity" from="0" to="1" dur={animationDuration} fill="freeze" />
              )}
            </text>
          </g>
        );
      })}
    </g>
  );
};

const CartesianPlane: React.FC<CartesianPlaneProps> = ({ shapeData, enlargedShapeData, dilationScaleFactor }) => {
  const toSvgCoords = (vertex: { x: number; y: number }): { x: number; y: number } => {
    const effectiveScale = VIEWBOX_SIZE / (GRID_RANGE * 2);
    return {
      x: AXIS_CENTER + vertex.x * effectiveScale,
      y: AXIS_CENTER - vertex.y * effectiveScale,
    };
  };

  const gridLines = [];
  for (let i = -GRID_RANGE; i <= GRID_RANGE; i++) {
    if (i !== 0) {
      const pos = AXIS_CENTER + i * (VIEWBOX_SIZE / (GRID_RANGE * 2));
      gridLines.push(<line key={`v-${i}`} x1={pos} y1={0} x2={pos} y2={VIEWBOX_SIZE} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />);
      gridLines.push(<line key={`h-${i}`} x1={0} y1={pos} x2={VIEWBOX_SIZE} y2={pos} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />);
    }
  }

  const axisLabels = [];
  for (let i = -GRID_RANGE; i <= GRID_RANGE; i++) {
    if (i !== 0 && i % 4 === 0) {
        const xPos = AXIS_CENTER + i * (VIEWBOX_SIZE / (GRID_RANGE * 2));
        const yPos = AXIS_CENTER - i * (VIEWBOX_SIZE / (GRID_RANGE * 2));
        axisLabels.push(<text key={`lx-${i}`} x={xPos - 5} y={AXIS_CENTER + 18} fontSize="12" fill="rgba(255,255,255,0.4)">{i}</text>);
        axisLabels.push(<text key={`ly-${i}`} x={AXIS_CENTER - 18} y={yPos + 5} fontSize="12" fill="rgba(255,255,255,0.4)">{i}</text>);
    }
  }
  
  const getTextPositions = () => {
    const occupiedQuadrants = new Set<number>();
    if (shapeData) occupiedQuadrants.add(shapeData.quadrant);
    if (enlargedShapeData) occupiedQuadrants.add(enlargedShapeData.quadrant);

    const emptyQuadrants = [1, 2, 3, 4].filter(q => !occupiedQuadrants.has(q));

    const positions: { [key: number]: { x: number; y: number; textAnchor: 'start' | 'end'; dominantBaseline: string } } = {
      1: { x: VIEWBOX_SIZE - 20, y: 30, textAnchor: 'end', dominantBaseline: 'hanging' },
      2: { x: 20, y: 30, textAnchor: 'start', dominantBaseline: 'hanging' },
      3: { x: 20, y: VIEWBOX_SIZE - 20, textAnchor: 'start', dominantBaseline: 'auto' },
      4: { x: VIEWBOX_SIZE - 20, y: VIEWBOX_SIZE - 20, textAnchor: 'end', dominantBaseline: 'auto' },
    };

    const rulePreferredOrder = [2, 1, 4, 3];
    const propsPreferredOrder = [3, 4, 1, 2];

    let ruleQuadrant = -1;
    for (const q of rulePreferredOrder) {
        if (emptyQuadrants.includes(q)) {
            ruleQuadrant = q;
            break;
        }
    }
    if (ruleQuadrant === -1) ruleQuadrant = rulePreferredOrder[0];

    let propsQuadrant = -1;
    for (const q of propsPreferredOrder) {
        if (emptyQuadrants.includes(q) && q !== ruleQuadrant) {
            propsQuadrant = q;
            break;
        }
    }
    if (propsQuadrant === -1) {
       for (const q of propsPreferredOrder) {
         if (emptyQuadrants.includes(q)) {
           propsQuadrant = q;
           break;
         }
       }
    }
    if (propsQuadrant === -1) propsQuadrant = propsPreferredOrder[0];

    const rulePos = positions[ruleQuadrant];
    let propsPos = positions[propsQuadrant];

    if (ruleQuadrant === propsQuadrant) {
        if (ruleQuadrant === 1 || ruleQuadrant === 2) {
            propsPos = { ...propsPos, y: propsPos.y + 60 };
        } else {
            propsPos = { ...propsPos, y: propsPos.y - 100 };
        }
    }
    
    if (propsPos.dominantBaseline === 'auto') {
        propsPos = { ...propsPos, y: propsPos.y - 70 };
    }
    
    return { rulePos, propsPos };
  };
  
  const { rulePos, propsPos } = getTextPositions();


  return (
    <div className="w-full max-w-full max-h-full aspect-square bg-gray-800 rounded-lg shadow-lg p-4">
      <svg viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} className="w-full h-full">
        {gridLines}
        <line x1={0} y1={AXIS_CENTER} x2={VIEWBOX_SIZE} y2={AXIS_CENTER} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <line x1={AXIS_CENTER} y1={0} x2={AXIS_CENTER} y2={VIEWBOX_SIZE} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        {axisLabels}
        <text x={VIEWBOX_SIZE - 15} y={AXIS_CENTER - 5} fontSize="12" fill="rgba(255,255,255,0.5)">x</text>
        <text x={AXIS_CENTER + 5} y={15} fontSize="12" fill="rgba(255,255,255,0.5)">y</text>

        <text x={VIEWBOX_SIZE - 30} y={30} fontSize="20" fill="rgba(255,255,255,0.2)" fontWeight="bold">I</text>
        <text x={30} y={30} fontSize="20" fill="rgba(255,255,255,0.2)" fontWeight="bold">II</text>
        <text x={30} y={VIEWBOX_SIZE-30} fontSize="20" fill="rgba(255,255,255,0.2)" fontWeight="bold">III</text>
        <text x={VIEWBOX_SIZE - 30} y={VIEWBOX_SIZE-30} fontSize="20" fill="rgba(255,255,255,0.2)" fontWeight="bold">IV</text>

        {dilationScaleFactor && (
          <text
            x={rulePos.x}
            y={rulePos.y}
            textAnchor={rulePos.textAnchor}
            dominantBaseline={rulePos.dominantBaseline.startsWith('h') ? 'hanging' : 'auto'}
            fontSize="18"
            fill="rgba(255, 255, 255, 0.9)"
            fontWeight="bold"
            fontFamily="monospace"
            className="animate-fade-in"
            style={{ filter: 'drop-shadow(0 0 5px #000)' }}
          >
            {`(x, y) → (${dilationScaleFactor}x, ${dilationScaleFactor}y)`}
          </text>
        )}
        
        {enlargedShapeData && (
          <text
            x={propsPos.x}
            y={propsPos.y}
            textAnchor={propsPos.textAnchor}
            dominantBaseline={propsPos.dominantBaseline.startsWith('h') ? 'hanging' : 'auto'}
            fontSize="14"
            fill="rgba(255, 255, 255, 0.8)"
            fontWeight="bold"
            fontFamily="sans-serif"
            className="animate-fade-in"
            style={{ filter: 'drop-shadow(0 0 5px #000)' }}
          >
            PROPERTIES
            <tspan x={propsPos.x} dy="1.6em" fontSize="12" fontWeight="normal">1. Area of the final shape has changed.</tspan>
            <tspan x={propsPos.x} dy="1.4em" fontSize="12" fontWeight="normal">2. Angles of the final shape are the same.</tspan>
            <tspan x={propsPos.x} dy="1.4em" fontSize="12" fontWeight="normal">3. Orientation of the shape was not changed.</tspan>
          </text>
        )}

        {shapeData && (
          <RenderShape
            shapeData={shapeData}
            toSvgCoords={toSvgCoords}
            fillColor="none"
            strokeColor="#9CA3AF"
            pointColor="#facc15"
            textColor="#fde047"
          />
        )}
        {enlargedShapeData && (
          <RenderShape
            shapeData={enlargedShapeData}
            toSvgCoords={toSvgCoords}
            fillColor="rgba(147, 51, 234, 0.4)"
            strokeColor="#9333ea"
            pointColor="#c084fc"
            textColor="#f0abfc"
            animateFrom={shapeData}
          />
        )}
      </svg>
    </div>
  );
};

export default CartesianPlane;