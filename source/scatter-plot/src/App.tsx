/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Line, 
  ComposedChart,
  Cell
} from 'recharts';
import { 
  BookOpen, 
  TrendingUp, 
  Globe, 
  ClipboardCheck, 
  Printer, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Info,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QUIZ_QUESTIONS, QuizQuestion, ScatterPoint } from './constants';
import { cn } from './lib/utils';

// --- Components ---

const DataTable = ({ data }: { data: { x: string | number; y: string | number; xLabel?: string; yLabel?: string }[] }) => {
  const xLabel = data[0]?.xLabel || 'x';
  const yLabel = data[0]?.yLabel || 'y';
  
  return (
    <div className="inline-block border-2 border-slate-800 rounded-lg overflow-hidden my-4">
      <table className="border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-800">
            <th className="px-6 py-2 text-sm font-bold border-r-4 border-slate-800">{xLabel}</th>
            <th className="px-6 py-2 text-sm font-bold">{yLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className={cn(idx !== data.length - 1 && "border-b border-slate-200")}>
              <td className="px-6 py-2 text-center font-mono border-r-4 border-slate-800">{row.x}</td>
              <td className="px-6 py-2 text-center font-mono">{row.y}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

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
      "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2",
      active 
        ? "border-lime-600 text-lime-700 bg-lime-50/50" 
        : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
    )}
  >
    <Icon size={18} />
    {label}
  </button>
);

