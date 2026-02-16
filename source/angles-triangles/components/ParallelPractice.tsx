import React, { useState, useEffect } from 'react';

// Types for Layouts
interface Point { x: number; y: number; }
interface LineCoords { x1: number; y1: number; x2: number; y2: number; }
interface Layout {
  id: string;
  lines: {
    p1: LineCoords;
    p2: LineCoords;
    t: LineCoords;
  };
  labels: { a: Point; b: Point; t: Point; };
  angles: Record<number, Point>;
}

const LAYOUTS: Layout[] = [
  {
    id: 'horizontal',
    lines: {
      p1: { x1: 50, y1: 100, x2: 350, y2: 100 },
      p2: { x1: 50, y1: 200, x2: 350, y2: 200 },
      t:  { x1: 120, y1: 50, x2: 280, y2: 250 }
    },
    labels: { a: {x: 360, y: 105}, b: {x: 360, y: 205}, t: {x: 130, y: 45} },
    angles: {
      1: {x: 145, y: 85}, 2: {x: 175, y: 85},
      3: {x: 145, y: 115}, 4: {x: 175, y: 115},
      5: {x: 225, y: 185}, 6: {x: 255, y: 185},
      7: {x: 225, y: 215}, 8: {x: 255, y: 215}
    }
  },
  {
    id: 'vertical',
    lines: {
      p1: { x1: 140, y1: 50, x2: 140, y2: 250 },
      p2: { x1: 260, y1: 50, x2: 260, y2: 250 },
      t:  { x1: 60, y1: 220, x2: 340, y2: 80 } // Slopes up-right
    },
    labels: { a: {x: 140, y: 265}, b: {x: 260, y: 265}, t: {x: 55, y: 210} },
    angles: {
      // Int 1 (Left Line): T goes BotLeft->TopRight. 
      // 1(Ext/Left), 2(Ext/Left), 3(Int/Right), 4(Int/Right)
      // Visual quadrants relative to intersection: 
      // 1: TopLeft (Left of P1, Above T)
      1: {x: 115, y: 160}, 
      // 2: BotLeft (Left of P1, Below T) -> Actually standard ID 3 is usually BL. 
      // Let's map purely by ID logic: 1,2 top. 3,4 bot.
      // But for vertical, let's say 1,2 are Left of line. 3,4 Right of line.
      2: {x: 115, y: 200}, 
      3: {x: 165, y: 140}, // Interior (Between lines)
      4: {x: 165, y: 180}, // Interior

      // Int 2 (Right Line)
      // 5,6 Left of P2 (Interior). 7,8 Right of P2 (Exterior)
      5: {x: 235, y: 100}, // Interior
      6: {x: 235, y: 140}, // Interior
      7: {x: 285, y: 80},
      8: {x: 285, y: 120}
    }
  },
  {
    id: 'diagonal',
    lines: {
      p1: { x1: 50, y1: 150, x2: 300, y2: 50 }, // Slopes up-right
      p2: { x1: 100, y1: 250, x2: 350, y2: 150 }, // Parallel
      t:  { x1: 80, y1: 60, x2: 280, y2: 240 }  // Slopes down-right
    },
    labels: { a: {x: 310, y: 50}, b: {x: 360, y: 150}, t: {x: 80, y: 50} },
    angles: {
      // Int 1 (Top Left Intersection)
      // Line goes UP-RIGHT. Transversal goes DOWN-RIGHT.
      // 1 (Top), 2 (Right/Int), 3 (Left/Ext), 4 (Bot/Int)
      1: {x: 130, y: 70}, 
      2: {x: 170, y: 90}, 
      3: {x: 110, y: 115}, 
      4: {x: 150, y: 135}, // Interior

      // Int 2 (Bot Right Intersection)
      // 5 (Top/Int), 6 (Right/Ext), 7 (Left/Int), 8 (Bot)
      5: {x: 210, y: 155}, // Interior
      6: {x: 250, y: 175},
      7: {x: 190, y: 200}, 
      8: {x: 230, y: 220}
    }
  }
];

