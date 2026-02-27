
export interface Vertex {
  label: string;
  x: number;
  y: number;
}

export interface ShapeData {
  shapeType: string;
  quadrant: number;
  vertices: Vertex[];
}
