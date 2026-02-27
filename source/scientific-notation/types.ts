
export type TabType = 'review' | 'practice-positive' | 'practice-negative' | 'word-problems' | 'assessment-hub' | 'test';

export interface Problem {
  id: string;
  type: 'toScientific' | 'toStandard';
  question: string;
  answer: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  context?: string;
  scenario?: string;
  imagePrompt?: string;
}

export interface TestAssessment {
  id: string;
  title: string;
  problems: Problem[];
  createdAt: number;
}

export interface QuizState {
  questions: Problem[];
  currentIndex: number;
  score: number;
  isComplete: boolean;
  userAnswers: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}
