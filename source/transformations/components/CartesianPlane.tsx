import React, { useRef, useEffect } from 'react';
import type { Shape, Point, Quadrant } from '../types';

declare const d3: any;

interface CartesianPlaneProps {
    initialShape: Shape;
    finalShape: Shape;
    animationKey: number;
    transformationType: 'translate' | 'reflectX' | 'reflectY' | 'rotate90ccw' | 'rotate90cw' | 'rotate270ccw' | 'rotate270cw' | 'rotate180' | null;
    translationVector: { dx: number; dy: number } | null;
}

const VIEW_BOX_SIZE = 500;
const AXIS_RANGE = 10;
const CENTER = VIEW_BOX_SIZE / 2;
const SCALE = CENTER / AXIS_RANGE;

// Helper to convert Cartesian coordinates to SVG coordinates
const toSvgCoords = (point: { x: number; y: number }) => ({
    x: point.x * SCALE + CENTER,
    y: -point.y * SCALE + CENTER,
});

// Helper to get the position for a vertex label, offset outwards from the shape's center
const getVertexLabelPosition = (point: Point, shape: Shape) => {
    if (!shape.points || shape.points.length === 0) return toSvgCoords(point);
    
    // Calculate centroid of the shape in Cartesian coordinates
    const centroid = shape.points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    centroid.x /= shape.points.length;
    centroid.y /= shape.points.length;

    // Convert points to SVG coordinates
    const svgP = toSvgCoords(point);
    const svgCentroid = toSvgCoords(centroid);

    // Calculate the vector from the centroid to the point
    const dx = svgP.x - svgCentroid.x;
    const dy = svgP.y - svgCentroid.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // If distance is zero (e.g., single point shape), provide a default offset
    if (dist === 0) return { x: svgP.x, y: svgP.y - 15 };

    const OFFSET = 15; // pixels
    // Normalize the vector and scale by the offset
    const offsetX = (dx / dist) * OFFSET;
    const offsetY = (dy / dist) * OFFSET;

    return {
        x: svgP.x + offsetX,
        y: svgP.y + offsetY,
    };
};


// Helper to find the top-center position for a shape's main label ("pre image" or "final image")
const getShapeLabelPosition = (shape: Shape) => {
    if (!shape || !shape.points || shape.points.length === 0) {
        return { x: CENTER, y: CENTER };
    }
    
    // Calculate horizontal center of the shape in SVG coordinates
    const xCoords = shape.points.map(p => p.x);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const horizontalCenter = toSvgCoords({ x: (minX + maxX) / 2, y: 0 }).x;

    // Calculate all vertex label positions
    const vertexLabelPositions = shape.points.map(p => getVertexLabelPosition(p, shape));

    // Find the topmost point (minimum y-coordinate) among all vertex labels
    if (vertexLabelPositions.length === 0) { // Safety check
         const yCoords = shape.points.map(p => p.y);
         const maxY = Math.max(...yCoords);
         const svgPos = toSvgCoords({ x: 0, y: maxY });
         return { x: horizontalCenter, y: svgPos.y - 10 };
    }
    const topmostY = Math.min(...vertexLabelPositions.map(pos => pos.y));
    
    // Position the main label above the highest vertex label to avoid collision
    const LABEL_OFFSET = 20; // pixels
    return {
        x: horizontalCenter,
        y: topmostY - LABEL_OFFSET,
    };
};

const getTransformationRule = (
    transformationType: CartesianPlaneProps['transformationType'],
    translationVector: CartesianPlaneProps['translationVector']
): string => {
    const formatRulePart = (variable: 'x' | 'y', delta: number) => {
        if (delta === 0) return variable;
        const sign = delta > 0 ? '+' : '-';
        return `${variable} ${sign} ${Math.abs(delta)}`;
    };

    switch (transformationType) {
        case 'translate':
            return `(x, y) ⟶ ( ${formatRulePart('x', translationVector?.dx ?? 0)}, ${formatRulePart('y', translationVector?.dy ?? 0)} )`;
        case 'reflectX':
            return `(x, y) ⟶ ( x, -y )`;
        case 'reflectY':
            return `(x, y) ⟶ ( -x, y )`;
        case 'rotate90ccw':
        case 'rotate270cw':
             return `(x, y) ⟶ ( -y, x )`;
        case 'rotate90cw':
        case 'rotate270ccw':
            return `(x, y) ⟶ ( y, -x )`;
        case 'rotate180':
            return `(x, y) ⟶ ( -x, -y )`;
        default:
            return '';
    }
};

