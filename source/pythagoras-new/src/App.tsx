/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Calculator, 
  CheckCircle2, 
  ChevronRight, 
  HelpCircle, 
  Home, 
  Layers, 
  Map, 
  RefreshCw, 
  Trophy,
  Zap,
  CheckSquare,
  Globe,
  Printer,
  FileText,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type Tab = 'intro' | 'learn' | 'converse' | 'real-world' | 'practice' | 'quiz';

interface Problem {
  id: string;
  type: 'missing-side' | 'converse' | 'distance' | 'word-problem' | 'navigation';
  question: string;
  data: any;
  answer: number | boolean;
  explanation: string;
  unit?: string;
  illustrationType?: 'triangle' | 'plane' | 'scenario';
}

// --- Components ---

const TabButton = ({ 
  active, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: any; 
  label: string 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium",
      active 
        ? "bg-indigo-600 text-white shadow-md" 
        : "text-slate-600 hover:bg-slate-100"
    )}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const Card = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white rounded-2xl shadow-sm border border-slate-200 p-6", 
      onClick && "cursor-pointer hover:border-indigo-200 transition-colors",
      className
    )}
  >
    {children}
  </div>
);

const RightTriangle = ({ a, b, c, labelA, labelB, labelC, highlightSide }: { 
  a: number; 
  b: number; 
  c?: number;
  labelA?: string;
  labelB?: string;
  labelC?: string;
  highlightSide?: 'a' | 'b' | 'c';
}) => {
  // Scale for display
  const max = Math.max(a, b);
  const scale = 150 / max;
  const displayA = a * scale;
  const displayB = b * scale;

  return (
    <div className="relative flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100">
      <svg width="220" height="220" viewBox="-20 -20 200 200" className="overflow-visible">
        {/* The Triangle */}
        <path
          d={`M 0,${displayA} L ${displayB},${displayA} L 0,0 Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-indigo-600"
        />
        {/* Right Angle Square */}
        <path
          d={`M 0,${displayA - 15} L 15,${displayA - 15} L 15,${displayA}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-indigo-300"
        />
        
        {/* Labels */}
        <text 
          x={-15} 
          y={displayA / 2} 
          className={cn("text-xs font-bold fill-slate-600", highlightSide === 'a' && "fill-indigo-600")}
          textAnchor="end"
        >
          {labelA || 'a'}
        </text>
        <text 
          x={displayB / 2} 
          y={displayA + 20} 
          className={cn("text-xs font-bold fill-slate-600", highlightSide === 'b' && "fill-indigo-600")}
          textAnchor="middle"
        >
          {labelB || 'b'}
        </text>
        <text 
          x={displayB / 2 + 10} 
          y={displayA / 2 - 10} 
          className={cn("text-xs font-bold fill-slate-600", highlightSide === 'c' && "fill-indigo-600")}
          textAnchor="start"
        >
          {labelC || 'c'}
        </text>
      </svg>
    </div>
  );
};

const CartesianPlane = ({ x1, y1, x2, y2, showTriangle = false }: { 
  x1: number; 
  y1: number; 
  x2: number; 
  y2: number;
  showTriangle?: boolean;
}) => {
  const size = 200;
  const padding = 20;
  const gridMax = 10;
  const scale = (size - 2 * padding) / gridMax;

  const toPx = (val: number, isX: boolean) => {
    if (isX) return padding + val * scale;
    return size - (padding + val * scale);
  };

  const p1 = { x: toPx(x1, true), y: toPx(y1, false) };
  const p2 = { x: toPx(x2, true), y: toPx(y2, false) };
  const p3 = { x: toPx(x2, true), y: toPx(y1, false) }; // Corner of the right triangle

  return (
    <div className="relative flex items-center justify-center p-4 bg-white rounded-xl border border-slate-200">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid Lines */}
        {Array.from({ length: gridMax + 1 }).map((_, i) => (
          <React.Fragment key={i}>
            <line 
              x1={padding} y1={toPx(i, false)} x2={size - padding} y2={toPx(i, false)} 
              stroke="#e2e8f0" strokeWidth="1" 
            />
            <line 
              x1={toPx(i, true)} y1={padding} x2={toPx(i, true)} y2={size - padding} 
              stroke="#e2e8f0" strokeWidth="1" 
            />
          </React.Fragment>
        ))}

        {/* Axes */}
        <line x1={padding} y1={toPx(0, false)} x2={size - padding} y2={toPx(0, false)} stroke="#94a3b8" strokeWidth="2" />
        <line x1={toPx(0, true)} y1={padding} x2={toPx(0, true)} y2={size - padding} stroke="#94a3b8" strokeWidth="2" />

        {/* Triangle Method */}
        {showTriangle && (
          <>
            {/* Horizontal Leg */}
            <line x1={p1.x} y1={p1.y} x2={p3.x} y2={p3.y} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
            {/* Vertical Leg */}
            <line x1={p3.x} y1={p3.y} x2={p2.x} y2={p2.y} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
            {/* Right Angle Marker */}
            <path 
              d={`M ${p3.x + (x1 < x2 ? -10 : 10)},${p3.y} L ${p3.x + (x1 < x2 ? -10 : 10)},${p3.y + (y1 < y2 ? -10 : 10)} L ${p3.x},${p3.y + (y1 < y2 ? -10 : 10)}`}
              fill="none" stroke="#f59e0b" strokeWidth="1"
            />
          </>
        )}

        {/* Hypotenuse / Distance */}
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#6366f1" strokeWidth="3" />

        {/* Points */}
        <circle cx={p1.x} cy={p1.y} r="4" fill="#4f46e5" />
        <circle cx={p2.x} cy={p2.y} r="4" fill="#4f46e5" />

        {/* Labels */}
        <text x={p1.x} y={p1.y - 8} fontSize="10" textAnchor="middle" fontWeight="bold" fill="#1e293b">({x1},{y1})</text>
        <text x={p2.x} y={p2.y - 8} fontSize="10" textAnchor="middle" fontWeight="bold" fill="#1e293b">({x2},{y2})</text>
      </svg>
    </div>
  );
};

