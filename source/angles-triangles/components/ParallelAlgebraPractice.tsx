import React, { useState, useEffect } from 'react';

interface Problem {
  pair: number[];
  type: 'congruent' | 'supplementary';
  relationship: string;
  expr1: string;
  expr2: string;
  xVal: number;
  angleVal: number; // The actual degree measure
}

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
  // Offsets to push equation labels away from the center of the angle point to avoid covering lines
  labelOffsets: Record<number, { dx: number; dy: number }>;
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
    },
    labelOffsets: {
        1: {dx: -60, dy: -30}, 2: {dx: 60, dy: -30},
        3: {dx: -60, dy: 10}, 4: {dx: 60, dy: 10},
        5: {dx: -60, dy: -10}, 6: {dx: 60, dy: -10},
        7: {dx: -60, dy: 30}, 8: {dx: 60, dy: 30}
    }
  },
  {
    id: 'vertical',
    lines: {
      p1: { x1: 140, y1: 50, x2: 140, y2: 250 },
      p2: { x1: 260, y1: 50, x2: 260, y2: 250 },
      t:  { x1: 60, y1: 220, x2: 340, y2: 80 }
    },
    labels: { a: {x: 140, y: 265}, b: {x: 260, y: 265}, t: {x: 55, y: 210} },
    angles: {
      1: {x: 115, y: 160}, 2: {x: 115, y: 200}, 
      3: {x: 165, y: 140}, 4: {x: 165, y: 180},
      5: {x: 235, y: 100}, 6: {x: 235, y: 140},
      7: {x: 285, y: 80},  8: {x: 285, y: 120}
    },
    labelOffsets: {
        1: {dx: -50, dy: -30}, 2: {dx: -50, dy: 30},
        3: {dx: 30, dy: -40}, 4: {dx: 30, dy: 40},
        5: {dx: -30, dy: -40}, 6: {dx: -30, dy: 40},
        7: {dx: 50, dy: -30}, 8: {dx: 50, dy: 30}
    }
  },
  {
    id: 'diagonal',
    lines: {
      p1: { x1: 50, y1: 150, x2: 300, y2: 50 },
      p2: { x1: 100, y1: 250, x2: 350, y2: 150 },
      t:  { x1: 80, y1: 60, x2: 280, y2: 240 }
    },
    labels: { a: {x: 310, y: 50}, b: {x: 360, y: 150}, t: {x: 80, y: 50} },
    angles: {
      1: {x: 130, y: 70}, 2: {x: 170, y: 90}, 
      3: {x: 110, y: 115}, 4: {x: 150, y: 135},
      5: {x: 210, y: 155}, 6: {x: 250, y: 175},
      7: {x: 190, y: 200}, 8: {x: 230, y: 220}
    },
    labelOffsets: {
        1: {dx: -10, dy: -40}, 2: {dx: 50, dy: -40},
        3: {dx: -50, dy: 10}, 4: {dx: 10, dy: 40},
        5: {dx: -10, dy: -40}, 6: {dx: 50, dy: 10},
        7: {dx: -50, dy: 10}, 8: {dx: 10, dy: 40}
    }
  }
];

