import React, { useState, useEffect } from 'react';

// Types for Layouts
interface Point { x: number; y: number; }
interface Layout {
  id: string;
  points: { A: Point; B: Point; C: Point; D?: Point }; 
  labels: Record<string, Point>;
}

interface Problem {
  type: 'Sum' | 'Exterior' | 'Isosceles';
  layoutId: string;
  labels: Record<string, string>; // What text to put on diagram for A, B, C, Ext
  equationType: string;
  xVal: number;
  missingAngleVal: number;
}

const LAYOUTS: Layout[] = [
  {
    id: 'standard', 
    points: { A: {x: 200, y: 50}, B: {x: 80, y: 250}, C: {x: 320, y: 250}, D: {x: 380, y: 250} },
    labels: { A: {x: 200, y: 100}, B: {x: 130, y: 230}, C: {x: 280, y: 230}, Ext: {x: 340, y: 230} }
  },
  {
    id: 'right', 
    points: { A: {x: 100, y: 50}, B: {x: 100, y: 250}, C: {x: 300, y: 250}, D: {x: 380, y: 250} },
    labels: { A: {x: 140, y: 100}, B: {x: 130, y: 220}, C: {x: 260, y: 230}, Ext: {x: 330, y: 230} }
  }
];

const TriangleAlgebraPractice: React.FC = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [layout, setLayout] = useState<Layout>(LAYOUTS[0]);
  const [userX, setUserX] = useState('');
  const [userAngle, setUserAngle] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const generateProblem = () => {
    const types = ['Sum', 'Exterior', 'Isosceles'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    
    // Pick layout
    let l = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)];
    // Isosceles looks best on standard
    if (chosenType === 'Isosceles') l = LAYOUTS[0];
    setLayout(l);

    const x = Math.floor(Math.random() * 10) + 5; // X between 5 and 15
    let labels: Record<string, string> = {};
    let missingAngleVal = 0;
    
    if (chosenType === 'Sum') {
        // A + B + C = 180
        // A = mx + b, B = constant, C = constant/expression
        const A_m = Math.floor(Math.random() * 4) + 2;
        const A_b = Math.floor(Math.random() * 20);
        const valA = A_m * x + A_b;
        
        const valB = Math.floor(Math.random() * (100 - 30) + 30);
        const valC = 180 - valA - valB;

        labels = {
            A: `${A_m}x + ${A_b}`,
            B: `${valB}°`,
            C: `${valC}°`
        };
        missingAngleVal = valA; // Let's say we ask for Angle A
    } else if (chosenType === 'Exterior') {
        // Ext = A + B
        const A_m = Math.floor(Math.random() * 3) + 2;
        const A_b = Math.floor(Math.random() * 10);
        const valA = A_m * x + A_b;

        const valB = Math.floor(Math.random() * 50) + 30;
        const valExt = valA + valB;

        labels = {
            A: `${A_m}x + ${A_b}`,
            B: `${valB}°`,
            Ext: `${valExt}°`
        };
        missingAngleVal = valA;
    } else {
        // Isosceles: Base angles equal (B and C)
        const m = Math.floor(Math.random() * 3) + 2;
        const b = Math.floor(Math.random() * 20);
        const val = m * x + b; // Value of B and C
        
        // Expression for B: mx + b
        // Expression for C: val
        labels = {
            B: `${m}x + ${b}`,
            C: `${val}°`
        };
        missingAngleVal = val;
    }

    setProblem({
        type: chosenType as any,
        layoutId: l.id,
        labels,
        equationType: chosenType === 'Sum' ? 'Sum = 180' : chosenType === 'Exterior' ? 'Ext = Int + Int' : 'Base1 = Base2',
        xVal: x,
        missingAngleVal
    });

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

    if (uX !== problem.xVal) {
        setFeedback({ msg: "Incorrect X value. Check your equation setup.", type: 'error' });
        setStreak(0);
        return;
    }

    if (Math.abs(uAng - problem.missingAngleVal) > 1) {
        setFeedback({ msg: "X is correct, but the angle calculation is wrong.", type: 'error' });
        return;
    }

    setFeedback({ msg: "Perfect! You solved the geometry problem.", type: 'success' });
    setStreak(s => s + 1);
  };

  if (!problem) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
      <div className="flex justify-between items-center mb-6 border-b border-emerald-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-emerald-800">Algebra with Triangles</h2>
          <p className="text-emerald-600 text-sm">Find <span className="font-mono bg-emerald-50 px-1 rounded">x</span> and the missing angle.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Streak</span>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">{streak} 🏆</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Diagram Area */}
        <div className="relative flex-shrink-0 flex justify-center bg-slate-50 rounded-lg border border-slate-200 p-4 select-none">
            <svg width="360" height="280" viewBox="0 0 400 300">
                <polygon 
                    points={`${layout.points.A.x},${layout.points.A.y} ${layout.points.B.x},${layout.points.B.y} ${layout.points.C.x},${layout.points.C.y}`} 
                    fill="none" 
                    stroke="#334155" 
                    strokeWidth="3" 
                />
                
                {problem.type === 'Exterior' && (
                     <line 
                        x1={layout.points.C.x} 
                        y1={layout.points.C.y} 
                        x2={layout.points.D?.x || 380} 
                        y2={layout.points.D?.y || 250} 
                        stroke="#334155" 
                        strokeWidth="3" 
                        strokeDasharray="5,5"
                    />
                )}

                {problem.type === 'Isosceles' && (
                     <>
                        <line 
                            x1={(layout.points.A.x + layout.points.B.x)/2 - 5} 
                            y1={(layout.points.A.y + layout.points.B.y)/2} 
                            x2={(layout.points.A.x + layout.points.B.x)/2 + 5} 
                            y2={(layout.points.A.y + layout.points.B.y)/2} 
                            stroke="#ef4444" strokeWidth="3"
                        />
                        <line 
                            x1={(layout.points.A.x + layout.points.C.x)/2 - 5} 
                            y1={(layout.points.A.y + layout.points.C.y)/2} 
                            x2={(layout.points.A.x + layout.points.C.x)/2 + 5} 
                            y2={(layout.points.A.y + layout.points.C.y)/2} 
                            stroke="#ef4444" strokeWidth="3"
                        />
                    </>
                )}

                {/* Labels */}
                {Object.entries(problem.labels).map(([key, text]) => {
                    const pos = layout.labels[key];
                    if(!pos) return null;
                    return (
                        <g key={key}>
                            <foreignObject x={pos.x - 40} y={pos.y - 15} width="80" height="30">
                                <div className="flex items-center justify-center w-full h-full text-xs font-bold bg-white text-indigo-700 border border-indigo-200 rounded shadow-sm px-1">
                                    {text}
                                </div>
                            </foreignObject>
                        </g>
                    )
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
                    Concept: <span className="font-bold text-indigo-600">
                        {problem.type === 'Sum' ? 'Triangle Sum Theorem' : problem.type === 'Exterior' ? 'Exterior Angle Theorem' : 'Isosceles Triangle Theorem'}
                    </span>
                </p>

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
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                            {problem.type === 'Sum' || problem.type === 'Exterior' ? 'Angle with X' : 'Base Angle'}
                        </label>
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
                             💡 
                             {problem.type === 'Sum' && " Add all three angles and set equal to 180."}
                             {problem.type === 'Exterior' && " The Exterior angle equals the sum of the two remote interior angles."}
                             {problem.type === 'Isosceles' && " The two base angles are equal. Set them equal to each other."}
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

export default TriangleAlgebraPractice;