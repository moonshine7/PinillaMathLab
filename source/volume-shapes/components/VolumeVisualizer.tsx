
import React, { useState, useMemo, useEffect } from 'react';
import { Card } from './Card';

type ShapeType = 'rectangular' | 'triangular' | 'cylinder' | 'cone' | 'squarePyramid' | 'triangularPyramid' | 'sphere';

const shapeData = {
  rectangular: {
    label: 'Rectangular Prism',
    formula: 'V = lwh (or V = Bh)',
    formulaDetail: 'B is the base area (length × width).',
  },
  triangular: {
    label: 'Triangular Prism',
    formula: 'V = Bh',
    formulaDetail: 'B is the area of the triangular base (½ × base × height).',
  },
  cylinder: {
    label: 'Cylinder',
    formula: 'V = πr²h (or V = Bh)',
    formulaDetail: 'B is the area of the circular base (π × radius²).',
  },
  cone: {
    label: 'Cone',
    formula: 'V = ⅓πr²h (or V = ⅓Bh)',
    formulaDetail: 'B is the area of the circular base (π × radius²).',
  },
  squarePyramid: {
    label: 'Square Pyramid',
    formula: 'V = ⅓Bh',
    formulaDetail: 'B is the area of the square base (base × base).',
  },
  triangularPyramid: {
    label: 'Triangular Pyramid',
    formula: 'V = ⅓Bh',
    formulaDetail: 'B is the area of the triangular base (½ × base × height).',
  },
  sphere: {
    label: 'Sphere',
    formula: 'V = ⁴⁄₃πr³',
    formulaDetail: 'r is the radius of the sphere.',
  },
};

const shapeButtonStyles: { [key in ShapeType]: { active: string; inactive: string } } = {
    rectangular: {
        active: 'bg-sky-600 text-white',
        inactive: 'bg-gray-700 hover:bg-sky-500'
    },
    triangular: {
        active: 'bg-amber-600 text-white',
        inactive: 'bg-gray-700 hover:bg-amber-500'
    },
    cylinder: {
        active: 'bg-rose-600 text-white',
        inactive: 'bg-gray-700 hover:bg-rose-500'
    },
    cone: {
        active: 'bg-violet-600 text-white',
        inactive: 'bg-gray-700 hover:bg-violet-500'
    },
    squarePyramid: {
        active: 'bg-teal-600 text-white',
        inactive: 'bg-gray-700 hover:bg-teal-500'
    },
    triangularPyramid: {
        active: 'bg-lime-600 text-white',
        inactive: 'bg-gray-700 hover:bg-lime-500'
    },
    sphere: {
        active: 'bg-indigo-600 text-white',
        inactive: 'bg-gray-700 hover:bg-indigo-500'
    }
};

const PERSPECTIVE_ANGLE = Math.PI / 7; // ~25.7 degrees for a more dynamic look

const FILL_COLORS = {
  // Using hsla for easier brightness control and modern look
  shapeFront: 'hsla(220, 15%, 85%, 0.15)',
  shapeSide: 'hsla(220, 15%, 85%, 0.1)',
  shapeTop: 'hsla(220, 15%, 85%, 0.25)',
  shapeBottom: 'hsla(220, 15%, 85%, 0.08)',
  
  waterFront: 'hsla(217, 91%, 60%, 0.8)', // blue-500
  waterSide: 'hsla(217, 91%, 55%, 0.8)', // darker
  waterSurface: 'hsla(207, 90%, 76%, 0.9)', // light blue-300
  waterBottom: 'hsla(217, 91%, 60%, 0.8)', // Same as front
};


interface DimensionLabelsProps extends ShapeVisualizerProps {
  displayW: number;
  displayH: number;
  displayD: number;
}