const ParallelAlgebraPractice: React.FC = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [layout, setLayout] = useState<Layout>(LAYOUTS[0]);
  const [userX, setUserX] = useState('');
  const [userAngle, setUserAngle] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Problem Generators
  const generateProblem = () => {
    // 0. Pick Layout
    const randomLayout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)];
    setLayout(randomLayout);

    // 1. Decide Relationship
    const relationships = [
      { name: 'Alternate Interior Angles', type: 'congruent', pairs: [[3,6], [4,5]] },
      { name: 'Corresponding Angles', type: 'congruent', pairs: [[1,5], [2,6], [3,7], [4,8]] },
      { name: 'Alternate Exterior Angles', type: 'congruent', pairs: [[1,8], [2,7]] },
      { name: 'Same-Side Interior Angles', type: 'supplementary', pairs: [[3,5], [4,6]] },
      { name: 'Linear Pair', type: 'supplementary', pairs: [[1,2], [3,4], [5,6], [7,8]] },
    ];

    const chosenRel = relationships[Math.floor(Math.random() * relationships.length)];
    const pair = chosenRel.pairs[Math.floor(Math.random() * chosenRel.pairs.length)];
    
    // 2. Generate Algebra
    // We want nice integer X.
    const x = Math.floor(Math.random() * 15) + 5; // x between 5 and 20 usually safe
    
    let expr1 = '', expr2 = '', angle = 0;

    if (chosenRel.type === 'congruent') {
      angle = Math.floor(Math.random() * 80) + 50; 
      
      const m1 = Math.floor(Math.random() * 5) + 2;
      const b1 = angle - (m1 * x);
      
      let m2 = Math.floor(Math.random() * 5) + 2;
      if (m2 === m1) m2 += 1;
      const b2 = angle - (m2 * x);

      expr1 = `${m1}x ${b1 >= 0 ? '+' : '-'} ${Math.abs(b1)}`;
      expr2 = `${m2}x ${b2 >= 0 ? '+' : '-'} ${Math.abs(b2)}`;
    } else {
      const angle1 = Math.floor(Math.random() * 80) + 50; 
      const angle2 = 180 - angle1;
      angle = angle1; 

      const m1 = Math.floor(Math.random() * 4) + 2;
      const b1 = angle1 - (m1 * x);
      
      const m2 = Math.floor(Math.random() * 4) + 2;
      const b2 = angle2 - (m2 * x);

      expr1 = `${m1}x ${b1 >= 0 ? '+' : '-'} ${Math.abs(b1)}`;
      expr2 = `${m2}x ${b2 >= 0 ? '+' : '-'} ${Math.abs(b2)}`;
    }

    setProblem({
      pair,
      type: chosenRel.type as 'congruent' | 'supplementary',
      relationship: chosenRel.name,
      expr1,
      expr2,
      xVal: x,
      angleVal: angle 
    });
    
    // Reset UI
    setUserX('');
    setUserAngle('');
    setFeedback({ msg: '', type: null });
    setShowHint(false);
  };

  useEffect(() => {
    generateProblem();
  }, []);

  const handleSubmit = () => {
    if (!problem) return;
    
    const uX = parseFloat(userX);
    const uAng = parseFloat(userAngle);
    
    if (isNaN(uX) || isNaN(uAng)) {
        setFeedback({ msg: "Please enter valid numbers.", type: 'error' });
        return;
    }

    // Check X
    if (uX !== problem.xVal) {
        setFeedback({ msg: `Incorrect X value. Try setting up the equation based on whether angles are Equal or Supplementary.`, type: 'error' });
        setStreak(0);
        return;
    }

    // Check Angle
    let isAngleCorrect = false;
    if (problem.type === 'congruent') {
        isAngleCorrect = Math.abs(uAng - problem.angleVal) < 1;
    } else {
        const ang1 = problem.angleVal;
        const ang2 = 180 - problem.angleVal;
        isAngleCorrect = Math.abs(uAng - ang1) < 1 || Math.abs(uAng - ang2) < 1;
    }

    if (!isAngleCorrect) {
        setFeedback({ msg: `X is correct, but the Angle measure is wrong. Plug X back into the expression!`, type: 'error' });
        return;
    }

    setFeedback({ msg: "Perfect! You solved for X and found the angle.", type: 'success' });
    setStreak(s => s + 1);
  };

  if (!problem) return <div>Loading...</div>;

  const isHighlighted = (id: number) => problem.pair.includes(id);

  // Helper to place labels using the layout's predefined offsets
  const getLabelPosition = (id: number, x: number, y: number) => {
    const offset = layout.labelOffsets[id] || { dx: 40, dy: 0 };
    return { x: x + offset.dx, y: y + offset.dy };
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
      <div className="flex justify-between items-center mb-6 border-b border-emerald-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-emerald-800">Algebra with Parallel Lines</h2>
          <p className="text-emerald-600 text-sm">Find the value of <span className="font-mono bg-emerald-50 px-1 rounded">x</span>.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Streak</span>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">{streak} 🏆</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Diagram Area */}
        <div className="relative flex-shrink-0 flex justify-center bg-slate-50 rounded-lg border border-slate-200 p-4 select-none">
            <svg width="360" height="280" viewBox="0 0 400 300" className="transition-all duration-500">
                {/* Lines */}
                <line x1={layout.lines.p1.x1} y1={layout.lines.p1.y1} x2={layout.lines.p1.x2} y2={layout.lines.p1.y2} stroke="#334155" strokeWidth="3" />
                <line x1={layout.lines.p2.x1} y1={layout.lines.p2.y1} x2={layout.lines.p2.x2} y2={layout.lines.p2.y2} stroke="#334155" strokeWidth="3" />
                <line x1={layout.lines.t.x1} y1={layout.lines.t.y1} x2={layout.lines.t.x2} y2={layout.lines.t.y2} stroke="#ef4444" strokeWidth="3" />
                
                {/* Decorators */}
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
                    const active = isHighlighted(id);
                    const isFirst = active && id === problem.pair[0];
                    const pos = layout.angles[id];
                    const labelPos = getLabelPosition(id, pos.x, pos.y);
                    
                    return (
                        <g key={id}>
                            {/* Angle Number Display - No Circle */}
                            <text 
                                x={pos.x} 
                                y={pos.y} 
                                dominantBaseline="central" 
                                textAnchor="middle" 
                                className={`text-lg font-bold select-none transition-colors duration-300 ${
                                    active 
                                    ? (isFirst ? "fill-blue-600" : "fill-orange-600") 
                                    : "fill-slate-400 opacity-50"
                                }`}
                            >
                                {id}
                            </text>
                            
                            {/* Equation Label */}
                            {active && (
                                <foreignObject x={labelPos.x - 45} y={labelPos.y - 17} width="90" height="35">
                                    <div className={`flex items-center justify-center w-full h-full text-sm font-extrabold rounded-md shadow-md border-2 px-1 z-10 ${
                                        isFirst 
                                        ? 'bg-white text-blue-700 border-blue-600' 
                                        : 'bg-white text-orange-700 border-orange-600'
                                    }`}>
                                        {isFirst ? problem.expr1 : problem.expr2}°
                                    </div>
                                </foreignObject>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>

        {/* Input Area */}
        <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                    <h3 className="font-bold text-slate-800 text-lg">Solve for X</h3>
                </div>
                
                <p className="text-slate-600 mb-4">
                    The highlighted angles are <span className="font-bold text-indigo-600">{problem.relationship}</span>.
                </p>

                <div className="flex flex-col gap-2 p-3 bg-white rounded border border-slate-200 mb-4 text-sm font-mono text-slate-500">
                    <div className="flex items-center gap-2">
                         <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                         <span className="font-bold text-slate-700">Angle 1:</span>
                         <span>{problem.expr1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <span className="w-3 h-3 rounded-full bg-orange-600"></span>
                         <span className="font-bold text-slate-700">Angle 2:</span>
                         <span>{problem.expr2}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">X Value</label>
                        <input 
                            type="number" 
                            value={userX}
                            onChange={(e) => setUserX(e.target.value)}
                            placeholder="x = ?"
                            className="w-full bg-white border-2 border-slate-200 rounded-lg px-3 py-2 text-lg font-bold text-emerald-600 focus:border-emerald-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Angle Measure</label>
                        <input 
                            type="number" 
                            value={userAngle}
                            onChange={(e) => setUserAngle(e.target.value)}
                            placeholder="Degrees"
                            className="w-full bg-white border-2 border-slate-200 rounded-lg px-3 py-2 text-lg font-bold text-emerald-600 focus:border-emerald-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Hint Section */}
                <div className="mt-4">
                    <button 
                        onClick={() => setShowHint(!showHint)}
                        className="text-xs font-bold text-emerald-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {showHint ? "Hide Hint" : "Need a Hint?"}
                    </button>
                    
                    {showHint && (
                        <div className="mt-2 text-sm text-slate-600 bg-emerald-50 p-3 rounded border border-emerald-100 animate-fadeIn">
                             💡 Since these are <strong>{problem.relationship}</strong>, {problem.type === 'congruent' ? 'they are EQUAL.' : 'they add up to 180°.'}
                             <div className="font-mono text-xs mt-1 text-slate-500 bg-white p-1 rounded inline-block border border-slate-100">
                                {problem.type === 'congruent' ? 'Equation: Angle 1 = Angle 2' : 'Equation: Angle 1 + Angle 2 = 180'}
                             </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={handleSubmit}
                    disabled={!!feedback.type && feedback.type === 'success'}
                    className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-md active:scale-[0.98]
                        ${feedback.type === 'success' 
                            ? 'bg-emerald-400 cursor-default' 
                            : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
                        }
                    `}
                >
                    {feedback.type === 'success' ? 'Correct!' : 'Check Answer'}
                </button>

                {feedback.type && (
                    <div className={`p-4 rounded-xl text-sm font-medium flex justify-between items-center animate-fadeIn ${
                        feedback.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        <span className="flex-1 mr-2">{feedback.msg}</span>
                        {feedback.type === 'success' && (
                            <button onClick={generateProblem} className="shrink-0 bg-white px-4 py-2 rounded-lg border border-green-200 hover:bg-green-50 text-green-700 font-bold shadow-sm">Next Problem &rarr;</button>
                        )}
                    </div>
                )}
            </div>
            
        </div>
      </div>
    </div>
  );
};

export default ParallelAlgebraPractice;