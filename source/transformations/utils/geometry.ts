import type { Point, Shape, ShapeType, Quadrant } from '../types';

const AXIS_RANGE = 9; // Keep shapes away from the very edge

const getRandomNumber = (min: number, max: number) => Math.random() * (max - min) + min;

const getQuadrantBounds = (quadrant: Quadrant) => {
    switch (quadrant) {
        case 1: return { xMin: 1, xMax: AXIS_RANGE, yMin: 1, yMax: AXIS_RANGE };
        case 2: return { xMin: -AXIS_RANGE, xMax: -1, yMin: 1, yMax: AXIS_RANGE };
        case 3: return { xMin: -AXIS_RANGE, xMax: -1, yMin: -AXIS_RANGE, yMax: -1 };
        case 4: return { xMin: 1, xMax: AXIS_RANGE, yMin: -AXIS_RANGE, yMax: -1 };
    }
};

const getQuadrantForPoint = (point: Point): Quadrant => {
    if (point.x > 0 && point.y > 0) return 1;
    if (point.x < 0 && point.y > 0) return 2;
    if (point.x < 0 && point.y < 0) return 3;
    if (point.x > 0 && point.y < 0) return 4;
    // Fallback for points on an axis, though current logic avoids this.
    if (point.x > 0) return 1;
    if (point.x < 0) return 2;
    if (point.y < 0) return 3;
    return 4;
};


export const generateRandomShape = (quadrant: Quadrant): Shape => {
    const shapeTypes: ShapeType[] = ['triangle', 'rectangle', 'trapezoid', 'square'];
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    
    const bounds = getQuadrantBounds(quadrant);
    const points: Point[] = [];

    let w = getRandomNumber(2, 4);
    let h = getRandomNumber(2, 4);
    
    if (type === 'square') {
        w = h = Math.min(w, h); // Ensure it's a square by making sides equal
    }

    const x = getRandomNumber(bounds.xMin, bounds.xMax - w);
    const y = getRandomNumber(bounds.yMin, bounds.yMax - h);

    switch (type) {
        case 'square':
        case 'rectangle':
            points.push({ x, y });
            points.push({ x: x + w, y });
            points.push({ x: x + w, y: y + h });
            points.push({ x, y: y + h });
            break;
        case 'triangle':
            points.push({ x, y });
            points.push({ x: x + w, y });
            points.push({ x: x + w / 2, y: y + h });
            break;
        case 'trapezoid':
             const offset = getRandomNumber(0.5, w * 0.4);
             points.push({ x: x + offset, y });
             points.push({ x: x + w - offset, y });
             points.push({ x: x + w, y: y + h });
             points.push({ x, y: y + h });
            break;
    }

    const roundedPoints = points.map(p => ({
        x: Math.round(p.x),
        y: Math.round(p.y),
    }));

    return { type, points: roundedPoints, quadrant };
};

export const translateShapeToRandomQuadrant = (currentShape: Shape): Shape => {
    const { type, points, quadrant: currentQuadrant } = currentShape;

    // Pick a new, different quadrant
    let newQuadrant: Quadrant;
    do {
        newQuadrant = (Math.floor(Math.random() * 4) + 1) as Quadrant;
    } while (newQuadrant === currentQuadrant);
    
    // Find current shape dimensions and centroid
    const xCoords = points.map(p => p.x);
    const yCoords = points.map(p => p.y);
    const minX = Math.min(...xCoords);
    const minY = Math.min(...yCoords);
    const maxX = Math.max(...xCoords);
    const maxY = Math.max(...yCoords);
    const width = maxX - minX;
    const height = maxY - minY;
    
    const centroidX = (minX + maxX) / 2;
    const centroidY = (minY + maxY) / 2;

    // Determine target position in new quadrant
    const newBounds = getQuadrantBounds(newQuadrant);
    const targetX = getRandomNumber(newBounds.xMin + width / 2, newBounds.xMax - width / 2);
    const targetY = getRandomNumber(newBounds.yMin + height / 2, newBounds.yMax - height / 2);

    // Calculate translation vector
    const dx = targetX - centroidX;
    const dy = targetY - centroidY;

    // Apply translation to all points and round them
    const newPoints = points.map(p => ({
        x: Math.round(p.x + dx),
        y: Math.round(p.y + dy),
    }));
    
    return { type, points: newPoints, quadrant: newQuadrant };
};

export const reflectShapeOverXAxis = (shape: Shape): Shape => {
    const newPoints = shape.points.map(p => ({
        x: p.x,
        y: -p.y,
    }));
    const newQuadrant = getQuadrantForPoint(newPoints[0]);
    return {
        type: shape.type,
        points: newPoints,
        quadrant: newQuadrant,
    };
};

export const reflectShapeOverYAxis = (shape: Shape): Shape => {
    const newPoints = shape.points.map(p => ({
        x: -p.x,
        y: p.y,
    }));
    const newQuadrant = getQuadrantForPoint(newPoints[0]);
    return {
        type: shape.type,
        points: newPoints,
        quadrant: newQuadrant,
    };
};

export const rotateShape90DegreesCCW = (shape: Shape): Shape => {
    // Rotates a shape 90 degrees counter-clockwise around the origin (0,0)
    // Rule: (x, y) -> (-y, x)
    const newPoints = shape.points.map(p => ({
        x: -p.y,
        y: p.x,
    }));
    const newQuadrant = getQuadrantForPoint(newPoints[0]);
    return {
        type: shape.type,
        points: newPoints,
        quadrant: newQuadrant,
    };
};

export const rotateShape90DegreesCW = (shape: Shape): Shape => {
    // Rotates a shape 90 degrees clockwise (or 270 CCW) around the origin (0,0)
    // Rule: (x, y) -> (y, -x)
    const newPoints = shape.points.map(p => ({
        x: p.y,
        y: -p.x,
    }));
    const newQuadrant = getQuadrantForPoint(newPoints[0]);
    return {
        type: shape.type,
        points: newPoints,
        quadrant: newQuadrant,
    };
};

export const rotateShape180Degrees = (shape: Shape): Shape => {
    // Rotates a shape 180 degrees around the origin (0,0)
    // Rule: (x, y) -> (-x, -y)
    const newPoints = shape.points.map(p => ({
        x: -p.x,
        y: -p.y,
    }));
    const newQuadrant = getQuadrantForPoint(newPoints[0]);
    return {
        type: shape.type,
        points: newPoints,
        quadrant: newQuadrant,
    };
};