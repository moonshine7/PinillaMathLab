export type InequalityType = '=' | '>' | '<' | '>=' | '<=';

export interface LineEquation {
  slope: number;
  intercept: number;
  name: string; // e.g., "Company A"
  isProportional: boolean;
  inequality: InequalityType;
}

export interface MathScenario {
  title: string;
  description: string; // The real world context explanation
  equation1: LineEquation;
  equation2: LineEquation;
  intersectionPoint: {
    x: number;
    y: number;
  };
  realWorldImplication: string; // What the intersection means in context
  comparisonOperator?: InequalityType; // The operator comparing Eq1 and Eq2 (e.g., <, >=)
}

export interface GraphDataPoint {
  x: number;
  y1: number;
  y2: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: 'Equation' | 'Inequality';
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}