const ParallelPractice: React.FC = () => {
  const [currentPair, setCurrentPair] = useState<number[]>([]);
  const [correctType, setCorrectType] = useState<string>('');
  const [layout, setLayout] = useState<Layout>(LAYOUTS[0]);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Problem Definitions
  // NOTE: The ID pairs assume standard topology. 
  // For 'vertical' and 'diagonal' layouts, we manually positioned IDs 
  // such that 3,4,5,6 remain "Interior" and 1,2,7,8 "Exterior" 
  // and Alternate/Corresponding logic holds visually.
  const problemTypes = [
    { 
      type: 'Corresponding', 
      pairs: [[1,5], [2,6], [3,7], [4,8]],
      description: "Angles in the same relative position at each intersection."
    },
    { 
      type: 'Alternate Interior', 
      pairs: [[3,6], [4,5]], // 3 & 6 are opposite sides of T, between lines
      description: "Angles between the parallel lines on opposite sides of the transversal."
    },
    { 
      type: 'Alternate Exterior', 
      pairs: [[1,8], [2,7]],
      description: "Angles outside the parallel lines on opposite sides of the transversal."
    },
    { 
      type: 'Same-Side Interior', 
      pairs: [[3,5], [4,6]], // 3 & 5 are same side of T, between lines
      description: "Angles between the parallel lines on the same side of the transversal."
    },
    { 
      type: 'Vertical', 
      pairs: [[1,4], [2,3], [5,8], [6,7]],
      description: "Angles opposite each other formed by the intersection of two lines."
    },
    { 
      type: 'Linear Pair', 
      pairs: [[1,2], [3,4], [5,6], [7,8], [1,3], [2,4], [5,7], [6,8]],
      description: "Adjacent angles that form a straight line."
    },
  ];

  const generateProblem = () => {
    // 1. Pick Layout
    const randomLayout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)];
    setLayout(randomLayout);

    // 2. Pick a random type
    const randomTypeIdx = Math.floor(Math.random() * problemTypes.length);
    const selectedType = problemTypes[randomTypeIdx];

    // 3. Pick a random pair from that type
    const randomPairIdx = Math.floor(Math.random() * selectedType.pairs.length);
    const pair = selectedType.pairs[randomPairIdx];

    setCurrentPair(pair);
    setCorrectType(selectedType.type);
    setFeedback({ msg: '', type: null });
    setShowHint(false);
  };

  useEffect(() => {
    generateProblem();
  }, []);

  const handleAnswer = (answer: string) => {
    if (feedback.type) return; // Prevent double guessing

    if (answer === correctType) {
      setFeedback({ msg: 'Correct! Great job.', type: 'success' });
      setStreak(s => s + 1);
    } else {
      setFeedback({ msg: `Incorrect. These are ${correctType} Angles.`, type: 'error' });
      setStreak(0);
    }
  };

  const isHighlighted = (id: number) => currentPair.includes(id);

  const getHintText = () => {
    switch (correctType) {
      case 'Corresponding': return "Think of sliding the intersection along the transversal. They match position.";
      case 'Alternate Interior': return "They are 'Inside' the parallel lines, on opposite sides of the transversal (Z pattern).";
      case 'Alternate Exterior': return "They are 'Outside' the parallel lines, on opposite sides of the transversal.";
      case 'Same-Side Interior': return "They are 'Inside' the parallel lines, on the same side. They face each other.";
      case 'Vertical': return "They share a vertex and are opposite each other (Kissing angles).";
      case 'Linear Pair': return "They are neighbors on a straight line. Together they make a semi-circle.";
      default: return "Review the position of the angles relative to the parallel lines.";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Identify the Angle Relationship</h2>
          <p className="text-slate-500 text-sm">Look at the highlighted angles and select the correct name.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Streak</span>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">{streak} 🔥</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* SVG Diagram - Dynamic Layout */}
        <div className="relative">
            <svg width="360" height="280" viewBox="0 0 400 300" className="bg-slate-50 border rounded-lg transition-all duration-500">
                {/* Parallel Lines */}
                <line x1={layout.lines.p1.x1} y1={layout.lines.p1.y1} x2={layout.lines.p1.x2} y2={layout.lines.p1.y2} stroke="#334155" strokeWidth="3" />
                <line x1={layout.lines.p2.x1} y1={layout.lines.p2.y1} x2={layout.lines.p2.x2} y2={layout.lines.p2.y2} stroke="#334155" strokeWidth="3" />
                
                {/* Transversal */}
                <line x1={layout.lines.t.x1} y1={layout.lines.t.y1} x2={layout.lines.t.x2} y2={layout.lines.t.y2} stroke="#ef4444" strokeWidth="3" />
                
                {/* Labels */}
                <text x={layout.labels.a.x} y={layout.labels.a.y} className="text-xs text-slate-500 italic">a</text>
                <text x={layout.labels.b.x} y={layout.labels.b.y} className="text-xs text-slate-500 italic">b</text>
                <text x={layout.labels.t.x} y={layout.labels.t.y} className="text-xs text-red-500 italic">t</text>

                {/* Parallel Decorators (Arrows) - Roughly midpoint */}
                {layout.id === 'horizontal' && (
                   <>
                     <path d="M 60 100 L 70 95 M 60 100 L 70 105" fill="none" stroke="#334155" strokeWidth="2" />
                     <path d="M 60 200 L 70 195 M 60 200 L 70 205" fill="none" stroke="#334155" strokeWidth="2" />
                   </>
                )}
                {layout.id === 'vertical' && (
                   <>
                     <path d="M 140 60 L 135 70 M 140 60 L 145 70" fill="none" stroke="#334155" strokeWidth="2" />
                     <path d="M 260 60 L 255 70 M 260 60 L 265 70" fill="none" stroke="#334155" strokeWidth="2" />
                   </>
                )}

                {/* Angle Highlights */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => {
                    const pos = layout.angles[id];
                    return (
                        <g key={id}>
                            <circle 
                                cx={pos.x} 
                                cy={pos.y} 
                                r="16" 
                                className={`transition-colors duration-300 ${isHighlighted(id) ? 'fill-rose-500 stroke-rose-600 stroke-2' : 'fill-slate-200 opacity-40'}`} 
                            />
                            <text 
                                x={pos.x} 
                                y={pos.y} 
                                textAnchor="middle" 
                                dominantBaseline="central" 
                                className={`text-sm font-bold ${isHighlighted(id) ? 'fill-white' : 'fill-slate-500 opacity-60'}`}
                            >
                                {id}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>

        {/* Controls */}
        <div className="flex-1 w-full max-w-md">
            <div className="grid grid-cols-2 gap-3">
                {problemTypes.map((pt) => (
                    <div key={pt.type} className="relative group">
                        <button
                            onClick={() => handleAnswer(pt.type)}
                            disabled={!!feedback.type}
                            className={`w-full p-3 rounded-lg text-sm font-semibold border transition-all
                                ${feedback.type 
                                    ? (pt.type === correctType ? 'bg-green-100 border-green-300 text-green-800' : 'bg-slate-50 border-slate-200 text-slate-400')
                                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md text-slate-700 active:scale-95'
                                }
                            `}
                        >
                            {pt.type}
                        </button>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs text-center rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-lg">
                            {pt.description}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Hint Section */}
            <div className="mt-4 flex flex-col items-center">
                 {!feedback.type && (
                     <button 
                        onClick={() => setShowHint(!showHint)}
                        className="text-xs font-bold text-indigo-500 hover:text-indigo-700 underline mb-2 transition-colors"
                     >
                        {showHint ? "Hide Hint" : "Need a Hint?"}
                     </button>
                 )}
                 {showHint && !feedback.type && (
                     <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg border border-yellow-200 w-full text-center animate-fadeIn shadow-sm">
                        💡 <strong>Hint:</strong> {getHintText()}
                     </div>
                 )}
            </div>

            {/* Feedback Area */}
            <div className={`mt-4 p-4 rounded-lg flex justify-between items-center transition-all ${
                feedback.type === 'success' ? 'bg-green-50 border border-green-200' :
                feedback.type === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-transparent'
            }`}>
                <div className="font-medium">
                    {feedback.msg && (
                        <span className={feedback.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                            {feedback.msg}
                        </span>
                    )}
                    {!feedback.msg && <span className="text-slate-400 text-sm">Select an answer above...</span>}
                </div>
                
                {feedback.type && (
                    <button 
                        onClick={generateProblem}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm"
                    >
                        Next Problem &rarr;
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ParallelPractice;