const Card = ({ children, className, title }: { children: React.ReactNode; className?: string; title?: string; key?: React.Key }) => (
  <div className={cn("bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden", className)}>
    {title && (
      <div className="px-6 py-4 border-bottom border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

// --- Sections ---

const LearnSection = () => {
  const [associationType, setAssociationType] = useState<'positive' | 'negative' | 'none' | 'nonlinear'>('positive');

  const data = useMemo(() => {
    const points: ScatterPoint[] = [];
    for (let i = 0; i < 20; i++) {
      let x = i + Math.random() * 2;
      let y = 0;
      if (associationType === 'positive') y = x * 2 + Math.random() * 10;
      else if (associationType === 'negative') y = 50 - x * 2 + Math.random() * 10;
      else if (associationType === 'none') y = Math.random() * 50;
      else if (associationType === 'nonlinear') y = Math.pow(x - 10, 2) / 2 + Math.random() * 5;
      points.push({ x, y, id: `p-${i}` });
    }
    return points;
  }, [associationType]);

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Understanding Scatter Plots</h2>
        <p className="text-lg text-slate-600">
          A scatter plot is a graph that shows the relationship between two sets of data. 
          By looking at the pattern of points, we can determine the type of association.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Interactive Association Explorer">
            <div className="mb-6 flex flex-wrap gap-2">
              {(['positive', 'negative', 'none', 'nonlinear'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setAssociationType(type)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all capitalize",
                    associationType === type 
                      ? "bg-lime-600 text-white shadow-md" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {type} Association
                </button>
              ))}
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" dataKey="x" name="X Variable" stroke="#64748b" fontSize={12} />
                  <YAxis type="number" dataKey="y" name="Y Variable" stroke="#64748b" fontSize={12} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Data Points" data={data} fill="#65a30d" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Key Concepts" className="h-full">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="text-emerald-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Positive Association</h4>
                  <p className="text-sm text-slate-600">As x increases, y also tends to increase. The points trend upward.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="text-rose-600 rotate-180" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Negative Association</h4>
                  <p className="text-sm text-slate-600">As x increases, y tends to decrease. The points trend downward.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Layers className="text-slate-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Clusters & Outliers</h4>
                  <p className="text-sm text-slate-600">Clusters are groups of points close together. Outliers are points far from the main group.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const TrendLineSection = () => {
  const [exampleIdx, setExampleIdx] = useState(0);
  const [step, setStep] = useState(1); // 1: Table, 2: Plot, 3: Trend Line

  const examples = [
    {
      title: "Study Hours vs. Test Scores",
      data: [
        { x: 1, y: 65 }, { x: 2, y: 70 }, { x: 3, y: 75 }, { x: 4, y: 80 },
        { x: 5, y: 85 }, { x: 6, y: 90 }, { x: 7, y: 95 }, { x: 8, y: 100 }
      ],
      slope: 5,
      intercept: 60,
      xLabel: "Study Hours",
      yLabel: "Test Score",
      domain: [0, 10],
      range: [50, 110]
    },
    {
      title: "Temperature vs. Ice Cream Sales",
      data: [
        { x: 60, y: 100 }, { x: 70, y: 250 }, { x: 80, y: 400 }, { x: 90, y: 550 },
        { x: 100, y: 700 }
      ],
      slope: 15,
      intercept: -800,
      xLabel: "Temp (°F)",
      yLabel: "Sales ($)",
      domain: [50, 110],
      range: [0, 800]
    },
    {
      title: "Experience vs. Salary",
      data: [
        { x: 0, y: 40000 }, { x: 5, y: 55000 }, { x: 10, y: 70000 }, { x: 15, y: 85000 },
        { x: 20, y: 100000 }
      ],
      slope: 3000,
      intercept: 40000,
      xLabel: "Years Exp",
      yLabel: "Salary ($)",
      domain: [0, 25],
      range: [30000, 110000]
    },
    {
      title: "Altitude vs. Air Pressure",
      data: [
        { x: 0, y: 1013 }, { x: 1000, y: 898 }, { x: 2000, y: 795 }, { x: 3000, y: 701 },
        { x: 4000, y: 616 }
      ],
      slope: -0.1,
      intercept: 1013,
      xLabel: "Altitude (m)",
      yLabel: "Pressure (hPa)",
      domain: [0, 5000],
      range: [500, 1100]
    }
  ];

  const current = examples[exampleIdx];

  const lineData = useMemo(() => {
    const start = current.domain[0];
    const end = current.domain[1];
    const points = [];
    for (let i = start; i <= end; i += (end - start) / 10) {
      points.push({
        x: i,
        lineY: current.slope * i + current.intercept
      });
    }
    return points;
  }, [current]);

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const nextExample = () => {
    setExampleIdx((exampleIdx + 1) % examples.length);
    setStep(1);
  };

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Building a Trend Line</h2>
        <p className="text-lg text-slate-600">
          Follow the steps to see how we go from raw data to a mathematical model that can predict the future.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card title="Step 1: The Data Table" className={cn(step >= 1 ? "opacity-100" : "opacity-50")}>
            <p className="text-sm text-slate-600 mb-4">First, we collect our observations in a table.</p>
            <DataTable data={current.data.map(d => ({ x: d.x, y: d.y, xLabel: current.xLabel, yLabel: current.yLabel }))} />
          </Card>

          {step < 3 ? (
            <button
              onClick={nextStep}
              className="w-full py-4 bg-lime-600 text-white rounded-xl font-bold hover:bg-lime-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime-200"
            >
              Next Step: {step === 1 ? "Plot the Data" : "Build Trend Line"}
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={nextExample}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Click for More Examples
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title={current.title}>
            <div className="h-[450px] w-full bg-white rounded-xl">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    domain={current.domain} 
                    stroke="#64748b" 
                    fontSize={12} 
                    label={{ value: current.xLabel, position: 'bottom', offset: 10 }}
                  />
                  <YAxis 
                    type="number" 
                    domain={current.range} 
                    stroke="#64748b" 
                    fontSize={12}
                    label={{ value: current.yLabel, angle: -90, position: 'insideLeft', offset: 0 }}
                  />
                  <Tooltip />
                  
                  {step >= 2 && (
                    <Scatter 
                      name="Actual Data" 
                      data={current.data} 
                      fill="#65a30d" 
                      dataKey="y"
                      animationDuration={1000}
                    />
                  )}

                  {step >= 3 && (
                    <Line 
                      data={lineData}
                      type="linear" 
                      dataKey="lineY" 
                      stroke="#eab308" 
                      strokeWidth={5} 
                      dot={false} 
                      animationDuration={1000}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className={cn(
                "px-4 py-2 rounded-full text-sm font-bold transition-all",
                step >= 1 ? "bg-slate-100 text-slate-700" : "bg-slate-50 text-slate-300"
              )}>
                1. Table Ready
              </div>
              <div className={cn(
                "px-4 py-2 rounded-full text-sm font-bold transition-all",
                step >= 2 ? "bg-lime-100 text-lime-700" : "bg-slate-50 text-slate-300"
              )}>
                2. Data Plotted
              </div>
              <div className={cn(
                "px-4 py-2 rounded-full text-sm font-bold transition-all",
                step >= 3 ? "bg-yellow-100 text-yellow-700" : "bg-slate-50 text-slate-300"
              )}>
                3. Trend Line Built
              </div>
            </div>

            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-yellow-50 rounded-2xl border-2 border-yellow-100"
              >
                <span className="text-sm font-semibold uppercase tracking-wider opacity-60 block mb-1">Mathematical Model</span>
                <div className="font-mono text-3xl font-bold text-yellow-700">
                  y = {current.slope}x {current.intercept >= 0 ? '+' : '-'} {Math.abs(current.intercept)}
                </div>
                <p className="text-sm text-yellow-800 mt-2">
                  This equation allows us to calculate any <span className="font-bold">y</span> value for a given <span className="font-bold">x</span>.
                </p>
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const RealWorldSection = () => {
  const scenarios = [
    {
      title: "Training for a 10K (Positive)",
      description: "Joyce tracks her distance and time. As distance increases, time increases linearly. This is a strong positive association.",
      data: [
        { x: 1, y: 7 }, { x: 2, y: 16 }, { x: 2, y: 20 }, { x: 3, y: 26 },
        { x: 3, y: 31 }, { x: 4, y: 38 }, { x: 4, y: 45 }, { x: 5, y: 55 }
      ],
      xLabel: "Distance (miles)",
      yLabel: "Time (minutes)",
      equation: "y ≈ 11.5x - 3",
      type: 'positive'
    },
    {
      title: "Car Value vs. Age (Negative)",
      description: "As a car gets older, its resale value typically decreases. This shows a negative association.",
      data: [
        { x: 1, y: 25000 }, { x: 2, y: 21000 }, { x: 3, y: 18500 }, { x: 5, y: 14000 },
        { x: 7, y: 9000 }, { x: 10, y: 6000 }, { x: 12, y: 4500 }, { x: 15, y: 2000 }
      ],
      xLabel: "Age of Car (years)",
      yLabel: "Value ($)",
      equation: "y ≈ -1600x + 26000",
      type: 'negative'
    },
    {
      title: "Shoe Size vs. IQ (No Association)",
      description: "There is no logical relationship between a person's shoe size and their intelligence score. The points are scattered randomly.",
      data: [
        { x: 6, y: 105 }, { x: 7, y: 95 }, { x: 8, y: 120 }, { x: 9, y: 85 },
        { x: 10, y: 110 }, { x: 11, y: 100 }, { x: 12, y: 115 }, { x: 13, y: 90 }
      ],
      xLabel: "Shoe Size",
      yLabel: "IQ Score",
      equation: "No Trend Line",
      type: 'none'
    },
    {
      title: "Altitude vs. Temperature (Negative)",
      description: "As you climb higher into the atmosphere (altitude), the air temperature generally drops.",
      data: [
        { x: 0, y: 59 }, { x: 1000, y: 55 }, { x: 2000, y: 52 }, { x: 3000, y: 48 },
        { x: 5000, y: 41 }, { x: 7000, y: 34 }, { x: 10000, y: 23 }, { x: 15000, y: 5 }
      ],
      xLabel: "Altitude (feet)",
      yLabel: "Temp (°F)",
      equation: "y ≈ -0.0035x + 59",
      type: 'negative'
    },
    {
      title: "Study Time vs. Test Scores (Positive)",
      description: "Students who spend more time studying generally tend to earn higher grades on exams.",
      data: [
        { x: 1, y: 65 }, { x: 2, y: 72 }, { x: 3, y: 75 }, { x: 4, y: 82 },
        { x: 5, y: 88 }, { x: 6, y: 92 }, { x: 7, y: 95 }, { x: 8, y: 98 }
      ],
      xLabel: "Study Hours",
      yLabel: "Test Score (%)",
      equation: "y ≈ 4.5x + 62",
      type: 'positive'
    },
    {
      title: "Ice Cream vs. Temperature (Positive)",
      description: "Higher temperatures usually mean more ice cream sales. A strong positive association.",
      data: [
        { x: 65, y: 150 }, { x: 70, y: 200 }, { x: 75, y: 310 }, { x: 80, y: 380 },
        { x: 85, y: 450 }, { x: 90, y: 580 }, { x: 95, y: 620 }, { x: 100, y: 750 }
      ],
      xLabel: "Temperature (°F)",
      yLabel: "Sales ($)",
      equation: "y ≈ 18x - 1000",
      type: 'positive'
    }
  ];

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Real World Problems</h2>
        <p className="text-lg text-slate-600">
          Scatter plots help us understand real-world relationships. Explore these examples to see how data behaves in different scenarios.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {scenarios.map((s, idx) => (
          <Card key={idx} title={s.title} className="flex flex-col">
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">{s.description}</p>
              <div className="h-[250px] w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name={s.xLabel} 
                      stroke="#64748b" 
                      fontSize={10} 
                      label={{ value: s.xLabel, position: 'bottom', offset: 0, fontSize: 10 }} 
                      domain={['auto', 'auto']}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name={s.yLabel} 
                      stroke="#64748b" 
                      fontSize={10} 
                      label={{ value: s.yLabel, angle: -90, position: 'insideLeft', fontSize: 10 }} 
                      domain={['auto', 'auto']}
                    />
                    <Tooltip />
                    <Scatter data={s.data} fill={s.type === 'positive' ? '#65a30d' : s.type === 'negative' ? '#ef4444' : '#64748b'} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={cn(
              "p-3 rounded-lg border text-center mt-auto",
              s.type === 'positive' ? "bg-lime-50 border-lime-100" : 
              s.type === 'negative' ? "bg-rose-50 border-rose-100" : 
              "bg-slate-50 border-slate-100"
            )}>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Trend Analysis</span>
              <div className={cn(
                "text-base font-mono font-bold",
                s.type === 'positive' ? "text-lime-700" : 
                s.type === 'negative' ? "text-rose-700" : 
                "text-slate-600"
              )}>{s.equation}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const QuizSection = () => {
  const [quizMode, setQuizMode] = useState<'digital' | 'printable'>('digital');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (optionIdx: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [currentQuestion]: optionIdx }));
  };

  const score = useMemo(() => {
    return QUIZ_QUESTIONS.reduce((acc, q, idx) => {
      return acc + (answers[idx] === q.correctAnswer ? 1 : 0);
    }, 0);
  }, [answers]);

  const resetQuiz = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
  };

  if (quizMode === 'printable') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center print:hidden">
          <h2 className="text-2xl font-bold text-slate-900">Printable Quiz</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setQuizMode('digital')}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-lime-600"
            >
              Back to Digital
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
            >
              <Printer size={18} />
              Print Quiz
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Scatter Plot Mastery Quiz</h1>
            <p className="text-slate-500">Name: _________________________________ Date: _______________</p>
          </div>
          
          <div className="space-y-8">
            {QUIZ_QUESTIONS.map((q, idx) => (
              <div key={q.id} className="break-inside-avoid">
                <p className="font-semibold text-lg mb-3">
                  {idx + 1}. {q.question}
                </p>
                {q.tableData && (
                  <div className="ml-4">
                    <DataTable data={q.tableData} />
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2 ml-4">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-3">
                      <div className="w-5 h-5 border border-slate-400 rounded-full"></div>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 print:hidden">
            <h3 className="font-bold text-lg mb-4">Answer Key</h3>
            <div className="grid grid-cols-5 gap-4">
              {QUIZ_QUESTIONS.map((q, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-bold">{idx + 1}:</span> {q.options[q.correctAnswer]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Digital Quiz</h2>
        <button 
          onClick={() => setQuizMode('printable')}
          className="flex items-center gap-2 px-4 py-2 text-lime-600 hover:bg-lime-50 rounded-lg transition-colors"
        >
          <Printer size={18} />
          Switch to Printable
        </button>
      </div>

      {!showResults ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-sm font-medium text-slate-500">
            <span>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
            <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-lime-600 transition-all duration-300" 
                style={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="min-h-[400px] flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    {QUIZ_QUESTIONS[currentQuestion].question}
                  </h3>
                  {QUIZ_QUESTIONS[currentQuestion].tableData && (
                    <div className="mb-6">
                      <DataTable data={QUIZ_QUESTIONS[currentQuestion].tableData} />
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-4">
                    {QUIZ_QUESTIONS[currentQuestion].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group",
                          answers[currentQuestion] === idx 
                            ? "border-lime-600 bg-lime-50 text-lime-900" 
                            : "border-slate-100 hover:border-lime-200 hover:bg-slate-50 text-slate-700"
                        )}
                      >
                        <span className="font-medium">{option}</span>
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                          answers[currentQuestion] === idx 
                            ? "border-lime-600 bg-lime-600 text-white" 
                            : "border-slate-200 group-hover:border-lime-300"
                        )}>
                          {answers[currentQuestion] === idx && <CheckCircle2 size={14} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-lime-600 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                  >
                    <ChevronLeft size={20} />
                    Previous
                  </button>
                  
                  {currentQuestion === QUIZ_QUESTIONS.length - 1 ? (
                    <button
                      onClick={() => setShowResults(true)}
                      disabled={Object.keys(answers).length < QUIZ_QUESTIONS.length}
                      className="px-8 py-2 bg-lime-600 text-white rounded-xl font-bold hover:bg-lime-700 disabled:opacity-50 disabled:hover:bg-lime-600 transition-all shadow-lg shadow-lime-200"
                    >
                      Finish Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestion(prev => prev + 1)}
                      className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                    >
                      Next
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="text-center py-12">
            <div className="w-24 h-24 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardCheck className="text-lime-600" size={48} />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h3>
            <p className="text-slate-500 mb-8">You've mastered the basics of scatter plots.</p>
            
            <div className="text-6xl font-black text-lime-600 mb-2">
              {Math.round((score / QUIZ_QUESTIONS.length) * 100)}%
            </div>
            <p className="text-lg font-medium text-slate-700 mb-8">
              You got {score} out of {QUIZ_QUESTIONS.length} correct.
            </p>

            <div className="max-w-md mx-auto space-y-4 mb-10">
              {QUIZ_QUESTIONS.map((q, idx) => (
                <div key={idx} className="text-left p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-start gap-3">
                    {answers[idx] === q.correctAnswer ? (
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} />
                    ) : (
                      <XCircle className="text-rose-500 shrink-0 mt-1" size={18} />
                    )}
                    <div>
                      <p className="font-semibold text-slate-800 text-sm mb-1">{q.question}</p>
                      <p className="text-xs text-slate-500">
                        Correct: <span className="text-emerald-600 font-medium">{q.options[q.correctAnswer]}</span>
                      </p>
                      {! (answers[idx] === q.correctAnswer) && (
                        <p className="text-xs text-slate-400 mt-1 italic">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={resetQuiz}
              className="flex items-center gap-2 px-8 py-3 bg-lime-600 text-white rounded-xl font-bold hover:bg-lime-700 transition-all shadow-lg shadow-lime-200 mx-auto"
            >
              <RotateCcw size={20} />
              Try Again
            </button>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

const PracticeSection = () => {
  const [problem, setProblem] = useState<{
    slope: number;
    intercept: number;
    targetX: number;
    points: ScatterPoint[];
    targetLine: { x: number; lineY: number }[];
  } | null>(null);
  const [userSlope, setUserSlope] = useState(1);
  const [userIntercept, setUserIntercept] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'neutral' } | null>(null);
  const [showTargetLine, setShowTargetLine] = useState(false);

  const generateProblem = () => {
    const m = parseFloat((Math.random() * 3 + 0.5).toFixed(1));
    const b = Math.floor(Math.random() * 15);
    const targetX = Math.floor(Math.random() * 10) + 10; // 10 to 20
    
    const points: ScatterPoint[] = [];
    for (let i = 1; i <= 10; i++) {
      const x = i * 1.5;
      const y = m * x + b + (Math.random() * 4 - 2);
      points.push({ x, y, id: `p-${i}` });
    }

    const targetLine = Array.from({ length: 21 }, (_, i) => ({
      x: i,
      lineY: m * i + b
    }));

    setProblem({ slope: m, intercept: b, targetX, points, targetLine });
    setUserSlope(1);
    setUserIntercept(0);
    setUserAnswer('');
    setFeedback(null);
    setShowTargetLine(false);
  };

  // Initialize first problem
  React.useEffect(() => {
    generateProblem();
  }, []);

  const userLine = useMemo(() => {
    return Array.from({ length: 21 }, (_, i) => ({
      x: i,
      userY: userSlope * i + userIntercept
    }));
  }, [userSlope, userIntercept]);

  const checkFit = () => {
    if (!problem) return;
    const slopeDiff = Math.abs(userSlope - problem.slope);
    const interceptDiff = Math.abs(userIntercept - problem.intercept);
    
    if (slopeDiff < 0.3 && interceptDiff < 3) {
      setFeedback({ 
        message: `Great fit! Your line is very close to the data. The target equation was y = ${problem.slope}x + ${problem.intercept}.`, 
        type: 'success' 
      });
      setShowTargetLine(true);
    } else {
      setFeedback({ 
        message: "Your line doesn't quite match the data yet. Try adjusting the slope or intercept!", 
        type: 'neutral' 
      });
    }
  };

  const checkPrediction = () => {
    if (!problem) return;
    const correctY = problem.slope * problem.targetX + problem.intercept;
    const userVal = parseFloat(userAnswer);
    
    if (isNaN(userVal)) {
      setFeedback({ message: "Please enter a valid number for your prediction.", type: 'neutral' });
      return;
    }

    const diff = Math.abs(userVal - correctY);
    if (diff < 1.0) {
      setFeedback({ 
        message: `Excellent! Your prediction ${userVal} is very accurate. The exact value is ${correctY.toFixed(1)}.`, 
        type: 'success' 
      });
      setShowTargetLine(true);
    } else {
      setFeedback({ 
        message: `Not quite. Based on the target trend line (y = ${problem.slope}x + ${problem.intercept}), the value should be ${correctY.toFixed(1)}.`, 
        type: 'error' 
      });
      setShowTargetLine(true);
    }
  };

  if (!problem) return null;

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Practice: Match & Predict</h2>
        <p className="text-lg text-slate-600">
          First, adjust the sliders to find the best trend line for the data. Then, use your line to predict a value!
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Interactive Practice Graph">
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                  <XAxis type="number" dataKey="x" domain={[0, 20]} stroke="#64748b" fontSize={12} tickCount={11} />
                  <YAxis type="number" domain={[0, 80]} stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Scatter name="Data Points" data={problem.points} fill="#65a30d" dataKey="y" />
                  <Line 
                    name="Your Line" 
                    data={userLine} 
                    type="linear" 
                    dataKey="userY" 
                    stroke="#eab308" 
                    strokeWidth={4} 
                    dot={false} 
                    animationDuration={300}
                  />
                  {showTargetLine && (
                    <Line 
                      name="Target Line" 
                      data={problem.targetLine} 
                      type="linear" 
                      dataKey="lineY" 
                      stroke="#65a30d" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      dot={false} 
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-yellow-500"></div>
                <span>Your Line: y = {userSlope.toFixed(1)}x + {userIntercept}</span>
              </div>
              {showTargetLine && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-lime-600 border-t border-dashed"></div>
                  <span>Target Line: y = {problem.slope}x + {problem.intercept}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Step 1: Match the Line">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700">Slope (m): {userSlope.toFixed(1)}</label>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="5" 
                    step="0.1" 
                    value={userSlope} 
                    onChange={(e) => setUserSlope(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-lime-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700">Y-Intercept (b): {userIntercept}</label>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="30" 
                    step="1" 
                    value={userIntercept} 
                    onChange={(e) => setUserIntercept(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-lime-600"
                  />
                </div>
              </div>
              <button
                onClick={checkFit}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Check Fit
              </button>
            </div>
          </Card>

          <Card title="Step 2: Predict Value">
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Predict <span className="font-bold">y</span> when <span className="font-bold">x = {problem.targetX}</span>:
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter y value"
                  className="flex-1 px-4 py-2 border-2 border-slate-100 rounded-xl focus:border-lime-500 outline-none transition-all"
                />
                <button
                  onClick={checkPrediction}
                  className="px-6 py-2 bg-lime-600 text-white rounded-xl font-bold hover:bg-lime-700 transition-all shadow-lg shadow-lime-100"
                >
                  Check
                </button>
              </div>
            </div>
          </Card>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-xl border-2 flex items-start gap-3",
                feedback.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
                feedback.type === 'error' ? "bg-rose-50 border-rose-100 text-rose-800" :
                "bg-slate-50 border-slate-100 text-slate-800"
              )}
            >
              {feedback.type === 'success' ? <CheckCircle2 className="shrink-0 mt-1" size={18} /> : <Info className="shrink-0 mt-1" size={18} />}
              <p className="text-sm font-medium">{feedback.message}</p>
            </motion.div>
          )}

          <button
            onClick={generateProblem}
            className="w-full py-4 bg-lime-100 text-lime-700 rounded-xl font-bold hover:bg-lime-200 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            New Problem
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'learn' | 'trend' | 'world' | 'practice' | 'quiz'>('learn');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-lime-600 rounded-xl flex items-center justify-center shadow-lg shadow-lime-200">
                <TrendingUp className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-lime-600 to-yellow-600">
                Scatter Plot Master
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex gap-1">
                <TabButton 
                  active={activeTab === 'learn'} 
                  onClick={() => setActiveTab('learn')} 
                  icon={BookOpen} 
                  label="Learn" 
                />
                <TabButton 
                  active={activeTab === 'trend'} 
                  onClick={() => setActiveTab('trend')} 
                  icon={TrendingUp} 
                  label="Trend Lines" 
                />
                <TabButton 
                  active={activeTab === 'world'} 
                  onClick={() => setActiveTab('world')} 
                  icon={Globe} 
                  label="Real World" 
                />
                <TabButton 
                  active={activeTab === 'practice'} 
                  onClick={() => setActiveTab('practice')} 
                  icon={RotateCcw} 
                  label="Practice" 
                />
                <TabButton 
                  active={activeTab === 'quiz'} 
                  onClick={() => setActiveTab('quiz')} 
                  icon={ClipboardCheck} 
                  label="Quiz" 
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'learn' && <LearnSection />}
            {activeTab === 'trend' && <TrendLineSection />}
            {activeTab === 'world' && <RealWorldSection />}
            {activeTab === 'practice' && <PracticeSection />}
            {activeTab === 'quiz' && <QuizSection />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Scatter Plot Master - Educational Tool for Students
          </p>
        </div>
      </footer>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white; }
          nav, footer, .print-hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
          .max-w-7xl { max-width: 100% !important; }
        }
      `}} />
    </div>
  );
}