const DimensionLabels: React.FC<DimensionLabelsProps> = ({ shape, w, h, d, displayW, displayH, displayD }) => {
    const commonStyle: React.CSSProperties = {
        stroke: 'rgb(234 179 8)',
        fill: 'rgb(234 179 8)',
        fontSize: '12px',
        fontFamily: 'monospace',
        strokeWidth: 1,
    };
    
    if (shape === 'sphere') {
        const r = w / 2;
        return (
            <g style={commonStyle}>
                {/* Radius */}
                <line x1={r} y1={r} x2={w} y2={r} />
                <line x1={r} y1={r - 3} x2={r} y2={r + 3} />
                <text x={r + r / 2} y={r - 8} textAnchor="middle">r = {(displayW / 2).toFixed(0)}</text>
            </g>
        )
    }

    if (shape === 'cylinder' || shape === 'cone') {
        const r = w / 2;
        const radius = (displayW / 2).toFixed(0);

        return (
            <g style={commonStyle}>
                {/* Height */}
                <line x1={w + 5} y1={0} x2={w + 5} y2={h} />
                <line x1={w + 2} y1={0} x2={w + 8} y2={0} />
                <line x1={w + 2} y1={h} x2={w + 8} y2={h} />
                <text x={w + 12} y={h / 2 + 4} dominantBaseline="middle">{displayH.toFixed(0)}</text>
                {/* Radius */}
                <line x1={r} y1={h} x2={w} y2={h} />
                 <line x1={r} y1={h-3} x2={r} y2={h+3} />
                <text x={r + (r / 2)} y={h-8} textAnchor="middle">{radius}</text>
            </g>
        )
    }
    
    if (shape === 'squarePyramid' || shape === 'triangularPyramid') {
        const angle = PERSPECTIVE_ANGLE;
        const dx = d * Math.cos(angle);
        const rightEdgeX = w + dx;
        const lowestY = h;

        return(
             <g style={commonStyle}>
                {/* External Height */}
                <line x1={rightEdgeX + 5} y1={0} x2={rightEdgeX + 5} y2={h} />
                <line x1={rightEdgeX + 2} y1={0} x2={rightEdgeX + 8} y2={0} />
                <line x1={rightEdgeX + 2} y1={h} x2={rightEdgeX + 8} y2={h} />
                <text x={rightEdgeX + 12} y={h/2} dominantBaseline="middle">{displayH.toFixed(0)}</text>

                {/* Base Width */}
                <line x1={0} y1={lowestY + 5} x2={w} y2={lowestY + 5} />
                <line x1={0} y1={lowestY + 2} x2={0} y2={lowestY + 8} />
                <line x1={w} y1={lowestY + 2} x2={w} y2={lowestY + 8} />
                <text x={w/2} y={lowestY + 18} textAnchor="middle">
                    {displayW.toFixed(0)}
                </text>
             </g>
        );
    }
    
    const angle = PERSPECTIVE_ANGLE;
    const dx = d * Math.cos(angle);
    const dy = d * Math.sin(angle);
    const rightEdgeX = w + dx;
    
    if (shape === 'rectangular') {
        const frontFaceBottomY = h;
        return (
            <g style={commonStyle}>
                {/* Height */}
                <line x1={rightEdgeX + 5} y1={dy} x2={rightEdgeX + 5} y2={h + dy} />
                <line x1={rightEdgeX + 2} y1={dy} x2={rightEdgeX + 8} y2={dy} />
                <line x1={rightEdgeX + 2} y1={h + dy} x2={rightEdgeX + 8} y2={h + dy} />
                <text x={rightEdgeX + 12} y={h / 2 + dy} dominantBaseline="middle">{displayH.toFixed(0)}</text>

                {/* Width/Length */}
                <line x1={0} y1={frontFaceBottomY + 10} x2={w} y2={frontFaceBottomY + 10} />
                <line x1={0} y1={frontFaceBottomY + 7} x2={0} y2={frontFaceBottomY + 13} />
                <line x1={w} y1={frontFaceBottomY + 7} x2={w} y2={frontFaceBottomY + 13} />
                <text x={w / 2} y={frontFaceBottomY + 25} textAnchor="middle">
                    {displayW.toFixed(0)}
                </text>
                
                {/* Depth */}
                <line x1={w} y1={-5} x2={w + dx} y2={dy - 5} />
                <text x={w + dx / 2 - 10} y={dy - 12} textAnchor="middle">{displayD.toFixed(0)}</text>
            </g>
        );
    }

    // Default to other prisms (triangular)
    const frontFaceBottomY = h + dy;
    return (
        <g style={commonStyle}>
            {/* Height */}
            <line x1={rightEdgeX + 5} y1={dy} x2={rightEdgeX + 5} y2={h + dy} />
            <line x1={rightEdgeX + 2} y1={dy} x2={rightEdgeX + 8} y2={dy} />
            <line x1={rightEdgeX + 2} y1={h + dy} x2={rightEdgeX + 8} y2={h + dy} />
            <text x={rightEdgeX + 12} y={h / 2 + dy} dominantBaseline="middle">{displayH.toFixed(0)}</text>

            {/* Width/Length */}
            <line x1={0} y1={frontFaceBottomY + 10} x2={w} y2={frontFaceBottomY + 10} />
            <line x1={0} y1={frontFaceBottomY + 7} x2={0} y2={frontFaceBottomY + 13} />
            <line x1={w} y1={frontFaceBottomY + 7} x2={w} y2={frontFaceBottomY + 13} />
            <text x={w / 2} y={frontFaceBottomY + 25} textAnchor="middle">
                {displayW.toFixed(0)}
            </text>
            {/* Depth */}
            <line x1={w} y1={-5} x2={w + dx} y2={dy - 5} />
            <text x={w + dx / 2 - 10} y={dy - 12} textAnchor="middle">{displayD.toFixed(0)}</text>
        </g>
    );
};