const ScenarioIllustration = ({ type, values }: { type: string; values: any }) => {
  const color = type === 'tv' ? '#6366f1' : type === 'ladder' ? '#f59e0b' : type === 'park' ? '#10b981' : type === 'tree' ? '#8b5cf6' : '#3b82f6';
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 p-4">
      <svg width="100%" height="100%" viewBox="0 0 200 120" className="overflow-visible">
        {type === 'tv' && (
          <>
            {/* TV Frame */}
            <rect x="30" y="20" width="140" height="80" rx="4" fill="none" stroke="#1e293b" strokeWidth="4" />
            <rect x="35" y="25" width="130" height="70" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            {/* Diagonal */}
            <line x1="35" y1="95" x2="165" y2="25" stroke={color} strokeWidth="3" strokeDasharray="4" />
            {/* Labels */}
            <text x="100" y="110" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#64748b">{values.w} in</text>
            <text x="20" y="60" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#64748b" transform="rotate(-90, 20, 60)">{values.h} in</text>
            <text x="105" y="55" fontSize="12" fontWeight="black" fill={color} transform="rotate(-28, 105, 55)">?</text>
          </>
        )}
        {type === 'ladder' && (
          <>
            {/* Wall */}
            <line x1="40" y1="10" x2="40" y2="100" stroke="#94a3b8" strokeWidth="6" />
            {/* Ground */}
            <line x1="30" y1="100" x2="170" y2="100" stroke="#1e293b" strokeWidth="2" />
            {/* Ladder */}
            <line x1="40" y1="20" x2="120" y2="100" stroke={color} strokeWidth="4" />
            {/* Rungs */}
            {[0.2, 0.4, 0.6, 0.8].map((p, i) => (
              <line 
                key={i}
                x1={40 + (120-40)*p - 5} y1={20 + (100-20)*p} 
                x2={40 + (120-40)*p + 5} y2={20 + (100-20)*p} 
                stroke={color} strokeWidth="2" 
              />
            ))}
            {/* Labels */}
            <text x="30" y="60" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#64748b" transform="rotate(-90, 30, 60)">?</text>
            <text x="80" y="115" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#64748b">{values.d} ft</text>
            <text x="95" y="55" fontSize="10" fontWeight="bold" fill={color} transform="rotate(45, 95, 55)">{values.l} ft</text>
          </>
        )}
        {type === 'park' && (
          <>
            {/* Paths */}
            <path d="M 40,90 L 140,90 L 140,20" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
            {/* Shortcut */}
            <line x1="40" y1="90" x2="140" y2="20" stroke={color} strokeWidth="3" />
            {/* Right Angle */}
            <path d="M 130,90 L 130,80 L 140,80" fill="none" stroke="#94a3b8" strokeWidth="1" />
            {/* Labels */}
            <text x="90" y="105" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#64748b">{values.e} m</text>
            <text x="155" y="55" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#64748b" transform="rotate(90, 155, 55)">{values.n} m</text>
            <text x="80" y="50" fontSize="12" fontWeight="black" fill={color} transform="rotate(-35, 80, 50)">?</text>
          </>
        )}
        {type === 'tree' && (
          <>
            {/* Ground */}
            <line x1="30" y1="100" x2="170" y2="100" stroke="#1e293b" strokeWidth="2" />
            {/* Trunk Base */}
            <line x1="50" y1="100" x2="50" y2="70" stroke="#78350f" strokeWidth="6" />
            {/* Broken Part */}
            <line x1="50" y1="70" x2="140" y2="100" stroke="#78350f" strokeWidth="4" />
            {/* Leaves */}
            <circle cx="145" cy="100" r="10" fill="#15803d" />
            <circle cx="135" cy="95" r="8" fill="#166534" />
            {/* Labels */}
            <text x="40" y="85" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#64748b" transform="rotate(-90, 40, 85)">{values.h1} ft</text>
            <text x="95" y="115" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#64748b">{values.d} ft</text>
            <text x="100" y="80" fontSize="12" fontWeight="black" fill={color} transform="rotate(18, 100, 80)">?</text>
          </>
        )}
      </svg>
    </div>
  );
};

