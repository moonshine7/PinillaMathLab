import React, { useState, useEffect } from 'react';

// Types for Layouts
interface Point { x: number; y: number; }
interface Layout {
  id: string;
  points: { A: Point; B: Point; C: Point; D?: Point }; // D is ext right
  angles: Record<string, Point>; // key: 'A' (top), 'B' (left), 'C' (right), 'ExtC' (ext right)
}

const LAYOUTS: Layout[] = [
  {
    id: 'standard', // Acute/Scalene looking
    points: { 
        A: {x: 200, y: 50}, 
        B: {x: 80, y: 250}, 
        C: {x: 320, y: 250},
        D: {x: 380, y: 250} // Extension Right
    },
    angles: {
        'A': {x: 200, y: 90},
        'B': {x: 120, y: 240},
        'C': {x: 290, y: 240},
        'ExtC': {x: 340, y: 230}
    }
  },
  {
    id: 'obtuse', // Obtuse triangle
    points: { 
        A: {x: 120, y: 50}, 
        B: {x: 50, y: 250}, 
        C: {x: 250, y: 250},
        D: {x: 350, y: 250} 
    },
    angles: {
        'A': {x: 125, y: 90},
        'B': {x: 80, y: 240},
        'C': {x: 220, y: 240},
        'ExtC': {x: 280, y: 230}
    }
  },
  {
    id: 'right', // Right triangle
    points: { 
        A: {x: 100, y: 50}, 
        B: {x: 100, y: 250}, 
        C: {x: 300, y: 250},
        D: {x: 380, y: 250}
    },
    angles: {
        'A': {x: 120, y: 90},
        'B': {x: 125, y: 225}, // Corner
        'C': {x: 270, y: 240},
        'ExtC': {x: 330, y: 230}
    }
  }
];