// Finds the best position for the rule text to avoid overlapping the shape and its labels.
const getRulePosition = (shape: Shape) => {
    const EDGE_MARGIN = 25; // SVG margin from the outer edge of the plane
    const AXIS_MARGIN = 40; // SVG margin from the X and Y axes
    const PADDING = 20; // Extra padding around the occupied area
    const defaultPosition = { x: VIEW_BOX_SIZE - EDGE_MARGIN, y: EDGE_MARGIN, anchor: 'end' as const };

    if (!shape || !shape.points || shape.points.length === 0) {
        return defaultPosition;
    }

    // 1. Calculate the total occupied area in SVG coordinates, including labels
    const shapeSvgPoints = shape.points.map(toSvgCoords);
    const vertexLabelSvgPoints = shape.points.map(p => getVertexLabelPosition(p, shape));
    const mainLabelSvgPoint = getShapeLabelPosition(shape);

    // If the main label is very far (which can happen before animations), bring it closer for bbox calculation
    if (mainLabelSvgPoint.y < 0) mainLabelSvgPoint.y = 0;
    if (mainLabelSvgPoint.x < 0) mainLabelSvgPoint.x = 0;
    if (mainLabelSvgPoint.y > VIEW_BOX_SIZE) mainLabelSvgPoint.y = VIEW_BOX_SIZE;
    if (mainLabelSvgPoint.x > VIEW_BOX_SIZE) mainLabelSvgPoint.x = VIEW_BOX_SIZE;

    const allSvgPoints = [...shapeSvgPoints, ...vertexLabelSvgPoints, mainLabelSvgPoint];
    
    const minX = Math.min(...allSvgPoints.map(p => p.x)) - PADDING;
    const maxX = Math.max(...allSvgPoints.map(p => p.x)) + PADDING;
    const minY = Math.min(...allSvgPoints.map(p => p.y)) - PADDING;
    const maxY = Math.max(...allSvgPoints.map(p => p.y)) + PADDING;

    const occupiedBBox = { minX, maxX, minY, maxY };

    // 2. Define candidate positions for the rule (the four corners of the target quadrant)
    const { quadrant } = shape;
    
    const candidates: {x: number, y: number, anchor: 'start' | 'end'}[] = [];
    
    // Define the boundaries of the quadrants in SVG coordinates
    const qBounds = {
        q1: { xMin: CENTER + AXIS_MARGIN, xMax: VIEW_BOX_SIZE - EDGE_MARGIN, yMin: EDGE_MARGIN, yMax: CENTER - AXIS_MARGIN },
        q2: { xMin: EDGE_MARGIN, xMax: CENTER - AXIS_MARGIN, yMin: EDGE_MARGIN, yMax: CENTER - AXIS_MARGIN },
        q3: { xMin: EDGE_MARGIN, xMax: CENTER - AXIS_MARGIN, yMin: CENTER + AXIS_MARGIN, yMax: VIEW_BOX_SIZE - EDGE_MARGIN },
        q4: { xMin: CENTER + AXIS_MARGIN, xMax: VIEW_BOX_SIZE - EDGE_MARGIN, yMin: CENTER + AXIS_MARGIN, yMax: VIEW_BOX_SIZE - EDGE_MARGIN },
    };

    const targetBounds = 
        quadrant === 1 ? qBounds.q1 :
        quadrant === 2 ? qBounds.q2 :
        quadrant === 3 ? qBounds.q3 :
        qBounds.q4;

    candidates.push({ x: targetBounds.xMin, y: targetBounds.yMin, anchor: 'start' }); // Top-left of quadrant
    candidates.push({ x: targetBounds.xMax, y: targetBounds.yMin, anchor: 'end' });   // Top-right of quadrant
    candidates.push({ x: targetBounds.xMin, y: targetBounds.yMax, anchor: 'start' }); // Bottom-left of quadrant
    candidates.push({ x: targetBounds.xMax, y: targetBounds.yMax, anchor: 'end' });   // Bottom-right of quadrant

    // 3. Find the best candidate position by maximizing the distance to the occupied bounding box.
    // First, filter out any candidates that are already inside the occupied area.
    const validCandidates = candidates.filter(cand => {
        return cand.x < occupiedBBox.minX || cand.x > occupiedBBox.maxX || cand.y < occupiedBBox.minY || cand.y > occupiedBBox.maxY;
    });

    // If all corners are somehow inside the occupied area, just return the default.
    if (validCandidates.length === 0) {
       return candidates[0] || defaultPosition;
    }

    let bestCandidate = validCandidates[0];
    let maxDist = -1;

    for (const cand of validCandidates) {
        // Calculate the shortest distance from the candidate point to the occupied rectangle
        const dx = Math.max(occupiedBBox.minX - cand.x, 0, cand.x - occupiedBBox.maxX);
        const dy = Math.max(occupiedBBox.minY - cand.y, 0, cand.y - occupiedBBox.maxY);
        const distSq = dx * dx + dy * dy;
        
        if (distSq > maxDist) {
            maxDist = distSq;
            bestCandidate = cand;
        }
    }
    
    return { x: bestCandidate.x, y: bestCandidate.y, anchor: bestCandidate.anchor };
};