const ScenarioCard = ({ scenario }: any) => {
  const [val, setVal] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  const check = () => {
    const correctAns = scenario.calculate(scenario.values);
    const isCorrect = Math.abs(parseFloat(val) - correctAns) < 0.5;
    if (isCorrect) {
      setFeedback({ correct: true, message: `Correct! The answer is ${correctAns.toFixed(1)} ${scenario.unit}.` });
    } else {
      setFeedback({ correct: false, message: `Try again! Hint: Use the Pythagorean Theorem.` });
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden border-slate-200">
      <div className="relative w-full h-48 bg-slate-50 border-b border-slate-100">
        <ScenarioIllustration type={scenario.id} values={scenario.values} />
        <div className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200">
          {scenario.icon}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h4 className="font-bold text-lg mb-2">{scenario.title}</h4>
        <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">
          {scenario.description(Object.values(scenario.values)[0], Object.values(scenario.values)[1])}
        </p>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input 
              type="number" 
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold" 
              placeholder={`Answer in ${scenario.unit}...`} 
            />
            <button 
              onClick={check} 
              className={cn(
                "px-4 py-2 text-white rounded-lg font-bold transition-all shadow-sm",
                scenario.color === 'indigo' ? "bg-indigo-600 hover:bg-indigo-700" :
                scenario.color === 'orange' ? "bg-orange-600 hover:bg-orange-700" :
                scenario.color === 'emerald' ? "bg-emerald-600 hover:bg-emerald-700" :
                "bg-violet-600 hover:bg-violet-700"
              )}
            >
              Check
            </button>
          </div>
          
          {feedback && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "p-3 rounded-lg text-xs font-bold",
                feedback.correct ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
              )}
            >
              {feedback.message}
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
};

// --- Quiz Component ---

const QuizComponent = ({ onComplete }: { onComplete: (score: number) => void }) => {
  const [quizMode, setQuizMode] = useState<'online' | 'printable'>('online');
  const [step, setStep] = useState<'start' | 'playing' | 'end'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [questions, setQuestions] = useState<Problem[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  const startQuiz = () => {
    const newQuestions: Problem[] = [];
    const pool: Problem[] = [];

    // 1. Missing Side Problems (4)
    for (let i = 0; i < 4; i++) {
      const a = 3 + Math.floor(Math.random() * 10);
      const b = 4 + Math.floor(Math.random() * 10);
      const c = Math.sqrt(a * a + b * b);
      pool.push({
        id: `ms-${i}`,
        type: 'missing-side',
        question: `Find the hypotenuse (c) if the legs are a = ${a} and b = ${b}.`,
        data: { a, b, missing: 'c' },
        answer: Number(c.toFixed(1)),
        explanation: `${a}² + ${b}² = ${a*a} + ${b*b} = ${a*a + b*b}. √${a*a + b*b} ≈ ${c.toFixed(1)}`,
        illustrationType: 'triangle'
      });
    }

    // 2. Converse Problems (4)
    const triples = [[3,4,5], [5,12,13], [8,15,17], [7,24,25], [20,21,29]];
    for (let i = 0; i < 4; i++) {
      const isRight = Math.random() > 0.5;
      let a, b, c;
      if (isRight) {
        [a, b, c] = triples[i % triples.length];
      } else {
        a = 5 + i; b = 10 + i; c = 12 + i;
      }
      pool.push({
        id: `conv-${i}`,
        type: 'converse',
        question: `Do the side lengths ${a}, ${b}, and ${c} form a right triangle? (Answer Yes or No)`,
        data: { a, b, c },
        answer: isRight,
        explanation: `${a}² + ${b}² = ${a*a + b*b}. ${c}² = ${c*c}. ${a*a + b*b} ${isRight ? '=' : '≠'} ${c*c}`,
      });
    }

    // 3. Distance on Plane (4)
    for (let i = 0; i < 4; i++) {
      const x1 = Math.floor(Math.random() * 5);
      const y1 = Math.floor(Math.random() * 5);
      const x2 = x1 + 3 + Math.floor(Math.random() * 2);
      const y2 = y1 + 4 + Math.floor(Math.random() * 2);
      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      const d = Math.sqrt(dx*dx + dy*dy);
      pool.push({
        id: `dist-${i}`,
        type: 'distance',
        question: `Find the distance between points (${x1}, ${y1}) and (${x2}, ${y2}).`,
        data: { x1, y1, x2, y2 },
        answer: Number(d.toFixed(1)),
        explanation: `Legs are ${dx} and ${dy}. ${dx}² + ${dy}² = ${dx*dx + dy*dy}. √${dx*dx + dy*dy} ≈ ${d.toFixed(1)}`,
        illustrationType: 'plane'
      });
    }

    // 4. Navigation (4)
    const dirs = [
      { n: 30, e: 40, ans: 50 },
      { n: 60, w: 80, ans: 100 },
      { s: 5, e: 12, ans: 13 },
      { s: 9, w: 12, ans: 15 }
    ];
    dirs.forEach((d: any, i) => {
      const keys = Object.keys(d).filter(k => k !== 'ans');
      const q = `A ship travels ${d[keys[0]]} miles ${keys[0].toUpperCase()} and then ${d[keys[1]]} miles ${keys[1].toUpperCase()}. How far is it from the start?`;
      pool.push({
        id: `nav-${i}`,
        type: 'navigation',
        question: q,
        data: { e: d.e || d.w || 0, n: d.n || d.s || 0 }, // Simplified for illustration
        answer: d.ans,
        explanation: `${d[keys[0]]}² + ${d[keys[1]]}² = ${d.ans}²`,
        illustrationType: 'scenario',
        unit: 'miles'
      });
    });

    // 5. Real World (4)
    const scenarios = [
      { id: 'tv', title: 'TV Screen', w: 40, h: 30, ans: 50, unit: 'in' },
      { id: 'ladder', title: 'Ladder', l: 13, d: 5, ans: 12, unit: 'ft' },
      { id: 'park', title: 'Park Path', e: 15, n: 20, ans: 25, unit: 'm' },
      { id: 'tree', title: 'Broken Tree', h1: 8, d: 15, ans: 17, unit: 'ft' }
    ];
    scenarios.forEach((s, i) => {
      let q = "";
      if (s.id === 'tv') q = `A TV is ${s.w}in wide and ${s.h}in tall. Find the diagonal.`;
      if (s.id === 'ladder') q = `A ${s.l}ft ladder is ${s.d}ft from a wall. How high does it reach?`;
      if (s.id === 'park') q = `Walk ${s.e}m East and ${s.n}m North. Direct distance?`;
      if (s.id === 'tree') q = `A tree snaps ${s.h1}ft up. The top hits ${s.d}ft away. How long is the snapped part?`;
      
      pool.push({
        id: `rw-${i}`,
        type: 'word-problem',
        question: q,
        data: s,
        answer: s.ans,
        explanation: `Using Pythagoras: ${s.ans}`,
        illustrationType: 'scenario',
        unit: s.unit
      });
    });

    // Shuffle and pick 20 (or all if pool is small, but here pool is exactly 20)
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 20));
    
    setStep('playing');
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setUserAnswer('');
    setFeedback(null);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setUserAnswer('');
      setFeedback(null);
    } else {
      setStep('end');
      onComplete(quizScore);
    }
  };

  const checkAnswer = () => {
    const current = questions[currentQuestionIndex];
    let isCorrect = false;
    if (current.type === 'converse') {
      const val = userAnswer.toLowerCase();
      isCorrect = (val === 'yes' || val === 'true') === current.answer;
    } else {
      isCorrect = Math.abs(parseFloat(userAnswer) - (current.answer as number)) < 0.1;
    }

    if (isCorrect) {
      setQuizScore(s => s + 5);
      setFeedback({ correct: true, message: "Correct!" });
    } else {
      setFeedback({ correct: false, message: `Incorrect. Answer: ${current.answer}` });
    }
  };

  if (step === 'start') {
    return (
      <div className="space-y-6">
        <div className="flex justify-center p-1 bg-slate-200 rounded-2xl w-fit mx-auto mb-8">
          <button
            onClick={() => setQuizMode('online')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all",
              quizMode === 'online' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Zap size={18} /> Online Quiz
          </button>
          <button
            onClick={() => setQuizMode('printable')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all",
              quizMode === 'printable' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Printer size={18} /> Printable Quiz
          </button>
        </div>

        {quizMode === 'online' ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
              <Zap size={48} />
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tight">Pythagoras Challenge</h2>
            <p className="text-slate-600 max-w-md mb-10 text-lg">
              Test your skills with 20 randomized questions covering missing sides, converse, distance, and real-world scenarios.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-10 w-full max-w-sm">
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-2xl font-bold text-indigo-600">20</p>
                <p className="text-xs text-slate-400 font-bold uppercase">Questions</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-2xl font-bold text-indigo-600">100</p>
                <p className="text-xs text-slate-400 font-bold uppercase">Points</p>
              </div>
            </div>
            <button 
              onClick={startQuiz}
              className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0"
            >
              Start Online Quiz
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-dashed border-2 border-slate-300 bg-white p-10 shadow-none">
              <div className="flex justify-between items-start mb-10 border-b-2 border-slate-900 pb-6">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Pythagorean Theorem Mastery Quiz</h2>
                  <div className="flex gap-8 mt-4">
                    <p className="text-sm font-bold">NAME: _________________________________</p>
                    <p className="text-sm font-bold">DATE: _________________</p>
                    <p className="text-sm font-bold">SCORE: ________ / 20</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all print:hidden"
                >
                  <Printer size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-12">
                {[
                  "1. Find the hypotenuse of a right triangle with legs of 6cm and 8cm.",
                  "2. A 10ft ladder leans against a wall. The base is 6ft from the wall. How high does it reach?",
                  "3. Does a triangle with sides 5, 12, and 13 form a right triangle? Justify your answer.",
                  "4. Find the distance between points (1, 2) and (4, 6) on a Cartesian plane.",
                  "5. A TV screen is 16 inches wide and 12 inches tall. What is the diagonal length?",
                  "6. You walk 9 miles North and 12 miles East. How far are you from your starting point?",
                  "7. Find the length of a leg if the hypotenuse is 17 and the other leg is 8.",
                  "8. A rectangular park is 40m by 30m. How long is the diagonal path across it?",
                  "9. Is a triangle with sides 8, 15, and 17 a right triangle?",
                  "10. Find the distance between (-2, -3) and (1, 1).",
                  "11. A 25ft wire is attached to the top of a 20ft pole. How far from the base is it anchored?",
                  "12. A ship sails 24km West and 7km South. Find the direct distance back.",
                  "13. Find the hypotenuse of a triangle with legs 9 and 40.",
                  "14. Does a triangle with sides 10, 10, and 14 form a right triangle?",
                  "15. A ramp is 15ft long and 3ft high. How long is the horizontal base?",
                  "16. Find the distance between (0, 0) and (5, 12).",
                  "17. A square has a side length of 10. Find the length of its diagonal.",
                  "18. A tree snaps 5ft above ground. The top hits 12ft away. Original height?",
                  "19. Find the missing leg if c = 25 and a = 7.",
                  "20. Is a triangle with sides 11, 60, and 61 a right triangle?"
                ].map((q, i) => (
                  <div key={i} className="space-y-4 break-inside-avoid">
                    <p className="font-bold text-lg">{q}</p>
                    <div className="h-32 border border-slate-200 rounded-xl bg-slate-50/50"></div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs italic">
                End of Quiz - Show all work for full credit.
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  if (step === 'end') {
    return (
      <Card className="max-w-md mx-auto text-center py-12 shadow-2xl border-indigo-100">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <Trophy size={64} className="mx-auto text-yellow-500 mb-6" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-slate-500 mb-8">Great effort on the Pythagoras Challenge.</p>
        <div className="bg-indigo-50 rounded-2xl p-6 mb-8">
          <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-1">Your Final Score</p>
          <p className="text-6xl font-black text-indigo-600">{quizScore}/100</p>
        </div>
        <button 
          onClick={() => setStep('start')}
          className="w-full px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={20} /> Take Quiz Again
        </button>
      </Card>
    );
  }

  const current = questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {questions.length}</span>
        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <h3 className="text-xl font-bold mb-6">{current.question}</h3>
        
        <div className="mb-6">
          {current.illustrationType === 'triangle' && (
            <RightTriangle 
              a={current.data.a} 
              b={current.data.b} 
              labelA={current.data.a.toString()}
              labelB={current.data.b.toString()}
              labelC="?"
              highlightSide="c"
            />
          )}
          {current.illustrationType === 'plane' && (
            <CartesianPlane 
              x1={current.data.x1} 
              y1={current.data.y1} 
              x2={current.data.x2} 
              y2={current.data.y2} 
              showTriangle={!!feedback}
            />
          )}
          {current.illustrationType === 'scenario' && (
            <div className="h-40 rounded-xl overflow-hidden border border-slate-100">
              <ScenarioIllustration 
                type={current.data.id || (current.type === 'navigation' ? 'park' : 'tv')} 
                values={current.data} 
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={!!feedback}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold"
            placeholder="Your answer..."
          />
          {!feedback ? (
            <button
              onClick={checkAnswer}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2"
            >
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>
        {feedback && (
          <div className={cn(
            "mt-4 p-4 rounded-xl border font-bold",
            feedback.correct ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
          )}>
            {feedback.message}
          </div>
        )}
      </Card>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('intro');
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [practiceMode, setPracticeMode] = useState<'missing-side' | 'converse' | 'distance'>('missing-side');
  
  // Converse Verification State
  const [verifySides, setVerifySides] = useState({ a: '', b: '', c: '' });
  const [verifyResult, setVerifyResult] = useState<{ isRight: boolean; message: string } | null>(null);

  // Real World Scenarios State
  const [scenarios, setScenarios] = useState<any[]>([]);

  const generateScenarios = () => {
    const newScenarios = [
      {
        id: 'tv',
        title: 'TV Screen Diagonal',
        description: (w: number, h: number) => `A TV screen is ${w} inches wide and ${h} inches tall. What is the length of the diagonal?`,
        values: { w: 32 + Math.floor(Math.random() * 10), h: 18 + Math.floor(Math.random() * 6) },
        calculate: (v: any) => Math.sqrt(v.w**2 + v.h**2),
        unit: 'inches',
        icon: <Eye size={18} className="text-indigo-500" />,
        color: 'indigo'
      },
      {
        id: 'ladder',
        title: "The Painter's Problem",
        description: (l: number, d: number) => `A ${l}ft ladder is leaning against a wall. The base is ${d}ft from the wall. How high up the wall does it reach?`,
        values: { l: 10 + Math.floor(Math.random() * 5), d: 6 },
        calculate: (v: any) => Math.sqrt(v.l**2 - v.d**2),
        unit: 'feet',
        icon: <Calculator size={18} className="text-orange-500" />,
        color: 'orange'
      },
      {
        id: 'park',
        title: 'Shortcut in the Park',
        description: (e: number, n: number) => `You walk ${e}m East and then ${n}m North. What is the direct distance back to your starting point?`,
        values: { e: 40 + Math.floor(Math.random() * 20), n: 30 + Math.floor(Math.random() * 10) },
        calculate: (v: any) => Math.sqrt(v.e**2 + v.n**2),
        unit: 'meters',
        icon: <Map size={18} className="text-emerald-500" />,
        color: 'emerald'
      },
      {
        id: 'tree',
        title: 'The Broken Tree',
        description: (h1: number, d: number) => `A tree was struck by lightning and snapped. The top part is still attached and touches the ground ${d}ft from the base. If the remaining trunk is ${h1}ft tall, how long is the snapped part?`,
        values: { h1: 5 + Math.floor(Math.random() * 3), d: 12 },
        calculate: (v: any) => Math.sqrt(v.h1**2 + v.d**2),
        unit: 'feet',
        icon: <Zap size={18} className="text-violet-500" />,
        color: 'violet'
      }
    ];
    setScenarios(newScenarios);
  };

  // Generate a problem
  const generateProblem = (type: Problem['type']) => {
    setUserAnswer('');
    setFeedback(null);

    if (type === 'missing-side') {
      const isHypotenuseMissing = Math.random() > 0.5;
      const a = Math.floor(Math.random() * 12) + 3;
      const b = Math.floor(Math.random() * 12) + 3;
      const c = Math.sqrt(a * a + b * b);

      if (isHypotenuseMissing) {
        setCurrentProblem({
          id: Math.random().toString(36),
          type: 'missing-side',
          question: `Find the length of the missing side (hypotenuse). Round to the nearest tenth if necessary.`,
          data: { a, b, missing: 'c' },
          answer: Number(c.toFixed(1)),
          explanation: `Using a² + b² = c²: ${a}² + ${b}² = c². So ${a*a} + ${b*b} = ${a*a + b*b}. c = √${a*a + b*b} ≈ ${c.toFixed(1)}.`,
          unit: 'units'
        });
      } else {
        // Ensure b is smaller than c for a valid triangle
        const sideC = Math.floor(Math.random() * 15) + 10;
        const sideA = Math.floor(Math.random() * (sideC - 5)) + 3;
        const sideB = Math.sqrt(sideC * sideC - sideA * sideA);
        setCurrentProblem({
          id: Math.random().toString(36),
          type: 'missing-side',
          question: `Find the length of the missing leg. Round to the nearest tenth if necessary.`,
          data: { a: sideA, c: sideC, missing: 'b' },
          answer: Number(sideB.toFixed(1)),
          explanation: `Using a² + b² = c²: ${sideA}² + b² = ${sideC}². So ${sideA*sideA} + b² = ${sideC*sideC}. b² = ${sideC*sideC - sideA*sideA}. b = √${sideC*sideC - sideA*sideA} ≈ ${sideB.toFixed(1)}.`,
          unit: 'units'
        });
      }
    } else if (type === 'converse') {
      const isRight = Math.random() > 0.5;
      let a, b, c;
      if (isRight) {
        const triples = [[3,4,5], [5,12,13], [8,15,17], [7,24,25], [9,40,41]];
        const triple = triples[Math.floor(Math.random() * triples.length)];
        [a, b, c] = triple;
      } else {
        a = Math.floor(Math.random() * 10) + 5;
        b = Math.floor(Math.random() * 10) + 5;
        c = Math.floor(Math.random() * 10) + Math.max(a, b);
        // Ensure it's not actually a right triangle by chance
        if (a*a + b*b === c*c) c += 1;
      }
      setCurrentProblem({
        id: Math.random().toString(36),
        type: 'converse',
        question: `Does a triangle with side lengths ${a}, ${b}, and ${c} form a right triangle?`,
        data: { a, b, c },
        answer: isRight,
        explanation: `${a}² + ${b}² = ${a*a} + ${b*b} = ${a*a + b*b}. ${c}² = ${c*c}. Since ${a*a + b*b} ${isRight ? '==' : '!='} ${c*c}, it ${isRight ? 'is' : 'is not'} a right triangle.`,
      });
    } else if (type === 'distance') {
      const x1 = Math.floor(Math.random() * 7) + 1;
      const y1 = Math.floor(Math.random() * 7) + 1;
      let x2 = Math.floor(Math.random() * 7) + 1;
      let y2 = Math.floor(Math.random() * 7) + 1;
      // Ensure they are not too close or same
      if (Math.abs(x1 - x2) < 2) x2 = (x1 + 4) % 9 + 1;
      if (Math.abs(y1 - y2) < 2) y2 = (y1 + 3) % 9 + 1;

      const legA = Math.abs(x2 - x1);
      const legB = Math.abs(y2 - y1);
      const d = Math.sqrt(legA * legA + legB * legB);
      
      setCurrentProblem({
        id: Math.random().toString(36),
        type: 'distance',
        question: `Find the distance between points (${x1}, ${y1}) and (${x2}, ${y2}) by constructing a right triangle.`,
        data: { x1, y1, x2, y2, legA, legB },
        answer: Number(d.toFixed(1)),
        explanation: `1. Horizontal leg: |${x2} - ${x1}| = ${legA}. 2. Vertical leg: |${y2} - ${y1}| = ${legB}. 3. Use a² + b² = c²: ${legA}² + ${legB}² = ${legA*legA} + ${legB*legB} = ${legA*legA + legB*legB}. 4. Distance = √${legA*legA + legB*legB} ≈ ${d.toFixed(1)}.`,
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'practice') {
      generateProblem(practiceMode);
    }
    if (activeTab === 'real-world' && scenarios.length === 0) {
      generateScenarios();
    }
  }, [activeTab, practiceMode]);

  const checkAnswer = () => {
    if (!currentProblem) return;

    let isCorrect = false;
    if (currentProblem.type === 'converse') {
      const val = userAnswer.toLowerCase();
      isCorrect = (val === 'yes' || val === 'true') === currentProblem.answer;
    } else {
      isCorrect = Math.abs(parseFloat(userAnswer) - (currentProblem.answer as number)) < 0.15;
    }

    if (isCorrect) {
      setScore(s => s + 10);
      setFeedback({ correct: true, message: "Great job! That's correct." });
    } else {
      setFeedback({ correct: false, message: `Not quite. The answer was ${currentProblem.answer}.` });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Layers size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Pythagoras Master</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Student Practice Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
              <Trophy size={16} className="text-indigo-600" />
              <span className="text-sm font-bold text-indigo-700">{score} pts</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 py-3 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4 flex gap-2">
          <TabButton 
            active={activeTab === 'intro'} 
            onClick={() => setActiveTab('intro')} 
            icon={Home} 
            label="Overview" 
          />
          <TabButton 
            active={activeTab === 'learn'} 
            onClick={() => setActiveTab('learn')} 
            icon={BookOpen} 
            label="Learn" 
          />
          <TabButton 
            active={activeTab === 'converse'} 
            onClick={() => setActiveTab('converse')} 
            icon={CheckSquare} 
            label="Converse" 
          />
          <TabButton 
            active={activeTab === 'real-world'} 
            onClick={() => setActiveTab('real-world')} 
            icon={Globe} 
            label="Real World" 
          />
          <TabButton 
            active={activeTab === 'practice'} 
            onClick={() => setActiveTab('practice')} 
            icon={Calculator} 
            label="Practice" 
          />
          <TabButton 
            active={activeTab === 'quiz'} 
            onClick={() => setActiveTab('quiz')} 
            icon={Zap} 
            label="Quiz" 
          />
        </div>
      </nav>

      {/* Content Area */}
      <main className="max-w-5xl mx-auto px-4 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="flex flex-col justify-center">
                  <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest mb-2">Module 8</span>
                  <h2 className="text-3xl font-bold mb-4">The Pythagorean Theorem</h2>
                  <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-indigo-500 mb-6">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-2">
                      <HelpCircle size={14} /> Essential Question
                    </p>
                    <p className="text-lg font-semibold text-slate-800 italic">
                      "How can you use the Pythagorean Theorem to solve real-world problems?"
                    </p>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    The Pythagorean Theorem is one of the most famous and useful formulas in mathematics. 
                    It describes the relationship between the sides of a right-angled triangle.
                  </p>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                  <Card className="flex items-start gap-4 hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => setActiveTab('learn')}>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold">Lesson 8.1</h3>
                      <p className="text-sm text-slate-500">The Pythagorean Theorem basics and proofs.</p>
                    </div>
                  </Card>
                  <Card className="flex items-start gap-4 hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => { setActiveTab('practice'); setPracticeMode('converse'); }}>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <RefreshCw size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold">Lesson 8.2</h3>
                      <p className="text-sm text-slate-500">Converse of the Pythagorean Theorem.</p>
                    </div>
                  </Card>
                  <Card className="flex items-start gap-4 hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => { setActiveTab('practice'); setPracticeMode('distance'); }}>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                      <Map size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold">Lesson 8.3</h3>
                      <p className="text-sm text-slate-500">Distance Between Two Points on a plane.</p>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-xl">
                  <h3 className="text-2xl font-bold mb-4">Real-World Application</h3>
                  <p className="text-indigo-100 mb-6">
                    Did you know the size of a television is usually described by the length of the diagonal of the screen? 
                    To find the length of the diagonal of a rectangle, you can use the Pythagorean Theorem.
                  </p>
                  <button 
                    onClick={() => setActiveTab('practice')}
                    className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors"
                  >
                    Start Practicing <ChevronRight size={18} />
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M 10,90 L 90,90 L 10,10 Z" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'converse' && (
            <motion.div
              key="converse"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                    <CheckSquare size={32} /> The Converse Rule
                  </h2>
                  <p className="text-emerald-50 text-lg leading-relaxed mb-6">
                    The Converse of the Pythagorean Theorem is used to determine if a triangle is a right triangle. 
                    If the square of the longest side equals the sum of the squares of the other two sides, 
                    then the triangle <strong>must</strong> have a 90° angle.
                  </p>
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                    <p className="text-2xl font-black text-center">If a² + b² = c², then it's a RIGHT triangle!</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="space-y-6 border-emerald-100">
                  <h3 className="text-xl font-bold text-emerald-800">Verification Tool</h3>
                  <p className="text-slate-600 text-sm">Enter three side lengths to check if they form a right triangle.</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Side A</label>
                      <input 
                        type="number" 
                        value={verifySides.a}
                        onChange={(e) => setVerifySides({ ...verifySides, a: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500" 
                        placeholder="3" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Side B</label>
                      <input 
                        type="number" 
                        value={verifySides.b}
                        onChange={(e) => setVerifySides({ ...verifySides, b: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500" 
                        placeholder="4" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Side C</label>
                      <input 
                        type="number" 
                        value={verifySides.c}
                        onChange={(e) => setVerifySides({ ...verifySides, c: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500" 
                        placeholder="5" 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const a = Number(verifySides.a);
                      const b = Number(verifySides.b);
                      const c = Number(verifySides.c);
                      if (!a || !b || !c) {
                        setVerifyResult({ isRight: false, message: "Please enter all three sides." });
                        return;
                      }
                      const sides = [a, b, c].sort((x, y) => x - y);
                      const isRight = Math.abs(sides[0]**2 + sides[1]**2 - sides[2]**2) < 0.1;
                      setVerifyResult({ 
                        isRight, 
                        message: isRight 
                          ? `✅ Yes! ${sides[0]}² + ${sides[1]}² = ${sides[2]}²` 
                          : `❌ No. ${sides[0]}² + ${sides[1]}² ≠ ${sides[2]}²` 
                      });
                    }}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Verify Dimensions
                  </button>

                  {verifyResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-4 rounded-xl border font-bold text-center",
                        verifyResult.isRight ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
                      )}
                    >
                      {verifyResult.message}
                    </motion.div>
                  )}
                </Card>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Practice Problems</h3>
                  {[
                    { sides: [9, 12, 15], result: true },
                    { sides: [6, 8, 11], result: false },
                    { sides: [8, 15, 17], result: true },
                    { sides: [10, 24, 26], result: true },
                  ].map((prob, i) => (
                    <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 flex justify-between items-center group hover:border-emerald-300 transition-all">
                      <div>
                        <p className="font-bold">Problem #{i+1}</p>
                        <p className="text-slate-500 text-sm">Sides: {prob.sides.join(', ')}</p>
                      </div>
                      <button 
                        onClick={() => alert(prob.result ? "Correct! It's a right triangle." : "Correct! It's not a right triangle.")}
                        className="px-4 py-2 rounded-lg bg-slate-50 text-slate-600 font-bold text-sm group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"
                      >
                        Check Answer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'real-world' && (
            <motion.div
              key="real-world"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="col-span-2 bg-indigo-900 text-white border-none p-8">
                  <h2 className="text-3xl font-bold mb-4">Math in the Real World</h2>
                  <p className="text-indigo-100 text-lg mb-6">
                    The Pythagorean Theorem isn't just for textbooks. It's used every day by architects, engineers, and even painters!
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-white/10 rounded-2xl">
                      <h4 className="font-bold mb-2 flex items-center gap-2"><Map size={18} /> Navigation</h4>
                      <p className="text-sm text-indigo-200">Pilots and sailors use it to calculate the shortest distance between two points.</p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-2xl">
                      <h4 className="font-bold mb-2 flex items-center gap-2"><Calculator size={18} /> Construction</h4>
                      <p className="text-sm text-indigo-200">Builders use it to ensure corners are perfectly square (the 3-4-5 rule).</p>
                    </div>
                  </div>
                </Card>
                <div className="bg-orange-500 rounded-3xl p-8 text-white flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-2 italic">Did you know?</h3>
                  <p className="text-orange-50 leading-relaxed">
                    Ancient Egyptians used a knotted rope with lengths of 3, 4, and 5 to create perfect right angles for their pyramids!
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-12 mb-6">
                <h3 className="text-2xl font-bold">Interactive Scenarios</h3>
                <button 
                  onClick={generateScenarios}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                >
                  <RefreshCw size={16} /> Randomize Values
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {scenarios.map((s) => (
                  <ScenarioCard key={s.id} scenario={s} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="max-w-3xl mx-auto space-y-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">The Basics</h2>
                  <Card className="bg-indigo-50 border-indigo-100">
                    <h3 className="text-lg font-bold text-indigo-900 mb-4">The Pythagorean Theorem</h3>
                    <p className="text-indigo-800 mb-4">
                      In a right triangle, the sum of the squares of the lengths of the legs is equal to the square of the length of the hypotenuse.
                    </p>
                    <div className="flex flex-col items-center gap-6">
                      <div className="text-3xl font-black text-indigo-600 bg-white px-8 py-4 rounded-2xl shadow-sm border border-indigo-200">
                        a² + b² = c²
                      </div>
                      <RightTriangle a={10} b={14} labelA="leg (a)" labelB="leg (b)" labelC="hypotenuse (c)" />
                    </div>
                  </Card>
                </section>

                <section className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Key Vocabulary</h3>
                    <ul className="space-y-3">
                      <li className="flex gap-3">
                        <div className="mt-1 text-indigo-600"><CheckCircle2 size={18} /></div>
                        <div>
                          <strong className="block">Legs</strong>
                          <span className="text-sm text-slate-600">The two sides that form the right angle.</span>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="mt-1 text-indigo-600"><CheckCircle2 size={18} /></div>
                        <div>
                          <strong className="block">Hypotenuse</strong>
                          <span className="text-sm text-slate-600">The side opposite the right angle (the longest side).</span>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="mt-1 text-indigo-600"><CheckCircle2 size={18} /></div>
                        <div>
                          <strong className="block">Theorem</strong>
                          <span className="text-sm text-slate-600">An idea that has been demonstrated as true.</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">The Converse</h3>
                    <p className="text-slate-600 text-sm">
                      The converse states that if a² + b² = c² is true for a triangle, then it <strong>must</strong> be a right triangle.
                    </p>
                    <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Example</p>
                      <p className="text-sm font-medium">Sides: 3, 4, 5</p>
                      <p className="text-sm">3² + 4² = 9 + 16 = 25</p>
                      <p className="text-sm">5² = 25</p>
                      <p className="text-sm text-emerald-600 font-bold mt-1">It's a Right Triangle!</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-bold">Distance on a Coordinate Plane</h3>
                  <Card className="bg-orange-50 border-orange-100">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <p className="text-orange-900 font-medium">To find the distance between two points:</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-orange-800">
                          <li>Plot the points on the grid.</li>
                          <li>Draw horizontal and vertical lines to form a <strong>right triangle</strong>.</li>
                          <li>Find the length of the legs by counting grid units.</li>
                          <li>Use the <strong>Pythagorean Theorem</strong> to find the hypotenuse (the distance).</li>
                        </ol>
                      </div>
                      <CartesianPlane x1={2} y1={2} x2={6} y2={5} showTriangle={true} />
                    </div>
                  </Card>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {(['missing-side', 'converse', 'distance'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setPracticeMode(mode)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                      practiceMode === mode 
                        ? "bg-indigo-600 text-white shadow-lg" 
                        : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                    )}
                  >
                    {mode === 'missing-side' && "Missing Side"}
                    {mode === 'converse' && "Converse"}
                    {mode === 'distance' && "Distance"}
                  </button>
                ))}
              </div>

              {currentProblem && (
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-6">
                    <Card>
                      <h3 className="text-lg font-bold mb-4">{currentProblem.question}</h3>
                      
                      {currentProblem.type === 'missing-side' && (
                        <div className="flex justify-center mb-6">
                          <RightTriangle 
                            a={currentProblem.data.a || 10} 
                            b={currentProblem.data.b || 10} 
                            labelA={currentProblem.data.missing === 'a' ? '?' : currentProblem.data.a?.toString()}
                            labelB={currentProblem.data.missing === 'b' ? '?' : currentProblem.data.b?.toString()}
                            labelC={currentProblem.data.missing === 'c' ? '?' : currentProblem.data.c?.toString()}
                            highlightSide={currentProblem.data.missing}
                          />
                        </div>
                      )}

                      {currentProblem.type === 'converse' && (
                        <div className="flex flex-col items-center gap-4 py-8 bg-slate-50 rounded-xl">
                          <div className="flex gap-6 text-2xl font-black text-slate-700">
                            <span className="px-4 py-2 bg-white rounded-lg border border-slate-200">{currentProblem.data.a}</span>
                            <span className="px-4 py-2 bg-white rounded-lg border border-slate-200">{currentProblem.data.b}</span>
                            <span className="px-4 py-2 bg-white rounded-lg border border-slate-200">{currentProblem.data.c}</span>
                          </div>
                          <p className="text-sm text-slate-500 font-medium">Side Lengths</p>
                        </div>
                      )}

                      {currentProblem.type === 'distance' && (
                        <div className="space-y-4">
                          <CartesianPlane 
                            x1={currentProblem.data.x1} 
                            y1={currentProblem.data.y1} 
                            x2={currentProblem.data.x2} 
                            y2={currentProblem.data.y2} 
                            showTriangle={!!feedback}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Point A</p>
                              <p className="font-bold">({currentProblem.data.x1}, {currentProblem.data.y1})</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Point B</p>
                              <p className="font-bold">({currentProblem.data.x2}, {currentProblem.data.y2})</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder={currentProblem.type === 'converse' ? "Yes or No" : "Enter value..."}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                        onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                      />
                      <button
                        onClick={checkAnswer}
                        disabled={!userAnswer || !!feedback}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        Check
                      </button>
                    </div>

                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-4 rounded-xl border",
                          feedback.correct 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                            : "bg-rose-50 border-rose-200 text-rose-800"
                        )}
                      >
                        <p className="font-bold mb-1">{feedback.message}</p>
                        <p className="text-sm opacity-90">{currentProblem.explanation}</p>
                        <button
                          onClick={() => generateProblem(practiceMode)}
                          className="mt-4 text-sm font-bold underline flex items-center gap-1"
                        >
                          Next Problem <ChevronRight size={14} />
                        </button>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-none">
                      <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Calculator size={18} className="text-indigo-400" />
                        Quick Reference
                      </h4>
                      <div className="space-y-4 text-sm">
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="font-mono text-indigo-300 mb-1">a² + b² = c²</p>
                          <p className="text-slate-400">Use this for missing sides.</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="font-mono text-indigo-300 mb-1">Distance Method</p>
                          <p className="text-slate-400">1. Find legs (Δx, Δy)<br/>2. Use a² + b² = c²</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="font-mono text-indigo-300 mb-1">Common Triples</p>
                          <p className="text-slate-400">3-4-5, 5-12-13, 8-15-17</p>
                        </div>
                      </div>
                    </Card>
                    
                    <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <h4 className="font-bold text-indigo-900 mb-2">Pro Tip</h4>
                      <p className="text-sm text-indigo-800 leading-relaxed">
                        Always identify the <strong>hypotenuse</strong> first! It's the side opposite the 90° angle and is always the longest side (c).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <QuizComponent onComplete={(finalScore) => setScore(s => s + finalScore)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 mt-12 pt-8 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-medium uppercase tracking-widest">
          <p>© 2026 Pythagoras Master Educational Tool</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
