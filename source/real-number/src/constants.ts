export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  visualType?: 'number-line' | 'comparison';
  visualData?: any;
}

export interface WordScenario {
  id: number;
  problem: string;
  options: string[];
  correct: string;
  explanation: string;
}

export const WORD_SCENARIOS: WordScenario[] = [
  {
    id: 1,
    problem: "A diver is 15.5 feet below sea level. What type of number represents their depth?",
    options: ["Natural", "Whole", "Integer", "Rational"],
    correct: "Rational",
    explanation: "-15.5 is a terminating decimal, which is rational but not an integer."
  },
  {
    id: 2,
    problem: "A baker uses 3/4 of a cup of sugar. What type of number is 3/4?",
    options: ["Natural", "Whole", "Integer", "Rational"],
    correct: "Rational",
    explanation: "Fractions are ratios of integers, making them rational numbers."
  },
  {
    id: 3,
    problem: "The number of students in a class is 24. What is the most specific set this belongs to?",
    options: ["Natural", "Whole", "Integer", "Rational"],
    correct: "Natural",
    explanation: "24 is a counting number, so it's Natural (and also Whole, Integer, and Rational)."
  },
  {
    id: 4,
    problem: "The temperature in Antarctica is -40 degrees. What set does this belong to?",
    options: ["Natural", "Whole", "Integer", "Irrational"],
    correct: "Integer",
    explanation: "-40 is a negative whole number, which is an integer."
  }
];

