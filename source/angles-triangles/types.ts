export enum ViewState {
  HOME = 'HOME',
  LESSON_PARALLEL = 'LESSON_PARALLEL',
  PARALLEL_PRACTICE = 'PARALLEL_PRACTICE',
  PARALLEL_ALGEBRA = 'PARALLEL_ALGEBRA',
  LESSON_TRIANGLES = 'LESSON_TRIANGLES',
  TRIANGLE_PRACTICE = 'TRIANGLE_PRACTICE',
  TRIANGLE_ALGEBRA = 'TRIANGLE_ALGEBRA',
  PRACTICE = 'PRACTICE',
  AI_TUTOR = 'AI_TUTOR',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  isLoading?: boolean;
  sources?: string[];
  image?: string; // base64
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  WIDE = '21:9'
}

export enum ImageSize {
  K1 = '1K',
  K2 = '2K',
  K4 = '4K'
}

export interface InteractiveElementState {
  selectedAngle: string | null;
  highlightedPair: string[];
}