const TrianglePractice: React.FC = () => {
  const [currentIds, setCurrentIds] = useState<string[]>([]);
  const [correctType, setCorrectType] = useState<string>('');
  const [layout, setLayout] = useState<Layout>(LAYOUTS[0]);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const problemTypes = [
    { 
      type: 'Triangle Sum Theorem', 
      ids: ['A', 'B', 'C'],
      description: "The sum of the measures of the interior angles of a triangle is always 180°."
    },
    { 
      type: 'Exterior Angle Theorem', 
      ids: ['A', 'B', 'ExtC'],
      description: "The measure of an exterior angle is equal to the sum of the measures of its remote interior angles."
    },
    { 
      type: 'Linear Pair', 
      ids: ['C', 'ExtC'],
      description: "Two adjacent angles that form a straight line add up to 180°."
    },
    {
      type: 'Base Angles Theorem',
      ids: ['B', 'C'], // Only valid if visually we pretend it's isosceles
      description: "If two sides of a triangle are congruent, then the angles opposite those sides are congruent."
    }
  ];

  const generateProblem = () => {
    // 1. Pick Layout
    let randomLayout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)];
    
    // 2. Filter types based on layout availability
    let validTypes = problemTypes;
    
    // Base Angles/Isosceles only really makes visual sense on the standard layout or specific ones
    // We'll avoid it for Right/Obtuse layouts to avoid confusion unless we adjust points dynamically
    if (randomLayout.id !== 'standard') {
        validTypes = problemTypes.filter(t => t.type !== 'Base Angles Theorem');
    }

    const randomTypeIdx = Math.floor(Math.random() * validTypes.length);
    const selectedType = validTypes[randomTypeIdx];

    // Special logic: If Base Angles selected, force standard layout
    if (selectedType.type === 'Base Angles Theorem') {
        randomLayout = LAYOUTS[0]; 
    }

    setLayout(randomLayout);
    setCurrentIds(selectedType.ids);
    setCorrectType(selectedType.type);
    setFeedback({ msg: '', type: null });
    setShowHint(false);
  };

  useEffect(() => {
    generateProblem();
  }, []);

  const handleAnswer = (answer: string) => {
    if (feedback.type) return; 

    if (answer === correctType) {
      setFeedback({ msg: 'Correct! You identified the theorem.', type: 'success' });
      setStreak(s => s + 1);
    } else {
      setFeedback({ msg: `Incorrect. This represents the ${correctType}.`, type: 'error' });
      setStreak(0);
    }
  };

  const isHighlighted = (id: string) => currentIds.includes(id);

  const getHintText = () => {
    switch (correctType) {
      case 'Triangle Sum Theorem': return "Look at all three angles inside the triangle. What do they add up to?";
      case 'Exterior Angle Theorem': return "Relates the outside angle to the two angles farthest away inside.";
      case 'Linear Pair': return "These two angles sit next to each other on a straight line.";
      case 'Base Angles Theorem': return "Look at the two bottom angles. In an isosceles triangle, they are equal.";
      default: return "Review the highlighted angles.";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Identify the Triangle Relationship</h2>
          <p className="text-slate-500 text-sm">Look at the highlighted angles and select the correct theorem or concept.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Streak</span>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">{streak} 🔥</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* SVG Diagram */}
        <div className="relative">
            <svg width="360" height="280" viewBox="0 0 400 300" className="bg-slate-50 border rounded-lg transition-all duration-500">
                {/* Triangle */}
                <polygon 
                    points={`${layout.points.A.x},${layout.points.A.y} ${layout.points.B.x},${layout.points.B.y} ${layout.points.C.x},${layout.points.C.y}`} 
                    fill="none" 
                    stroke="#334155" 
                    strokeWidth="3" 
                />
                
                {/* Extension Line for Exterior */}
                {layout.points.D && (
                    <line 
                        x1={layout.points.C.x} 
                        y1={layout.points.C.y} 
                        x2={layout.points.D.x} 
                        y2={layout.points.D.y} 
                        stroke="#334155" 
                        strokeWidth="3" 
                        strokeDasharray="5,5"
                    />
                )}

                {/* Isosceles Tick Marks if Base Angles Theorem */}
                {correctType === 'Base Angles Theorem' && (
                    <>
                        {/* Tick on left leg */}
                        <line 
                            x1={(layout.points.A.x + layout.points.B.x)/2 - 10} 
                            y1={(layout.points.A.y + layout.points.B.y)/2} 
                            x2={(layout.points.A.x + layout.points.B.x)/2 + 10} 
                            y2={(layout.points.A.y + layout.points.B.y)/2} 
                            stroke="#ef4444" strokeWidth="3"
                        />
                        {/* Tick on right leg */}
                        <line 
                            x1={(layout.points.A.x + layout.points.C.x)/2 - 10} 
                            y1={(layout.points.A.y + layout.points.C.y)/2} 
                            x2={(layout.points.A.x + layout.points.C.x)/2 + 10} 
                            y2={(layout.points.A.y + layout.points.C.y)/2} 
                            stroke="#ef4444" strokeWidth="3"
                        />
                    </>
                )}

                {/* Right Angle Box if Right Layout */}
                {layout.id === 'right' && (
                     <path d={`M ${layout.points.B.x} ${layout.points.B.y-20} L ${layout.points.B.x+20} ${layout.points.B.y-20} L ${layout.points.B.x+20} ${layout.points.B.y}`} fill="none" stroke="#334155" strokeWidth="2" />
                )}

                {/* Angle Highlights */}
                {Object.entries(layout.angles).map(([key, val]) => {
                    const pos = val as Point;
                    const active = isHighlighted(key);
                    return (
                        <g key={key}>
                            <circle 
                                cx={pos.x} 
                                cy={pos.y} 
                                r="18" 
                                className={`transition-colors duration-300 ${active ? 'fill-rose-500 stroke-rose-600 stroke-2' : 'fill-slate-200 opacity-0'}`} 
                            />
                            {active && (
                                <text 
                                    x={pos.x} 
                                    y={pos.y} 
                                    textAnchor="middle" 
                                    dominantBaseline="central" 
                                    className="text-xs font-bold fill-white pointer-events-none"
                                >
                                    {key.replace('Ext', 'Ext ')}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>

        {/* Controls */}
        <div className="flex-1 w-full max-w-md">
            <div className="grid grid-cols-1 gap-3">
                {problemTypes.map((pt) => (
                    <button
                        key={pt.type}
                        onClick={() => handleAnswer(pt.type)}
                        disabled={!!feedback.type}
                        className={`w-full p-4 rounded-lg text-left text-sm font-semibold border transition-all flex flex-col gap-1
                            ${feedback.type 
                                ? (pt.type === correctType ? 'bg-green-100 border-green-300 text-green-800' : 'bg-slate-50 border-slate-200 text-slate-400')
                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md text-slate-700 active:scale-[0.99]'
                            }
                        `}
                    >
                        <span className="text-base">{pt.type}</span>
                        <span className={`text-xs font-normal ${feedback.type ? '' : 'text-slate-500'}`}>{pt.description}</span>
                    </button>
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
                    {!feedback.msg && <span className="text-slate-400 text-sm">Select a theorem above...</span>}
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

export default TrianglePractice;