export const DECIMAL_CHALLENGE = [
  { val: '0.5', num: 0.5 },
  { val: '0.05', num: 0.05 },
  { val: '0.55', num: 0.55 },
  { val: '0.505', num: 0.505 },
  { val: '0.055', num: 0.055 }
];

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Which of the following is an irrational number?",
    options: ["0.25", "√16", "π", "2/3"],
    correctAnswer: "π",
    explanation: "π is a non-terminating, non-repeating decimal, which makes it irrational."
  },
  {
    id: 2,
    text: "What type of decimal is 1/3?",
    options: ["Terminating", "Repeating", "Non-terminating, non-repeating", "Whole number"],
    correctAnswer: "Repeating",
    explanation: "1/3 = 0.333..., which is a repeating decimal."
  },
  {
    id: 3,
    text: "Which set does the number -5 belong to?",
    options: ["Whole Numbers", "Integers", "Irrational Numbers", "Natural Numbers"],
    correctAnswer: "Integers",
    explanation: "Integers include positive and negative whole numbers and zero."
  },
  {
    id: 4,
    text: "What is the square root of 144?",
    options: ["10", "12", "14", "16"],
    correctAnswer: "12",
    explanation: "12 × 12 = 144, so √144 = 12."
  },
  {
    id: 5,
    text: "Estimate √20 to the nearest tenth.",
    options: ["4.2", "4.5", "4.8", "5.1"],
    correctAnswer: "4.5",
    explanation: "√16 = 4 and √25 = 5. √20 is roughly in the middle, around 4.47, which rounds to 4.5.",
    visualType: 'number-line',
    visualData: { points: [{ val: 4, label: '√16' }, { val: 5, label: '√25' }], target: 4.47 }
  },
  {
    id: 6,
    text: "Which statement is TRUE?",
    options: [
      "All integers are whole numbers.",
      "All whole numbers are integers.",
      "All rational numbers are integers.",
      "All real numbers are rational."
    ],
    correctAnswer: "All whole numbers are integers.",
    explanation: "The set of whole numbers {0, 1, 2...} is a subset of integers {...-1, 0, 1...}."
  },
  {
    id: 7,
    text: "Which of these is a terminating decimal?",
    options: ["1/3", "1/6", "1/8", "1/9"],
    correctAnswer: "1/8",
    explanation: "1/8 = 0.125, which ends (terminates)."
  },
  {
    id: 8,
    text: "Find the two square roots of 49.",
    options: ["7 only", "7 and -7", "49 and -49", "24.5 and -24.5"],
    correctAnswer: "7 and -7",
    explanation: "Both 7² and (-7)² equal 49."
  },
  {
    id: 9,
    text: "Between which two integers does √30 lie?",
    options: ["4 and 5", "5 and 6", "6 and 7", "3 and 4"],
    correctAnswer: "5 and 6",
    explanation: "√25 = 5 and √36 = 6. Since 25 < 30 < 36, √30 is between 5 and 6.",
    visualType: 'number-line',
    visualData: { points: [{ val: 5, label: '5' }, { val: 6, label: '6' }] }
  },
  {
    id: 10,
    text: "Which number is greater: √10 or 3.2?",
    options: ["√10", "3.2", "They are equal", "Cannot be determined"],
    correctAnswer: "3.2",
    explanation: "√9 = 3 and √16 = 4. √10 is approx 3.16. 3.2 is greater than 3.16.",
    visualType: 'comparison'
  },
  {
    id: 11,
    text: "Is √81/9 a rational or irrational number?",
    options: ["Rational", "Irrational", "Neither", "Both"],
    correctAnswer: "Rational",
    explanation: "√81 = 9, and 9/9 = 1. 1 is a whole number, which is rational."
  },
  {
    id: 12,
    text: "Which set of numbers best describes the number of students in a classroom?",
    options: ["Integers", "Whole Numbers", "Irrational Numbers", "Rational Numbers"],
    correctAnswer: "Whole Numbers",
    explanation: "You can have 0, 1, 2... students. You cannot have negative or fractional students."
  },
  {
    id: 13,
    text: "Order from least to greatest: √5, 2, 2.5",
    options: ["2, √5, 2.5", "√5, 2, 2.5", "2, 2.5, √5", "2.5, √5, 2"],
    correctAnswer: "2, √5, 2.5",
    explanation: "2 = √4, 2.5 = √6.25. So √4 < √5 < √6.25.",
    visualType: 'comparison'
  },
  {
    id: 14,
    text: "A thermometer reads -4.5°C. Which set of numbers does this temperature belong to?",
    options: ["Natural Numbers", "Whole Numbers", "Integers", "Rational Numbers"],
    correctAnswer: "Rational Numbers",
    explanation: "-4.5 is a terminating decimal, which can be written as -9/2. It is rational but not an integer.",
    visualType: 'number-line',
    visualData: { range: [-10, 0], points: [{ val: -4.5, label: '-4.5' }] }
  },
  {
    id: 15,
    text: "What is the decimal equivalent of 7/20?",
    options: ["0.35", "0.7", "0.14", "0.3"],
    correctAnswer: "0.35",
    explanation: "7 ÷ 20 = 0.35."
  },
  {
    id: 16,
    text: "A square garden has an area of 200 sq ft. Estimate the side length to the nearest integer.",
    options: ["10 ft", "14 ft", "15 ft", "20 ft"],
    correctAnswer: "14 ft",
    explanation: "14² = 196 and 15² = 225. 200 is much closer to 196, so 14 is the best integer estimate.",
    visualType: 'comparison'
  },
  {
    id: 17,
    text: "Which of these numbers would be found in the 'Irrational' section of a Real Number diagram?",
    options: ["√100", "√0.49", "√10", "√0"],
    correctAnswer: "√10",
    explanation: "√100=10, √0.49=0.7, √0=0. These are all rational. √10 is non-terminating and non-repeating."
  },
  {
    id: 18,
    text: "True or False: All square roots are irrational.",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation: "Square roots of perfect squares (like √4 = 2) are rational."
  },
  {
    id: 19,
    text: "Which number is between 3.1 and 3.9 on a number line?",
    options: ["√8", "√10", "√16", "√2"],
    correctAnswer: "√10",
    explanation: "√9 = 3 and √16 = 4. √10 is approx 3.16, which is between 3.1 and 3.9.",
    visualType: 'number-line',
    visualData: { range: [3, 4], points: [{ val: 3.1 }, { val: 3.9 }] }
  },
  {
    id: 20,
    text: "What is the value of π rounded to two decimal places?",
    options: ["3.12", "3.14", "3.16", "3.18"],
    correctAnswer: "3.14",
    explanation: "π is approximately 3.14159..., so 3.14 is the standard two-decimal approximation."
  },
  {
    id: 21,
    text: "Estimate √50 to the nearest tenth.",
    options: ["6.9", "7.1", "7.3", "7.5"],
    correctAnswer: "7.1",
    explanation: "√49 = 7 and √64 = 8. √50 is just slightly more than √49, so 7.1 is the best estimate.",
    visualType: 'number-line',
    visualData: { range: [7, 8], points: [{ val: 7, label: '√49' }, { val: 8, label: '√64' }], target: 7.07 }
  },
  {
    id: 22,
    text: "Which number is the smallest?",
    options: ["-√2", "-1.5", "-1.2", "-√3"],
    correctAnswer: "-√3",
    explanation: "√3 ≈ 1.73, so -√3 ≈ -1.73. √2 ≈ 1.41, so -√2 ≈ -1.41. -1.73 is the furthest left on the number line.",
    visualType: 'comparison'
  },
  {
    id: 23,
    text: "A pattern of decimals is 0.1010010001... Is this number rational or irrational?",
    options: ["Rational", "Irrational"],
    correctAnswer: "Irrational",
    explanation: "The pattern never repeats a fixed block of digits and never ends, so it is irrational."
  },
  {
    id: 24,
    text: "If a square has an area of 10 square units, what is the length of one side?",
    options: ["5 units", "√10 units", "10 units", "2.5 units"],
    correctAnswer: "√10 units",
    explanation: "The side length of a square is the square root of its area. Side × Side = Area, so √10 × √10 = 10.",
    visualType: 'comparison'
  },
  {
    id: 25,
    text: "Estimate √150 to the nearest whole number.",
    options: ["11", "12", "13", "14"],
    correctAnswer: "12",
    explanation: "12² = 144 and 13² = 169. 150 is much closer to 144, so 12 is the best whole number estimate.",
    visualType: 'number-line',
    visualData: { range: [11, 14], points: [{ val: 12, label: '12' }, { val: 13, label: '13' }] }
  },
  {
    id: 26,
    text: "Which of the following is ordered correctly from GREATEST to LEAST?",
    options: ["π, 3.14, √9", "√10, π, 3.14", "3.14, π, √10", "√10, 3.14, π"],
    correctAnswer: "√10, π, 3.14",
    explanation: "√10 ≈ 3.16, π ≈ 3.14159, and 3.14 is exactly 3.14. So 3.16 > 3.14159 > 3.14.",
    visualType: 'comparison'
  },
  {
    id: 27,
    text: "Which set of numbers does the number 0 belong to?",
    options: ["Natural Numbers", "Whole Numbers", "Irrational Numbers", "None of these"],
    correctAnswer: "Whole Numbers",
    explanation: "Whole numbers include 0 and all natural numbers. Natural numbers start at 1."
  },
  {
    id: 28,
    text: "A person's height is measured as 1.75 meters. This number is:",
    options: ["Rational", "Irrational", "An Integer", "A Natural Number"],
    correctAnswer: "Rational",
    explanation: "1.75 is a terminating decimal (175/100), which makes it a rational number.",
    visualType: 'number-line',
    visualData: { range: [1, 2], points: [{ val: 1.75, label: '1.75m' }] }
  },
  {
    id: 29,
    text: "Between which two tenths does √80 lie?",
    options: ["8.8 and 8.9", "8.9 and 9.0", "8.7 and 8.8", "9.0 and 9.1"],
    correctAnswer: "8.9 and 9.0",
    explanation: "8.9² = 79.21 and 9.0² = 81. Since 79.21 < 80 < 81, √80 is between 8.9 and 9.0.",
    visualType: 'number-line',
    visualData: { range: [8.5, 9.5], points: [{ val: 8.9 }, { val: 9.0 }] }
  },
  {
    id: 30,
    text: "Which value is closest to √2?",
    options: ["1.4", "1.41", "1.42", "1.5"],
    correctAnswer: "1.41",
    explanation: "1.41² = 1.9881 and 1.42² = 2.0164. 1.9881 is closer to 2 than 2.0164 is.",
    visualType: 'comparison'
  }
];
