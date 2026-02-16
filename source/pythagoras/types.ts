
export enum LessonType {
  THEOREM = 'THEOREM',
  CONVERSE = 'CONVERSE',
  COORDINATE_GEOMETRY = 'COORDINATE_GEOMETRY',
  DISTANCE = 'DISTANCE',
  FINAL_EXAM = 'FINAL_EXAM'
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface Question {
  id: string;
  type: LessonType;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  data?: any; // For visual data like coordinates
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  showResults: boolean;
  userAnswers: number[];
}
