
import { Problem } from './types';

export const LESSON_DATA = {
  positivePowers: {
    title: "Scientific Notation with Positive Powers of 10",
    description: "Used for expressing very large quantities.",
    examples: [
      { name: "Blue Whale Weight", standard: "250,000", scientific: "2.5 × 10⁵" },
      { name: "Distance to Sun", standard: "93,000,000", scientific: "9.3 × 10⁷" },
      { name: "Light Year", standard: "9,461,000,000,000", scientific: "9.461 × 10¹²" }
    ]
  },
  negativePowers: {
    title: "Scientific Notation with Negative Powers of 10",
    description: "Used for expressing very small quantities.",
    examples: [
      { name: "Atom Diameter", standard: "0.00000003", scientific: "3.0 × 10⁻⁸" },
      { name: "Platelet Diameter", standard: "0.00000233", scientific: "2.33 × 10⁻⁶" },
      { name: "Red Blood Cell", standard: "0.000007", scientific: "7.0 × 10⁻⁶" }
    ]
  }
};

export const PRACTICE_POSITIVE_PROBLEMS: Problem[] = [
  { id: 'pp1', type: 'toScientific', question: '58,927', answer: '5.8927x10^4', hint: 'Move the decimal left 4 places.', difficulty: 'easy' },
  { id: 'pp2', type: 'toScientific', question: '1,304,000,000', answer: '1.304x10^9', hint: 'Move the decimal left 9 places.', difficulty: 'medium' },
  { id: 'pp3', type: 'toStandard', question: '4.5 x 10^5', answer: '450,000', hint: 'Move the decimal right 5 places.', difficulty: 'easy' },
  { id: 'pp4', type: 'toStandard', question: '7.02 x 10^8', answer: '702,000,000', hint: 'Move the decimal right 8 places.', difficulty: 'medium' },
  { id: 'pp5', type: 'toScientific', question: '92,100,000', answer: '9.21x10^7', hint: 'Move the decimal left 7 places.', difficulty: 'medium' }
];

export const PRACTICE_NEGATIVE_PROBLEMS: Problem[] = [
  { id: 'pn1', type: 'toScientific', question: '0.000487', answer: '4.87x10^-4', hint: 'Move the decimal right 4 places.', difficulty: 'medium' },
  { id: 'pn2', type: 'toScientific', question: '0.00000012', answer: '1.2x10^-7', hint: 'Move the decimal right 7 places.', difficulty: 'medium' },
  { id: 'pn3', type: 'toStandard', question: '3.582 x 10^-6', answer: '0.000003582', hint: 'Move the decimal left 6 places.', difficulty: 'hard' },
  { id: 'pn4', type: 'toStandard', question: '8.1 x 10^-3', answer: '0.0081', hint: 'Move the decimal left 3 places.', difficulty: 'easy' },
  { id: 'pn5', type: 'toScientific', question: '0.0000000005', answer: '5x10^-10', hint: 'Move the decimal right 10 places.', difficulty: 'hard' }
];

export const WORD_PROBLEMS: Problem[] = [
  { 
    id: 'wp1', 
    type: 'toScientific', 
    context: 'Astronomy',
    scenario: 'The average distance from Earth to Mars is approximately 225,000,000 kilometers.',
    question: '225,000,000', 
    answer: '2.25x10^8', 
    hint: 'Count how many places you move the decimal point left to get 2.25.', 
    difficulty: 'medium',
    imagePrompt: 'A cinematic high-quality view of Planet Mars in space with Earth visible in the far distance, scientific and awe-inspiring'
  },
  { 
    id: 'wp2', 
    type: 'toStandard', 
    context: 'Microbiology',
    scenario: 'A specific type of bacteria has a mass of about 9.5 x 10^-13 grams.',
    question: '9.5 x 10^-13', 
    answer: '0.00000000000095', 
    hint: 'A negative exponent means the standard number will be very small. Move the decimal 13 places left.', 
    difficulty: 'hard',
    imagePrompt: 'Microscopic view of single-celled bacteria under a high-powered laboratory microscope, colorful and detailed'
  },
  { 
    id: 'wp3', 
    type: 'toScientific', 
    context: 'Technology',
    scenario: 'A modern high-speed computer can perform 4,200,000,000,000 calculations per second.',
    question: '4,200,000,000,000', 
    answer: '4.2x10^12', 
    hint: 'Twelve zeros follow the decimal move.', 
    difficulty: 'medium',
    imagePrompt: 'Futuristic quantum computer processor glowing with blue light and digital data streams'
  },
  { 
    id: 'wp4', 
    type: 'toStandard', 
    context: 'Geography',
    scenario: 'The total surface area of the Earth is approximately 5.1 x 10^8 square kilometers.',
    question: '5.1 x 10^8', 
    answer: '510,000,000', 
    hint: 'Move the decimal point 8 places to the right.', 
    difficulty: 'easy',
    imagePrompt: 'A beautiful satellite view of Earth showing oceans and continents from space'
  },
  { 
    id: 'wp5', 
    type: 'toScientific', 
    context: 'Physics',
    scenario: 'The wavelength of red light is about 0.0000007 meters.',
    question: '0.0000007', 
    answer: '7x10^-7', 
    hint: 'Move the decimal point to the right until you have 7. Count the jumps.', 
    difficulty: 'medium',
    imagePrompt: 'A prism splitting white light into a vibrant rainbow, focusing on the red wavelength'
  }
];
