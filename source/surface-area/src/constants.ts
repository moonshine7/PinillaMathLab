export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  type: 'rectangular' | 'triangular' | 'cylinder' | 'real-world';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const REAL_WORLD_EXAMPLES = [
  {
    title: "Cereal Box",
    shape: "Rectangular Prism",
    description: "Calculating the amount of cardboard needed to manufacture a standard cereal box.",
    application: "Total Surface Area",
    image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Soda Can",
    shape: "Cylinder",
    description: "Determining the amount of aluminum required for the body and the label.",
    application: "Lateral & Total Area",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Camping Tent",
    shape: "Triangular Prism",
    description: "Estimating the fabric needed for the sides and floor of a tent.",
    application: "Total Surface Area",
    image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Painting a Room",
    shape: "Rectangular Prism",
    description: "Finding out how much paint is needed for the walls (excluding floor and ceiling).",
    application: "Lateral Area",
    image: "https://images.unsplash.com/photo-1562664377-709f2c337eb2?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Water Tank",
    shape: "Cylinder",
    description: "Calculating the sealant needed for the exterior of a large industrial water tank.",
    application: "Total Surface Area",
    image: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&q=80&w=800"
  }
];

export const ALL_QUESTIONS: Question[] = [
  // EASY: Identification and Formulas
  {
    id: 1,
    text: "What is the formula for the lateral area (L) of a prism with base perimeter P and height h?",
    options: ["L = Ph", "L = 2Ph", "L = B + Ph", "L = 2B + Ph"],
    correctAnswer: "L = Ph",
    explanation: "The lateral area is the perimeter of the base times the height of the prism.",
    type: 'rectangular',
    difficulty: 'easy'
  },
  {
    id: 2,
    text: "For a triangular prism, if the base area is B and the lateral area is L, what is the total surface area S?",
    options: ["S = B + L", "S = 2B + L", "S = 3B + L", "S = 2B + 2L"],
    correctAnswer: "S = 2B + L",
    explanation: "Total surface area includes the two bases and the lateral area.",
    type: 'triangular',
    difficulty: 'easy'
  },
  {
    id: 3,
    text: "Which part of the surface area formula represents the 'lids' of a cylinder?",
    options: ["2πrh", "πr²", "2πr²", "Ch"],
    correctAnswer: "2πr²",
    explanation: "2πr² represents the area of the two circular bases (top and bottom).",
    type: 'cylinder',
    difficulty: 'easy'
  },
  {
    id: 4,
    text: "To find the total surface area of a prism, you add the lateral area to how many base areas?",
    options: ["One", "Two", "Three", "Four"],
    correctAnswer: "Two",
    explanation: "Prisms have two congruent bases.",
    type: 'rectangular',
    difficulty: 'easy'
  },
  {
    id: 5,
    text: "What does the 'h' stand for in the lateral area formula L = 2πrh?",
    options: ["Hypotenuse", "Height of the cylinder", "Half of the radius", "Hexagon side"],
    correctAnswer: "Height of the cylinder",
    explanation: "In the formula for a cylinder, h represents the height (the distance between the two circular bases).",
    type: 'cylinder',
    difficulty: 'easy'
  },
  {
    id: 6,
    text: "A rectangular prism has how many faces in total?",
    options: ["4", "6", "8", "12"],
    correctAnswer: "6",
    explanation: "A rectangular prism has 6 faces: top, bottom, front, back, left, and right.",
    type: 'rectangular',
    difficulty: 'easy'
  },
  {
    id: 7,
    text: "In the formula S = 2B + Ph, what does 'P' represent?",
    options: ["Pi", "Power", "Perimeter of the base", "Position"],
    correctAnswer: "Perimeter of the base",
    explanation: "P stands for the perimeter of the base of the prism.",
    type: 'rectangular',
    difficulty: 'easy'
  },

  // MEDIUM: Calculations
  {
    id: 8,
    text: "A rectangular prism has a length of 12 in, width of 8 in, and height of 6 in. What is its total surface area?",
    options: ["192 sq in", "240 sq in", "432 sq in", "480 sq in"],
    correctAnswer: "432 sq in",
    explanation: "S = 2(lw + lh + wh) = 2(12*8 + 12*6 + 8*6) = 2(96 + 72 + 48) = 2(216) = 432.",
    type: 'rectangular',
    difficulty: 'medium'
  },
  {
    id: 9,
    text: "A cylinder has a radius of 4 ft and a height of 7 ft. Using 3.14 for π, what is its lateral area?",
    options: ["175.8 sq ft", "276.3 sq ft", "100.5 sq ft", "351.6 sq ft"],
    correctAnswer: "175.8 sq ft",
    explanation: "L = 2πrh = 2 * 3.14 * 4 * 7 = 175.84.",
    type: 'cylinder',
    difficulty: 'medium'
  },
  {
    id: 10,
    text: "A cube has a side length of 5cm. What is its total surface area?",
    options: ["125 sq cm", "150 sq cm", "100 sq cm", "25 sq cm"],
    correctAnswer: "150 sq cm",
    explanation: "A cube has 6 identical square faces. S = 6 * (5 * 5) = 6 * 25 = 150.",
    type: 'rectangular',
    difficulty: 'medium'
  },
  {
    id: 11,
    text: "A cylindrical pipe is 20 inches long and has a diameter of 4 inches. What is its lateral surface area?",
    options: ["251.2 sq in", "125.6 sq in", "502.4 sq in", "80 sq in"],
    correctAnswer: "251.2 sq in",
    explanation: "Radius r = 2. L = 2πrh = 2 * 3.14 * 2 * 20 = 251.2.",
    type: 'cylinder',
    difficulty: 'medium'
  },
  {
    id: 12,
    text: "A triangular prism has a base perimeter of 15cm and a prism height of 10cm. What is its lateral area?",
    options: ["150 sq cm", "75 sq cm", "300 sq cm", "25 sq cm"],
    correctAnswer: "150 sq cm",
    explanation: "L = Ph = 15 * 10 = 150.",
    type: 'triangular',
    difficulty: 'medium'
  },
  {
    id: 13,
    text: "What is the total surface area of a cylinder with radius 2m and height 5m? (Use π ≈ 3.14)",
    options: ["87.92 sq m", "62.8 sq m", "25.12 sq m", "75.36 sq m"],
    correctAnswer: "87.92 sq m",
    explanation: "S = 2πr² + 2πrh = 2(3.14)(4) + 2(3.14)(2)(5) = 25.12 + 62.8 = 87.92.",
    type: 'cylinder',
    difficulty: 'medium'
  },

  // HARD: Real-World Scenarios
  {
    id: 14,
    text: "You are wrapping a gift box that is 10cm long, 5cm wide, and 4cm high. How much wrapping paper do you need?",
    options: ["110 sq cm", "220 sq cm", "200 sq cm", "100 sq cm"],
    correctAnswer: "220 sq cm",
    explanation: "S = 2(10*5 + 10*4 + 5*4) = 2(50 + 40 + 20) = 2(110) = 220.",
    type: 'real-world',
    difficulty: 'hard'
  },
  {
    id: 15,
    text: "A soup can has a radius of 3cm and a height of 10cm. What is the area of the label (lateral area)?",
    options: ["188.4 sq cm", "244.9 sq cm", "94.2 sq cm", "30.0 sq cm"],
    correctAnswer: "188.4 sq cm",
    explanation: "L = 2πrh = 2 * 3.14 * 3 * 10 = 188.4.",
    type: 'real-world',
    difficulty: 'hard'
  },
  {
    id: 16,
    text: "A triangular prism tent has a base of 6ft, height of 4ft, and sides of 5ft. The tent is 10ft long. What is the total surface area including the floor?",
    options: ["120 sq ft", "184 sq ft", "160 sq ft", "24 sq ft"],
    correctAnswer: "184 sq ft",
    explanation: "Base Area B = 0.5 * 6 * 4 = 12. Perimeter P = 6 + 5 + 5 = 16. Lateral Area L = 16 * 10 = 160. Total S = 2(12) + 160 = 184.",
    type: 'real-world',
    difficulty: 'hard'
  },
  {
    id: 17,
    text: "If you only want to paint the 4 walls of a room that is 15ft by 12ft and 8ft high, what area are you painting?",
    options: ["432 sq ft", "180 sq ft", "216 sq ft", "816 sq ft"],
    correctAnswer: "432 sq ft",
    explanation: "This is lateral area. L = Ph = 2(15 + 12) * 8 = 2(27) * 8 = 54 * 8 = 432.",
    type: 'real-world',
    difficulty: 'hard'
  },
  {
    id: 18,
    text: "A shipping container is 40ft long, 8ft wide, and 8.5ft high. What is the area of the floor?",
    options: ["320 sq ft", "340 sq ft", "68 sq ft", "1000 sq ft"],
    correctAnswer: "320 sq ft",
    explanation: "Floor area is length * width = 40 * 8 = 320.",
    type: 'real-world',
    difficulty: 'hard'
  },
  {
    id: 19,
    text: "A cylindrical water tank needs a new coat of sealant on its exterior (sides and top). If the radius is 10ft and height is 20ft, what area needs sealant?",
    options: ["1570 sq ft", "1256 sq ft", "1884 sq ft", "314 sq ft"],
    correctAnswer: "1570 sq ft",
    explanation: "Area = Lateral Area + Top Base = 2πrh + πr² = 2(3.14)(10)(20) + 3.14(100) = 1256 + 314 = 1570.",
    type: 'real-world',
    difficulty: 'hard'
  },
  {
    id: 20,
    text: "A wedge of cheese is a triangular prism. The triangular base has a base of 4cm and height of 3cm. The wedge is 10cm long. What is the area of the two triangular faces?",
    options: ["12 sq cm", "6 sq cm", "24 sq cm", "10 sq cm"],
    correctAnswer: "12 sq cm",
    explanation: "Area of one triangle is 0.5 * 4 * 3 = 6. Two triangles = 12.",
    type: 'triangular',
    difficulty: 'hard'
  }
];