export const CartesianPlane: React.FC<CartesianPlaneProps> = ({ initialShape, finalShape, animationKey, transformationType, translationVector }) => {
    const shapeRef = useRef<SVGPolygonElement>(null);
    const ghostRef = useRef<SVGPolygonElement>(null); // For primary transformation overlay
    const ghost2Ref = useRef<SVGPolygonElement>(null); // For equivalent transformation overlay
    const finalLabelRef = useRef<SVGTextElement>(null);
    const finalVertexLabelsRef = useRef<SVGGElement>(null); // Ref for the group of final vertex labels
    const ruleTextRef = useRef<SVGTextElement>(null);
    const ruleBgRef = useRef<SVGRectElement>(null);

    const gridLines = Array.from({ length: AXIS_RANGE * 2 + 1 }, (_, i) => i - AXIS_RANGE);
    
    const initialPointsStr = initialShape.points.map(p => {
        const svgP = toSvgCoords(p);
        return `${svgP.x},${svgP.y}`;
    }).join(' ');

    const preImageLabelPos = getShapeLabelPosition(initialShape);

    const areShapesDifferent = JSON.stringify(initialShape.points) !== JSON.stringify(finalShape.points);

    useEffect(() => {
        if (!shapeRef.current || !ghostRef.current || !ghost2Ref.current || !finalLabelRef.current || !finalVertexLabelsRef.current || !ruleTextRef.current || !ruleBgRef.current || !initialShape || !finalShape) return;

        const shapeElement = d3.select(shapeRef.current);
        const ghostElement = d3.select(ghostRef.current);
        const ghost2Element = d3.select(ghost2Ref.current);
        const finalLabelElement = d3.select(finalLabelRef.current);
        const finalVertexLabelsGroup = d3.select(finalVertexLabelsRef.current);
        const ruleTextElement = d3.select(ruleTextRef.current);
        const ruleBgElement = d3.select(ruleBgRef.current);

        const initialPointsStr = initialShape.points.map(p => `${toSvgCoords(p).x},${toSvgCoords(p).y}`).join(' ');
        const finalPointsStr = finalShape.points.map(p => `${toSvgCoords(p).x},${toSvgCoords(p).y}`).join(' ');
        
        const finalShapeLabelPos = getShapeLabelPosition(finalShape);

        // Data join for final vertex labels
        const labelsUpdate = finalVertexLabelsGroup.selectAll('text').data(finalShape.points);
        labelsUpdate.exit().remove();
        
        const labelsEnter = labelsUpdate.enter().append('text')
            .attr('fill', '#f0f9ff')
            .attr('font-size', '14')
            .attr('font-weight', 'bold')
            .attr('class', 'pointer-events-none')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .text((d, i) => `${String.fromCharCode(65 + i)}'`);

        const allFinalVertexLabels = labelsUpdate.merge(labelsEnter);

        if (!areShapesDifferent) {
            shapeElement.attr('points', finalPointsStr);
            finalLabelElement.attr('x', finalShapeLabelPos.x).attr('y', finalShapeLabelPos.y).style('opacity', 1);
            allFinalVertexLabels
                .attr('x', (d, i) => getVertexLabelPosition(finalShape.points[i], finalShape).x)
                .attr('y', (d, i) => getVertexLabelPosition(finalShape.points[i], finalShape).y)
                .style('opacity', 1);
            return;
        }

        const showRule = () => {
            if (!transformationType) return;
            
            const ruleText = getTransformationRule(transformationType, translationVector);
            const { x, y, anchor } = getRulePosition(finalShape);

            ruleTextElement
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', anchor)
                .text(ruleText);

            setTimeout(() => {
                const bbox = ruleTextRef.current?.getBBox();
                if (!bbox) return;

                const PADDING = 8;
                ruleBgElement
                    .attr('x', bbox.x - PADDING)
                    .attr('y', bbox.y - PADDING)
                    .attr('width', bbox.width + 2 * PADDING)
                    .attr('height', bbox.height + 2 * PADDING)
                    .attr('rx', 5);

                ruleTextElement.transition().delay(750).duration(1500).style('opacity', 1);
                ruleBgElement.transition().delay(750).duration(1500).style('opacity', 1);

            }, 0);
        };

        // --- GLOBAL ANIMATION SETUP ---
        const initialShapeLabelPos = getShapeLabelPosition(initialShape);
        shapeElement.attr('points', initialPointsStr).attr('transform', null);
        finalLabelElement.attr('x', initialShapeLabelPos.x).attr('y', initialShapeLabelPos.y).style('opacity', 0);
        ghostElement.style('opacity', 0).attr('points', initialPointsStr).attr('transform', null);
        ghost2Element.style('opacity', 0).attr('points', initialPointsStr).attr('transform', null);
        ruleTextElement.style('opacity', 0);
        ruleBgElement.style('opacity', 0);

        allFinalVertexLabels
            .attr('x', (d, i) => getVertexLabelPosition(initialShape.points[i], initialShape).x)
            .attr('y', (d, i) => getVertexLabelPosition(initialShape.points[i], initialShape).y)
            .style('opacity', 0);

        const animateLabels = (duration = 2000) => {
             finalLabelElement.transition()
                .duration(duration)
                .ease(d3.easeCubicInOut)
                .attr('x', finalShapeLabelPos.x)
                .attr('y', finalShapeLabelPos.y)
                .transition()
                .duration(200)
                .style('opacity', 1);

            allFinalVertexLabels.transition()
                .duration(duration)
                .ease(d3.easeCubicInOut)
                .attr('x', (d, i) => getVertexLabelPosition(finalShape.points[i], finalShape).x)
                .attr('y', (d, i) => getVertexLabelPosition(finalShape.points[i], finalShape).y)
                .style('opacity', 1);
        }
        
        // --- TRANSLATE ANIMATION ---
        if (transformationType === 'translate') {
            const horizontalDuration = 4500;
            const verticalDuration = 4500;

            // Intermediate points for horizontal-then-vertical movement
            const intermediatePoints = initialShape.points.map((p, i) => ({
                x: finalShape.points[i].x,
                y: p.y,
            }));
            const intermediatePointsStr = intermediatePoints.map(p => `${toSvgCoords(p).x},${toSvgCoords(p).y}`).join(' ');
            
            const intermediateShapeForLabels: Shape = { ...initialShape, points: intermediatePoints };
            const intermediateShapeLabelPos = getShapeLabelPosition(intermediateShapeForLabels);
            
            const animateOverlay = (onComplete?: () => void) => {
                ghostElement
                    .attr('points', initialPointsStr)
                    .style('opacity', 1)
                    .attr('transform', null);
                
                ghostElement.transition()
                    .delay(500)
                    .duration(horizontalDuration)
                    .ease(d3.easeLinear)
                    .attr('points', intermediatePointsStr)
                    .transition()
                    .duration(verticalDuration)
                    .ease(d3.easeLinear)
                    .attr('points', finalPointsStr)
                    .transition()
                    .delay(1500)
                    .duration(500)
                    .style('opacity', 0)
                    .on('end', () => {
                        ghostElement.attr('transform', null);
                        if (onComplete) onComplete();
                    });
            };

            // Animate Shape
            shapeElement.transition()
                .duration(horizontalDuration)
                .ease(d3.easeLinear)
                .attr('points', intermediatePointsStr)
                .transition()
                .duration(verticalDuration)
                .ease(d3.easeLinear)
                .attr('points', finalPointsStr)
                .on('end', () => {
                    animateOverlay(showRule);
                });

            // Animate Labels (move and fade in)
            finalLabelElement.transition()
                .duration(horizontalDuration)
                .ease(d3.easeLinear)
                .attr('x', intermediateShapeLabelPos.x)
                .attr('y', intermediateShapeLabelPos.y)
                .style('opacity', 1)
                .transition()
                .duration(verticalDuration)
                .ease(d3.easeLinear)
                .attr('x', finalShapeLabelPos.x)
                .attr('y', finalShapeLabelPos.y);

            allFinalVertexLabels.transition()
                .duration(horizontalDuration)
                .ease(d3.easeLinear)
                .attr('x', (d, i) => getVertexLabelPosition(intermediateShapeForLabels.points[i], intermediateShapeForLabels).x)
                .attr('y', (d, i) => getVertexLabelPosition(intermediateShapeForLabels.points[i], intermediateShapeForLabels).y)
                .style('opacity', 1)
                .transition()
                .duration(verticalDuration)
                .ease(d3.easeLinear)
                .attr('x', (d, i) => getVertexLabelPosition(finalShape.points[i], finalShape).x)
                .attr('y', (d, i) => getVertexLabelPosition(finalShape.points[i], finalShape).y);
        }
        // --- REFLECT ANIMATIONS ---
        else if (transformationType === 'reflectX' || transformationType === 'reflectY') {
            const duration = 3500;
            const animateSimpleOverlay = (onComplete?: () => void) => {
                ghostElement
                    .attr('points', initialPointsStr)
                    .style('opacity', 1)
                    .attr('transform', null);
                
                ghostElement.transition()
                    .delay(500)
                    .duration(duration)
                    .ease(d3.easeCubicInOut)
                    .attr('points', finalPointsStr)
                    .transition()
                    .delay(2500)
                    .duration(500)
                    .style('opacity', 0)
                    .on('end', () => {
                        ghostElement.attr('transform', null);
                        if (onComplete) onComplete();
                    });
            };
            
            shapeElement.transition()
                .duration(duration)
                .ease(d3.easeCubicInOut)
                .attr('points', finalPointsStr)
                .on('end', () => {
                    animateSimpleOverlay(showRule);
                });
            
            animateLabels(duration);
        } 
        // --- 180 ROTATION ANIMATION ---
        else if (transformationType === 'rotate180') {
             const duration = 4000;
             const animate180Overlays = (onComplete?: () => void) => {
                // First ghost (clockwise path)
                ghostElement.attr('points', initialPointsStr).style('opacity', 1).attr('transform', null);
                ghostElement.transition()
                    .delay(500)
                    .duration(duration)
                    .ease(d3.easeCubicInOut)
                    .attrTween('transform', () => d3.interpolateString(`rotate(0, ${CENTER}, ${CENTER})`, `rotate(180, ${CENTER}, ${CENTER})`))
                    .on('end', () => {
                        // Second ghost (counter-clockwise path)
                        ghost2Element.attr('points', initialPointsStr).style('opacity', 1).attr('transform', null);
                        ghost2Element.transition()
                            .delay(500)
                            .duration(duration)
                            .ease(d3.easeCubicInOut)
                            .attrTween('transform', () => d3.interpolateString(`rotate(0, ${CENTER}, ${CENTER})`, `rotate(-180, ${CENTER}, ${CENTER})`))
                            .on('end', () => {
                                // Fade out both ghosts together
                                d3.transition().delay(1500).duration(500).on('start', () => {
                                    ghostElement.transition().style('opacity', 0);
                                    ghost2Element.transition().style('opacity', 0);
                                }).on('end', () => {
                                    ghostElement.attr('transform', null);
                                    ghost2Element.attr('transform', null);
                                    if (onComplete) onComplete();
                                });
                            });
                    });
            };
            
            shapeElement.transition()
                .duration(duration)
                .ease(d3.easeCubicInOut)
                .attrTween('transform', () => d3.interpolateString(`rotate(0, ${CENTER}, ${CENTER})`, `rotate(180, ${CENTER}, ${CENTER})`))
                .on('end', function() {
                    d3.select(this).attr('points', finalPointsStr).attr('transform', null);
                    animate180Overlays(showRule);
                });
            
            animateLabels(duration);
        }
        // --- 90/270 ROTATION ANIMATIONS ---
        else if (transformationType?.startsWith('rotate')) {
            let rotationAngle = 0;
            let equivalentAngle = 0;
            switch(transformationType) {
                case 'rotate90ccw':  rotationAngle = -90;  equivalentAngle = 270;  break;
                case 'rotate90cw':   rotationAngle = 90;   equivalentAngle = -270; break;
                case 'rotate270ccw': rotationAngle = -270; equivalentAngle = 90;   break;
                case 'rotate270cw':  rotationAngle = 270;  equivalentAngle = -90;  break;
            }

            const getDuration = (angle: number) => Math.abs(angle) > 90 ? 4500 : 3000;
            
            const animateRotationOverlays = (onComplete?: () => void) => {
                // First ghost (primary path)
                ghostElement.attr('points', initialPointsStr).style('opacity', 1).attr('transform', null);
                ghostElement.transition()
                    .delay(500)
                    .duration(getDuration(rotationAngle))
                    .ease(d3.easeCubicInOut)
                    .attrTween('transform', () => d3.interpolateString(`rotate(0, ${CENTER}, ${CENTER})`, `rotate(${rotationAngle}, ${CENTER}, ${CENTER})`))
                    .on('end', () => {
                        // Second ghost (equivalent path)
                        ghost2Element.attr('points', initialPointsStr).style('opacity', 1).attr('transform', null);
                        ghost2Element.transition()
                            .delay(500)
                            .duration(getDuration(equivalentAngle))
                            .ease(d3.easeCubicInOut)
                            .attrTween('transform', () => d3.interpolateString(`rotate(0, ${CENTER}, ${CENTER})`, `rotate(${equivalentAngle}, ${CENTER}, ${CENTER})`))
                            .on('end', () => {
                                // Fade out both ghosts together
                                d3.transition().delay(1500).duration(500).on('start', () => {
                                    ghostElement.transition().style('opacity', 0);
                                    ghost2Element.transition().style('opacity', 0);
                                }).on('end', () => {
                                    ghostElement.attr('transform', null);
                                    ghost2Element.attr('transform', null);
                                    if (onComplete) onComplete();
                                });
                            });
                    });
            };

            shapeElement
                .attr('points', initialPointsStr)
                .transition()
                .duration(getDuration(rotationAngle))
                .ease(d3.easeCubicInOut)
                .attrTween('transform', () => d3.interpolateString(`rotate(0, ${CENTER}, ${CENTER})`, `rotate(${rotationAngle}, ${CENTER}, ${CENTER})`))
                .on('end', function() {
                    d3.select(this).attr('points', finalPointsStr).attr('transform', null);
                    animateRotationOverlays(showRule);
                });
            animateLabels(getDuration(rotationAngle));
        }

    }, [animationKey, finalShape, initialShape, areShapesDifferent, transformationType, translationVector]);


    return (
        <svg viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`} className="w-full h-auto max-w-2xl aspect-square bg-gray-900 rounded-lg">
            {/* Grid Lines */}
            <g className="grid-lines" stroke="rgba(75, 85, 99, 0.5)" strokeWidth="1">
                {gridLines.map(v => (
                    // Vertical lines
                    v !== 0 && <line key={`v-${v}`} x1={toSvgCoords({x: v, y: 0}).x} y1="0" x2={toSvgCoords({x: v, y: 0}).x} y2={VIEW_BOX_SIZE} />
                ))}
                {gridLines.map(v => (
                    // Horizontal lines
                    v !== 0 && <line key={`h-${v}`} x1="0" y1={toSvgCoords({x: 0, y: v}).y} x2={VIEW_BOX_SIZE} y2={toSvgCoords({x: 0, y: v}).y} />
                ))}
            </g>

            {/* Axes */}
            <g className="axes" stroke="#6b7280" strokeWidth="2">
                <line x1="0" y1={CENTER} x2={VIEW_BOX_SIZE} y2={CENTER} /> {/* X-Axis */}
                <line x1={CENTER} y1="0" x2={CENTER} y2={VIEW_BOX_SIZE} /> {/* Y-Axis */}
            </g>

             {/* Axis Labels */}
            <g className="axis-labels" fill="#9ca3af" fontSize="12" textAnchor="middle">
                {gridLines.map(v => {
                    if (v !== 0 && v % 2 === 0) {
                        return (
                            <text key={`lx-${v}`} x={toSvgCoords({x:v, y:0}).x} y={CENTER + 15}>{v}</text>
                        );
                    }
                    return null;
                })}
                 {gridLines.map(v => {
                    if (v !== 0 && v % 2 === 0) {
                        return (
                             <text key={`ly-${v}`} x={CENTER - 15} y={toSvgCoords({x:0, y:v}).y + 4}>{v}</text>
                        );
                    }
                    return null;
                })}
                <text x={VIEW_BOX_SIZE - 10} y={CENTER + 15} fill="#06b6d4" fontSize="14" fontWeight="bold">X</text>
                <text x={CENTER - 15} y={15} fill="#06b6d4" fontSize="14" fontWeight="bold">Y</text>
            </g>
            
             {/* Transformation Rule */}
            <g className="transformation-rule">
                <rect 
                    ref={ruleBgRef} 
                    fill="rgba(45, 212, 191, 0.15)" 
                    stroke="#2dd4bf" 
                    strokeWidth="1.5" 
                    style={{ opacity: 0, pointerEvents: 'none' }} 
                />
                <text
                    ref={ruleTextRef}
                    fill="#5eead4"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="pointer-events-none"
                    dominantBaseline="middle"
                    style={{ opacity: 0 }}
                />
            </g>

            {/* Pre Image (static) */}
            {areShapesDifferent && (
                <>
                    <polygon
                        points={initialPointsStr}
                        fill="rgba(107, 114, 128, 0.4)"
                        stroke="#6b7280"
                        strokeWidth="2"
                        strokeDasharray="4"
                    />
                    <text
                        x={preImageLabelPos.x}
                        y={preImageLabelPos.y}
                        fill="#9ca3af"
                        fontSize="14"
                        fontWeight="bold"
                        className="pointer-events-none"
                        textAnchor="middle"
                    >
                        pre image
                    </text>
                    {/* Pre-image vertex labels */}
                    {initialShape.points.map((p, i) => {
                        const pos = getVertexLabelPosition(p, initialShape);
                        return (
                            <text
                                key={`pre-vertex-${i}`}
                                x={pos.x}
                                y={pos.y}
                                fill="#9ca3af"
                                fontSize="14"
                                fontWeight="bold"
                                className="pointer-events-none"
                                textAnchor="middle"
                                dominantBaseline="central"
                            >
                                {String.fromCharCode(65 + i)}
                            </text>
                        );
                    })}
                </>
            )}

            {/* Animated Shape */}
            <polygon
                ref={shapeRef}
                fill="rgba(14, 165, 233, 0.6)"
                stroke="#0ea5e9"
                strokeWidth="2"
            />
            
            {/* Ghost for primary overlay animation */}
            <polygon
                ref={ghostRef}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                style={{ opacity: 0, pointerEvents: 'none' }}
            />
             {/* Ghost for equivalent rotation overlay animation */}
            <polygon
                ref={ghost2Ref}
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                style={{ opacity: 0, pointerEvents: 'none' }}
            />

             {/* Final Image Label */}
            <text
                ref={finalLabelRef}
                fill="#f0f9ff"
                fontSize="14"
                fontWeight="bold"
                className="pointer-events-none"
                style={{ opacity: 0 }} 
                textAnchor="middle"
            >
                final image
            </text>

            {/* Final Image Vertex Labels (managed by D3) */}
            <g ref={finalVertexLabelsRef} />
        </svg>
    );
};