interface ShapeVisualizerProps {
  shape: ShapeType;
  w: number;
  h: number;
  d: number;
  fill: number; // Percentage
}

const ShapeVisualizer: React.FC<ShapeVisualizerProps & { displayW: number; displayH: number; displayD: number; }> = (props) => {
  const { shape, w, h, d, fill } = props;

  const {
    shapePaths,
    waterPaths,
    bottomPath,
    waterSurfacePath,
    ghostPaths,
  } = useMemo(() => {
    const angle = PERSPECTIVE_ANGLE;
    const dx = d * Math.cos(angle);
    const dy = d * Math.sin(angle);
    
    const shapePaths: { d: string; fill: string; stroke?: string; strokeWidth?: number; strokeLinejoin?: "round" }[] = [];
    const waterPaths: { d: string; fill: string; clipPath?: string }[] = [];
    const ghostPaths: { d: string; fill: string; stroke?: string; strokeWidth?: number }[] = [];
    let bottomPath = '';
    let waterSurfacePath = '';

    const isPyramidOrCone = ['cone', 'squarePyramid', 'triangularPyramid'].includes(shape);
    const fillHeight = isPyramidOrCone ? h * Math.cbrt(1 - (fill / 100)) : h * (1 - fill / 100);
    
    if (shape === 'cone' && fill === 100) {
        const r = w / 2;
        const ry = d / 4;
        // The unfilled part of the cylinder, shown as a ghost
        ghostPaths.push({
            d: `M 0,${h} A ${r},${ry} 0 0,1 ${w},${h} L ${w},0 A ${r},${ry} 0 0,0 0,0 Z`,
            fill: 'hsla(220, 10%, 50%, 0.4)',
            stroke: 'hsla(220, 10%, 70%, 0.6)',
            strokeWidth: 0.5,
        });
        ghostPaths.push({
            d: `M 0,0 A ${r},${ry} 0 1,1 ${w},0 A ${r},${ry} 0 1,1 0,0 Z`,
            fill: 'hsla(220, 10%, 60%, 0.4)',
            stroke: 'hsla(220, 10%, 70%, 0.6)',
            strokeWidth: 0.5,
        });
    }

    switch (shape) {
      case 'rectangular':
        shapePaths.push({ d: `M ${w},0 l ${dx},${dy} v ${h} l ${-dx},${-dy} v -${h} Z`, fill: FILL_COLORS.shapeSide }); // Side
        shapePaths.push({ d: `M 0,0 V ${h} H ${w} V 0 H 0 Z`, fill: FILL_COLORS.shapeFront }); // Front
        shapePaths.push({ d: `M 0,0 l ${dx},${dy} h ${w} l ${-dx},${-dy} h -${w} Z`, fill: FILL_COLORS.shapeTop }); // Top
        bottomPath = `M 0,${h} l ${dx},${dy} h ${w} l ${-dx},${-dy} h -${w} Z`;

        if (fill > 0) {
          waterPaths.push({ d: `M ${w},${fillHeight} l ${dx},${dy} v ${h-fillHeight} l ${-dx},${-dy} v -${h-fillHeight} Z`, fill: FILL_COLORS.waterSide }); // Water side
          waterPaths.push({ d: `M 0,${fillHeight} V ${h} H ${w} V ${fillHeight} H 0 Z`, fill: FILL_COLORS.waterFront }); // Water front
          waterSurfacePath = `M 0,${fillHeight} l ${dx},${dy} h ${w} l ${-dx},${-dy} h -${w} Z`;
        }
        break;
      case 'triangular':
         bottomPath = `M 0,${h} l ${dx},${dy} L ${w+dx},${h+dy} L ${w},${h} Z`;
         // Back plane
         shapePaths.push({d: `M ${w/2},0 l ${dx},${dy} L ${w+dx},${h+dy} L ${w},${h} L ${w/2},0 Z`, fill: FILL_COLORS.shapeSide });
         // Front plane
         shapePaths.push({d: `M 0,${h} L ${w/2},0 L ${w},${h} Z`, fill: FILL_COLORS.shapeFront});

         if (fill > 0) {
             const x_left_water = (w / 2 / h) * (h - fillHeight);
             const x_right_water = w - x_left_water;
             waterPaths.push({ d: `M ${x_right_water},${fillHeight} l ${dx},${dy} L ${w+dx},${h+dy} L ${w},${h} Z`, fill: FILL_COLORS.waterSide });
             waterPaths.push({ d: `M ${x_left_water},${fillHeight} L 0,${h} H ${w} L ${x_right_water},${fillHeight} Z `, fill: FILL_COLORS.waterFront });
             waterSurfacePath = `M ${x_left_water},${fillHeight} l ${dx},${dy} L ${x_right_water+dx},${fillHeight+dy} L ${x_right_water},${fillHeight} Z`;
         }
        break;
      case 'cylinder': {
        const r = w / 2;
        const ry = d / 4;
        shapePaths.push({ d: `M 0,${h} A ${r},${ry} 0 0,1 ${w},${h} L ${w},0 A ${r},${ry} 0 0,0 0,0 Z`, fill: 'url(#cylinderGradient)' });
        shapePaths.push({ d: `M 0,0 A ${r},${ry} 0 1,1 ${w},0 A ${r},${ry} 0 1,1 0,0 Z`, fill: FILL_COLORS.shapeTop });
        bottomPath = `M 0,${h} A ${r},${ry} 0 1,1 ${w},${h} A ${r},${ry} 0 1,1 0,${h} Z`;

        if (fill > 0) {
            waterPaths.push({ d: `M 0,${h} A ${r},${ry} 0 0,1 ${w},${h} L ${w},${fillHeight} A ${r},${ry} 0 0,0 0,${fillHeight} Z`, fill: 'url(#waterCylinderGradient)' });
            waterSurfacePath = `M 0,${fillHeight} A ${r},${ry} 0 1,1 ${w},${fillHeight} A ${r},${ry} 0 1,1 0,${fillHeight} Z`;
        }
        break;
      }
       case 'sphere': {
        const r = w / 2;
        const ry = d / 5; // Ellipse vertical radius for 3D effect

        shapePaths.push({ d: `M 0,${r} A ${r},${r} 0 1,1 ${w},${r} A ${r},${r} 0 1,1 0,${r} Z`, fill: 'url(#sphereGradient)' });
        shapePaths.push({ d: `M 0,${r} A ${r},${ry} 0 1,0 ${w},${r} A ${r},${ry} 0 1,0 0,${r} Z`, fill: 'none', stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 });

        if (fill > 0) {
            const fillY = h * (1 - fill / 100);
            waterPaths.push({ d: `M 0,${r} A ${r},${r} 0 1,1 ${w},${r} A ${r},${r} 0 1,1 0,${r} Z`, fill: 'url(#waterSphereGradient)', clipPath: 'url(#sphere-water-clip)' });

            if (fillY < h && fillY > 0) {
                const yFromCenter = fillY - r;
                const surfaceRx = Math.sqrt(Math.max(0, r * r - yFromCenter * yFromCenter));
                if (surfaceRx > 0) {
                    const surfaceRy = ry * (surfaceRx / r);
                    waterSurfacePath = `M ${r - surfaceRx},${fillY} A ${surfaceRx},${surfaceRy} 0 1,0 ${r + surfaceRx},${fillY} A ${surfaceRx},${surfaceRy} 0 1,0 ${r - surfaceRx},${fillY} Z`;
                }
            }
        }
        break;
      }
      case 'cone': {
        const r = w / 2;
        const ry = d / 4;
        shapePaths.push({ d: `M ${r},0 L 0,${h} A ${r},${ry} 0 0,0 ${w},${h} Z`, fill: 'url(#cylinderGradient)' });
        bottomPath = `M 0,${h} A ${r},${ry} 0 1,1 ${w},${h} A ${r},${ry} 0 1,1 0,${h} Z`;
        
        if (fill > 0) {
            // y-coordinate of the water surface, from the apex (top)
            const y_surface = h * Math.cbrt(1 - (fill / 100));
            // radius of the water surface ellipse, proportional to its distance from apex
            const r_surface = r * (y_surface / h);
            const ry_surface = ry * (y_surface / h);

            const waterCenter = w / 2;
            const left_x_surface = waterCenter - r_surface;
            const right_x_surface = waterCenter + r_surface;

            // The path for the water volume (a frustum of a cone)
            // When fill is 100%, y_surface is 0, r_surface is 0, and this path becomes a full cone.
            waterPaths.push({ d: `M ${left_x_surface},${y_surface} L 0,${h} A ${r},${ry} 0 0,0 ${w},${h} L ${right_x_surface},${y_surface} Z`, fill: 'url(#waterCylinderGradient)' });
            
            // The path for the water surface ellipse
            if (fill < 100) { // The surface is a point at 100% fill.
                waterSurfacePath = `M ${left_x_surface},${y_surface} A ${r_surface},${ry_surface} 0 1,1 ${right_x_surface},${y_surface} A ${r_surface},${ry_surface} 0 1,1 ${left_x_surface},${y_surface} Z`;
            }
        }
        break;
      }
      case 'squarePyramid': {
          const apexX = w/2;
          const apexY = 0;
          bottomPath = `M 0,${h} L ${w},${h} l ${dx},${dy} L ${dx},${h+dy} Z`;

          if (fill === 100) {
              // Show the containing prism in grey for comparison
              const ghostFill = 'hsla(220, 10%, 50%, 0.4)';
              const ghostStroke = 'hsla(220, 10%, 70%, 0.6)';
              const ghostTopFill = 'hsla(220, 10%, 60%, 0.4)';
              
              ghostPaths.push({
                  d: `M ${w},0 l ${dx},${dy} v ${h} l ${-dx},${-dy} v -${h} Z`, // Side
                  fill: ghostFill, stroke: ghostStroke, strokeWidth: 0.5,
              });
              ghostPaths.push({
                  d: `M 0,0 V ${h} H ${w} V 0 H 0 Z`, // Front
                  fill: ghostFill, stroke: ghostStroke, strokeWidth: 0.5,
              });
              ghostPaths.push({
                  d: `M 0,0 l ${dx},${dy} h ${w} l ${-dx},${-dy} h -${w} Z`, // Top
                  fill: ghostTopFill, stroke: ghostStroke, strokeWidth: 0.5,
              });

              // The pyramid volume is filled with "water"
              const apex = {x: apexX, y: apexY};
              const apex_persp = {x: apex.x + dx, y: apex.y + dy};
              waterPaths.push({ d: `M ${apex.x},${apex.y} L ${w},${h} L ${w+dx},${h+dy} L ${apex_persp.x},${apex_persp.y} Z`, fill: FILL_COLORS.waterSide });
              waterPaths.push({ d: `M ${apex.x},${apex.y} L 0,${h} L ${w},${h} Z`, fill: FILL_COLORS.waterFront });
          } else {
              // Draw the empty shape outline
              const apex = {x: apexX, y: apexY};
              const apex_persp = {x: apex.x + dx, y: apex.y + dy};
              shapePaths.push({ d: `M ${apex.x},${apex.y} L ${w},${h} L ${w+dx},${h+dy} L ${apex_persp.x},${apex_persp.y} Z`, fill: FILL_COLORS.shapeSide });
              shapePaths.push({ d: `M ${apex.x},${apex.y} L 0,${h} L ${w},${h} Z`, fill: FILL_COLORS.shapeFront });

              if (fill > 0) {
                  const linearRatio = fillHeight / h;
                  
                  // Base points
                  const p_fl = {x: 0, y: h};
                  const p_fr = {x: w, y: h};
                  const p_br = {x: w + dx, y: h + dy};
                  const p_bl = {x: 0 + dx, y: h + dy};

                  // Water surface points by interpolating from apex to base points
                  const ws_fl = { x: apex.x + (p_fl.x - apex.x) * linearRatio, y: apex.y + (p_fl.y - apex.y) * linearRatio };
                  const ws_fr = { x: apex.x + (p_fr.x - apex.x) * linearRatio, y: apex.y + (p_fr.y - apex.y) * linearRatio };
                  const ws_br = { x: apex_persp.x + (p_br.x - apex_persp.x) * linearRatio, y: apex_persp.y + (p_br.y - apex_persp.y) * linearRatio };
                  const ws_bl = { x: apex_persp.x + (p_bl.x - apex_persp.x) * linearRatio, y: apex_persp.y + (p_bl.y - apex_persp.y) * linearRatio };

                  waterSurfacePath = `M ${ws_fl.x},${ws_fl.y} L ${ws_fr.x},${ws_fr.y} L ${ws_br.x},${ws_br.y} L ${ws_bl.x},${ws_bl.y} Z`;

                  // Water volumes (frustums)
                  waterPaths.push({d: `M ${ws_fr.x},${ws_fr.y} L ${p_fr.x},${p_fr.y} L ${p_br.x},${p_br.y} L ${ws_br.x},${ws_br.y} Z`, fill: FILL_COLORS.waterSide});
                  waterPaths.push({d: `M ${ws_fl.x},${ws_fl.y} L ${p_fl.x},${p_fl.y} L ${p_fr.x},${p_fr.y} L ${ws_fr.x},${ws_fr.y} Z`, fill: FILL_COLORS.waterFront});
              }
          }
        break;
      }
       case 'triangularPyramid': {
          const apexX = w/2;
          const apexY = 0;
          const apex = {x: apexX, y: apexY};
          
          const p1 = {x: 0, y: h};
          const p2 = {x: w, y: h};
          const p3 = {x: w/2 + dx, y: h + dy};

          bottomPath = `M ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} Z`;
          
          // Using slightly different side colors for better 3D perception
          const shapeSideLeftFill = 'hsla(220, 15%, 85%, 0.12)';
          
          // Back-left face. Rendered first to be in the back.
          shapePaths.push({d: `M ${apex.x},${apex.y} L ${p1.x},${p1.y} L ${p3.x},${p3.y} Z`, fill: shapeSideLeftFill });
          // Back-right face.
          shapePaths.push({d: `M ${apex.x},${apex.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} Z`, fill: FILL_COLORS.shapeSide});
          // Front face. Rendered last to be on top.
          shapePaths.push({d: `M ${apex.x},${apex.y} L ${p1.x},${p1.y} L ${p2.x},${p2.y} Z`, fill: FILL_COLORS.shapeFront});
          
          if (fill > 0) {
              const linearRatio = fillHeight / h;
              
              const wsP1 = { x: apex.x + (p1.x - apex.x) * linearRatio, y: apex.y + (p1.y - apex.y) * linearRatio };
              const wsP2 = { x: apex.x + (p2.x - apex.x) * linearRatio, y: apex.y + (p2.y - apex.y) * linearRatio };
              const wsP3 = { x: apex.x + (p3.x - apex.x) * linearRatio, y: apex.y + (p3.y - apex.y) * linearRatio };
              
              waterSurfacePath = `M ${wsP1.x},${wsP1.y} L ${wsP2.x},${wsP2.y} L ${wsP3.x},${wsP3.y} Z`;
              
              const waterSideLeftFill = 'hsla(217, 91%, 58%, 0.8)';

              // Water volumes (frustums)
              // Water back-left face
              waterPaths.push({d: `M ${wsP1.x},${wsP1.y} L ${p1.x},${p1.y} L ${p3.x},${p3.y} L ${wsP3.x},${wsP3.y} Z`, fill: waterSideLeftFill });
              // Water back-right face
              waterPaths.push({d: `M ${wsP2.x},${wsP2.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} L ${wsP3.x},${wsP3.y} Z`, fill: FILL_COLORS.waterSide});
              // Water front face
              waterPaths.push({d: `M ${wsP1.x},${wsP1.y} L ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${wsP2.x},${wsP2.y} Z`, fill: FILL_COLORS.waterFront});
          }
        break;
      }
    }
    return { shapePaths, waterPaths, bottomPath, waterSurfacePath, ghostPaths };
  }, [shape, w, h, d, fill]);

  return (
    <g>
       {shape === 'sphere' && (
        <defs>
          <clipPath id="sphere-water-clip">
            <rect x="0" y={h * (1 - fill / 100)} width={w} height={h * (fill / 100)} />
          </clipPath>
        </defs>
      )}
      {ghostPaths.map((p, i) => <path key={`ghost-${i}`} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth ?? 1} />)}
      <path d={bottomPath} fill={fill > 0 ? FILL_COLORS.waterBottom : FILL_COLORS.shapeBottom} stroke="white" strokeWidth="0.5" />
      {waterPaths.map((p, i) => <path key={`water-${i}`} d={p.d} fill={p.fill} clipPath={p.clipPath} />)}
      {(!['cone', 'squarePyramid', 'triangularPyramid'].includes(shape) || fill < 100) && shapePaths.map((p, i) => <path key={`shape-${i}`} d={p.d} fill={p.fill} stroke={p.stroke ?? "white"} strokeWidth={p.strokeWidth ?? 1} strokeLinejoin={p.strokeLinejoin ?? "round"} />)}
      <path d={waterSurfacePath} fill={FILL_COLORS.waterSurface} stroke="lightblue" strokeWidth="1" />
    </g>
  );
};

