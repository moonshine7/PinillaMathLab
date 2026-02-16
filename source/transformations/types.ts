export interface Point {
  x: number;
  y: number;
}

export type ShapeType = 'triangle' | 'rectangle' | 'trapezoid' | 'square';

export interface Shape {
  type: ShapeType;
  points: Point[];
  quadrant: Quadrant;
}

export type Quadrant = 1 | 2 | 3 | 4;