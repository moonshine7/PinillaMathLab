export interface ScatterPoint {
  x: number;
  y: number;
  id?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type: 'concept' | 'calculation' | 'interpretation';
  data?: ScatterPoint[];
  trendLine?: { m: number; b: number };
  tableData?: { x: string | number; y: string | number; xLabel?: string; yLabel?: string }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Which equation describes the relationship between x and y in this table?",
    options: ["y = -4x", "y = -1/4x", "y = 4x", "y = 1/4x"],
    correctAnswer: 1,
    explanation: "The slope is (1-2)/(-4 - -8) = -1/4. The y-intercept is 0. So y = -1/4x.",
    type: 'calculation',
    tableData: [
      { x: -8, y: 2 },
      { x: -4, y: 1 },
      { x: 0, y: 0 },
      { x: 4, y: -1 },
      { x: 8, y: -2 }
    ]
  },
  {
    id: 2,
    question: "What type of association would you expect between a person's age and their hair length?",
    options: ["Linear", "Negative", "None", "Positive"],
    correctAnswer: 2,
    explanation: "There is generally no predictable relationship between age and hair length.",
    type: 'concept'
  },
  {
    id: 3,
    question: "In a scatter plot, what is a 'cluster'?",
    options: ["A single point far from others", "A group of points that are close together", "A line that goes through the middle", "The point where the line hits the y-axis"],
    correctAnswer: 1,
    explanation: "A cluster is a set of data points that are grouped closely together.",
    type: 'concept'
  },
  {
    id: 4,
    question: "If a scatter plot shows that as x increases, y decreases, what type of association is it?",
    options: ["Positive", "Negative", "None", "Constant"],
    correctAnswer: 1,
    explanation: "When one variable increases while the other decreases, it's a negative association.",
    type: 'concept'
  },
  {
    id: 5,
    question: "What is an 'outlier' in a scatter plot?",
    options: ["The highest point", "The lowest point", "A point that lies outside the general pattern", "The average of all points"],
    correctAnswer: 2,
    explanation: "An outlier is a data point that is significantly different from the other points in the dataset.",
    type: 'concept'
  },
  {
    id: 6,
    question: "A trend line equation is y = 3x + 10. If x = 5, what is the predicted value of y?",
    options: ["15", "25", "30", "40"],
    correctAnswer: 1,
    explanation: "Plug in x=5: y = 3(5) + 10 = 15 + 10 = 25.",
    type: 'calculation'
  },
  {
    id: 7,
    question: "Which of these is the best description of a 'trend line'?",
    options: ["A line connecting the first and last points", "A line that passes through every single point", "A straight line that comes closest to the points on a scatter plot", "A curved line that follows the data exactly"],
    correctAnswer: 2,
    explanation: "A trend line (or line of best fit) is a straight line that best represents the data on a scatter plot.",
    type: 'concept'
  },
  {
    id: 8,
    question: "If the trend line for ice cream sales vs. temperature is y = 20x - 500 (where x is temp in °F), what happens to sales as temperature increases?",
    options: ["Sales decrease", "Sales stay the same", "Sales increase", "Sales become zero"],
    correctAnswer: 2,
    explanation: "Since the slope (20) is positive, sales increase as temperature increases.",
    type: 'interpretation'
  },
  {
    id: 9,
    question: "Which scatter plot would likely show a positive association?",
    options: ["Hours spent studying vs. Test score", "Value of a car vs. Age of the car", "Shoe size vs. IQ score", "Temperature vs. Hot chocolate sales"],
    correctAnswer: 0,
    explanation: "Generally, as study hours increase, test scores also increase, creating a positive association.",
    type: 'interpretation'
  },
  {
    id: 10,
    question: "What does the y-intercept of a trend line represent in a real-world context?",
    options: ["The rate of change", "The value of y when x is zero", "The maximum possible value", "The average value"],
    correctAnswer: 1,
    explanation: "The y-intercept (b) is the value of the dependent variable (y) when the independent variable (x) is zero.",
    type: 'concept'
  },
  {
    id: 11,
    question: "If a scatter plot has points that form a curve, what type of association is it?",
    options: ["Linear", "Non-linear", "No association", "Negative linear"],
    correctAnswer: 1,
    explanation: "If the points follow a curved pattern rather than a straight line, it is a non-linear association.",
    type: 'concept'
  },
  {
    id: 12,
    question: "In the equation y = mx + b, what does 'm' represent?",
    options: ["The y-intercept", "The x-intercept", "The slope", "The total value"],
    correctAnswer: 2,
    explanation: "In slope-intercept form, 'm' represents the slope (rate of change).",
    type: 'concept'
  },
  {
    id: 13,
    question: "A scatter plot shows the number of rainy days vs. umbrellas sold. If the trend line is y = 0.8x + 1, how many umbrellas are predicted for 10 rainy days?",
    options: ["8", "9", "10", "11"],
    correctAnswer: 1,
    explanation: "y = 0.8(10) + 1 = 8 + 1 = 9.",
    type: 'calculation'
  },
  {
    id: 14,
    question: "Which of these indicates a 'strong' association?",
    options: ["Points are very spread out", "Points are very close to the trend line", "There are many outliers", "The trend line is horizontal"],
    correctAnswer: 1,
    explanation: "A strong association occurs when the data points are clustered tightly around the trend line.",
    type: 'concept'
  },
  {
    id: 15,
    question: "If the slope of a trend line is zero, what does that tell you about the association?",
    options: ["Strong positive", "Strong negative", "No association", "Perfect linear"],
    correctAnswer: 2,
    explanation: "A slope of zero means the y-value doesn't change as x changes, indicating no linear association.",
    type: 'interpretation'
  },
  {
    id: 16,
    question: "Joyce is training for a 10K. Her data is shown in the table. What is the slope of the line connecting these points?",
    options: ["5", "10", "15", "20"],
    correctAnswer: 1,
    explanation: "Slope = (45 - 25) / (4 - 2) = 20 / 2 = 10 minutes per mile.",
    type: 'calculation',
    tableData: [
      { x: 2, y: 25, xLabel: "Distance (mi)", yLabel: "Time (min)" },
      { x: 4, y: 45, xLabel: "Distance (mi)", yLabel: "Time (min)" }
    ]
  },
  {
    id: 17,
    question: "A scatter plot shows the relationship between chapters and pages as shown in the table. What is the equation of the trend line passing through these points?",
    options: ["y = 5x", "y = 10x", "y = 10x + 10", "y = 17x"],
    correctAnswer: 1,
    explanation: "Slope = (170 - 50) / (17 - 5) = 120 / 12 = 10. y - 50 = 10(x - 5) => y = 10x.",
    type: 'calculation',
    tableData: [
      { x: 5, y: 50, xLabel: "Chapters", yLabel: "Pages" },
      { x: 17, y: 170, xLabel: "Chapters", yLabel: "Pages" }
    ]
  },
  {
    id: 18,
    question: "Which of these is NOT something you can typically identify from a scatter plot?",
    options: ["Outliers", "Clusters", "Associations", "The exact cause of the relationship"],
    correctAnswer: 3,
    explanation: "Scatter plots show correlation (association), but they do not prove causation (that one thing causes the other).",
    type: 'concept'
  },
  {
    id: 19,
    question: "If a scatter plot shows a negative association, the trend line will...",
    options: ["Go up from left to right", "Go down from left to right", "Be perfectly horizontal", "Be perfectly vertical"],
    correctAnswer: 1,
    explanation: "A negative association means the line has a negative slope, so it goes down from left to right.",
    type: 'concept'
  },
  {
    id: 20,
    question: "Predict the number of pool visitors when the temperature is 100°F if the trend line is y = 10x - 600.",
    options: ["300", "400", "500", "600"],
    correctAnswer: 1,
    explanation: "y = 10(100) - 600 = 1000 - 600 = 400.",
    type: 'calculation'
  }
];