export const VolumeVisualizer: React.FC = () => {
  const [shape, setShape] = useState<ShapeType>('rectangular');
  const [w, setW] = useState(50);
  const [h, setH] = useState(50);
  const [d, setD] = useState(50);
  const [fill, setFill] = useState(50);

   useEffect(() => {
    if (shape === 'sphere') {
      setH(w);
      setD(w/2.5); // Set perspective depth for sphere
    }
  }, [shape, w]);

  const { volume, filledVolume, labels, baseArea, baseAreaCalculation } = useMemo(() => {
    let volume = 0;
    let baseArea: number | null = 0;
    let baseAreaCalculation = '';
    const labels: {w:string, h:string, d:string} = {w:'Width', h:'Height', d:'Depth'};

    switch (shape) {
      case 'rectangular':
        baseArea = w * d;
        volume = baseArea * h;
        baseAreaCalculation = `${w} × ${d}`;
        labels.w = 'Length';
        break;
      case 'triangular':
        baseArea = 0.5 * w * d;
        volume = baseArea * h;
        baseAreaCalculation = `0.5 × ${w} × ${d}`;
        labels.w = 'Base';
        labels.d = 'Base Height';
        break;
      case 'cylinder':
        const rCyl = w / 2;
        baseArea = Math.PI * Math.pow(rCyl, 2);
        volume = baseArea * h;
        baseAreaCalculation = `π × ${rCyl.toFixed(1)}²`;
        labels.w = 'Diameter';
        break;
      case 'cone':
        const rCone = w / 2;
        baseArea = Math.PI * Math.pow(rCone, 2);
        volume = (1 / 3) * baseArea * h;
        baseAreaCalculation = `π × ${rCone.toFixed(1)}²`;
        labels.w = 'Diameter';
        break;
      case 'squarePyramid':
        baseArea = Math.pow(w, 2);
        volume = (1 / 3) * baseArea * h;
        baseAreaCalculation = `${w}²`;
        labels.w = 'Base';
        break;
      case 'triangularPyramid':
        baseArea = 0.5 * w * d;
        volume = (1 / 3) * baseArea * h;
        baseAreaCalculation = `0.5 × ${w} × ${d}`;
        labels.w = 'Base';
        labels.d = 'Base Height';
        break;
      case 'sphere':
        const rSphere = w / 2;
        volume = (4 / 3) * Math.PI * Math.pow(rSphere, 3);
        baseArea = null;
        labels.w = 'Diameter';
        break;
    }
    const filledVolume = volume * (fill / 100);
    return { volume, filledVolume, labels, baseArea, baseAreaCalculation };
  }, [shape, w, h, d, fill]);

  const isPyramidOrCone = ['cone', 'squarePyramid', 'triangularPyramid'].includes(shape);

  // Visual dimensions
  const svgW = shape === 'sphere' ? 120 : 120;
  const svgH = shape === 'sphere' ? 120 : 120;
  const svgD = shape === 'squarePyramid' ? svgW : 80;


  const { translateX, translateY } = useMemo(() => {
    const angle = PERSPECTIVE_ANGLE;
    const dx = svgD * Math.cos(angle);
    const dy = svgD * Math.sin(angle);

    const projectedW = svgW + (shape === 'sphere' ? 0 : dx);
    const projectedH = svgH + (shape === 'sphere' ? 0 : dy);
    
    const viewBoxCenterX = 100;
    const viewBoxCenterY = 100;
    
    const shapeCenterX = projectedW / 2;
    const shapeCenterY = projectedH / 2;

    return {
      translateX: viewBoxCenterX - shapeCenterX,
      translateY: viewBoxCenterY - shapeCenterY
    };
  }, [shape, svgD]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(shapeData) as ShapeType[]).map((s) => {
             const styles = shapeButtonStyles[s];
            return (
              <button
                key={s}
                onClick={() => setShape(s)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${shape === s ? styles.active : styles.inactive}`}
              >
                {shapeData[s].label}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div>
              <label htmlFor="fill" className="block text-sm font-medium text-gray-300">Fill Level ({fill}%)</label>
              <input type="range" id="fill" min="0" max="100" value={fill} onChange={(e) => setFill(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div>
              <label htmlFor="width" className="block text-sm font-medium text-gray-300">{labels.w} ({w})</label>
              <input type="range" id="width" min="10" max="100" value={w} onChange={(e) => setW(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            </div>
            { shape !== 'sphere' &&
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-300">{labels.h} ({h})</label>
                <input type="range" id="height" min="10" max="100" value={h} onChange={(e) => setH(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
              </div>
            }
            { !['cylinder', 'cone', 'squarePyramid', 'sphere'].includes(shape) &&
              <div>
                <label htmlFor="depth" className="block text-sm font-medium text-gray-300">{labels.d} ({d})</label>
                <input type="range" id="depth" min="10" max="100" value={d} onChange={(e) => setD(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
              </div>
            }
          </div>

          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="mb-4 text-center p-4 bg-gray-900 rounded-lg w-full">
                <p className="text-2xl font-sans text-amber-400 tracking-wide">{shapeData[shape].formula}</p>
                <p className="text-sm text-gray-400 mt-1">{shapeData[shape].formulaDetail}</p>
                 {baseArea !== null ? (
                    <div className="mt-4 pt-4 border-t border-gray-700 space-y-4 text-left">
                        {/* Step 1: Base Area */}
                        <div>
                            <h4 className="text-md font-semibold text-sky-400">Step 1: Calculate Base Area (B)</h4>
                            <p className="font-mono bg-gray-800 p-2 rounded mt-1 text-center text-base">
                                B = {baseAreaCalculation} = <span className="font-bold text-white">{baseArea.toFixed(2)}</span> units²
                            </p>
                        </div>

                        {/* Step 2: Volume */}
                        <div>
                            <h4 className="text-md font-semibold text-lime-400">Step 2: Calculate Volume (V)</h4>
                             <p className="text-sm text-gray-400 mb-1">
                                {isPyramidOrCone
                                    ? "Now, multiply B by height (h) and divide by 3."
                                    : "Now, multiply the base area (B) by the height (h)."
                                }
                            </p>
                            <p className="font-mono bg-gray-800 p-2 rounded text-center text-base">
                                V = {isPyramidOrCone ? '⅓ × B × h' : 'B × h'} = {isPyramidOrCone && '⅓ × '}{baseArea.toFixed(2)} × {h}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                        <p className="text-lg text-gray-200">
                            <span className="font-semibold text-sky-400">Radius (r)</span> = <span className="font-mono bg-gray-800 px-2 py-1 rounded">{(w/2).toFixed(2)}</span> units
                        </p>
                    </div>
                )}
                {shape === 'cone' && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-md text-sm text-gray-400 border border-gray-700 text-left">
                        <p>
                            A cone's volume is exactly <strong>⅓</strong> of a cylinder with the same height and radius.
                        </p>
                        {fill === 100 && (
                            <p className="mt-2 text-sky-300 animate-pulse">
                                The gray area shows the extra volume a cylinder would have. That's why we divide by 3!
                            </p>
                        )}
                    </div>
                )}
                 {shape === 'squarePyramid' && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-md text-sm text-gray-400 border border-gray-700 text-left">
                        <p>
                            A square pyramid's volume is exactly <strong>⅓</strong> of a prism with the same base and height.
                        </p>
                        {fill === 100 && (
                            <p className="mt-2 text-sky-300 animate-pulse">
                                The gray area shows the extra ⅔ volume a prism would have. That's why the formula is V = ⅓Bh!
                            </p>
                        )}
                    </div>
                )}
                <div className="mt-4">
                    <p className="text-sm font-medium text-gray-400">Occupied Volume</p>
                    <p className="text-3xl font-bold text-white">
                        {filledVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        <span className="text-xl font-normal text-gray-300"> units³</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Total Volume: {volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} units³
                    </p>
                </div>
            </div>
            <svg width="250" height="250" viewBox="-50 -50 300 300" className="drop-shadow-lg">
                <defs>
                    <linearGradient id="cylinderGradient" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor={FILL_COLORS.shapeSide} />
                        <stop offset="50%" stopColor={FILL_COLORS.shapeTop} />
                        <stop offset="100%" stopColor={FILL_COLORS.shapeSide} />
                    </linearGradient>
                    <linearGradient id="waterCylinderGradient" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor={FILL_COLORS.waterSide} />
                        <stop offset="50%" stopColor={FILL_COLORS.waterFront} />
                        <stop offset="100%" stopColor={FILL_COLORS.waterSide} />
                    </linearGradient>
                     <radialGradient id="sphereGradient" cx="40%" cy="40%">
                        <stop offset="0%" stopColor="hsla(220, 15%, 95%, 0.4)" />
                        <stop offset="100%" stopColor="hsla(220, 15%, 85%, 0.1)" />
                    </radialGradient>
                    <radialGradient id="waterSphereGradient" cx="40%" cy="40%">
                        <stop offset="0%" stopColor="hsla(207, 90%, 80%, 0.9)" />
                        <stop offset="100%" stopColor="hsla(217, 91%, 60%, 0.8)" />
                    </radialGradient>
                </defs>
                <g transform={`translate(${translateX}, ${translateY})`}>
                    <ShapeVisualizer shape={shape} w={svgW} h={svgH} d={svgD} fill={fill} displayW={w} displayH={h} displayD={d}/>
                    <DimensionLabels shape={shape} w={svgW} h={svgH} d={svgD} fill={fill} displayW={w} displayH={h} displayD={d} />
                </g>
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
};
