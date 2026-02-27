/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Calculator, 
  Layers, 
  CheckCircle2, 
  Printer, 
  ChevronRight, 
  ChevronLeft,
  RotateCcw,
  Download,
  Info,
  AlertCircle,
  MousePointer2,
  Target,
  HelpCircle,
  RefreshCw,
  ArrowUpDown,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { QUIZ_QUESTIONS, Question, WORD_SCENARIOS, DECIMAL_CHALLENGE } from './constants';

const Radical = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center align-baseline">
    <span className="font-serif italic text-[1.2em] leading-none translate-y-[0.05em]">√</span>
    <span className="border-t-[1.5px] border-current -ml-[0.1em] px-[0.1em] leading-none pt-[0.1em]">
      {children}
    </span>
  </span>
);

const QuizVisual = ({ question }: { question: Question }) => {
  if (!question.visualType) return null;

  switch (question.visualType) {
    case 'number-line':
      const range = question.visualData?.range || [0, 10];
      const points = question.visualData?.points || [];
      const target = question.visualData?.target;
      
      return (
        <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="relative h-12 flex items-center px-4">
            <div className="absolute left-4 right-4 h-0.5 bg-slate-300" />
            {points.map((p: any, i: number) => {
              const pos = ((p.val - range[0]) / (range[1] - range[0])) * 100;
              return (
                <div key={i} className="absolute flex flex-col items-center" style={{ left: `${pos}%` }}>
                  <div className="h-3 w-0.5 bg-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 mt-1">{p.label || p.val}</span>
                </div>
              );
            })}
            {target !== undefined && (
              <div 
                className="absolute w-3 h-3 bg-rose-500 rounded-full shadow-sm border-2 border-white" 
                style={{ left: `${((target - range[0]) / (range[1] - range[0])) * 100}%`, transform: 'translateX(-50%)' }} 
              />
            )}
          </div>
        </div>
      );
    case 'comparison':
      return (
        <div className="my-6 flex items-center justify-center gap-8">
          <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-sm font-bold text-lg">?</div>
          <div className="text-2xl font-black text-slate-200">vs</div>
          <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-sm font-bold text-lg">?</div>
        </div>
      );
    default:
      return null;
  }
};

const formatMath = (text: string) => {
  if (typeof text !== 'string') return text;
  const parts = text.split(/(√\d+(?:\.\d+)?|√[a-zπ])/gi);
  return parts.map((part, i) => {
    if (part.startsWith('√')) {
      const radicand = part.slice(1);
      return <span key={i}><Radical>{radicand}</Radical></span>;
    }
    return part;
  });
};

type Tab = 'classify' | 'practice' | 'concepts' | 'ordering' | 'decimals' | 'estimating' | 'quiz' | 'printable';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('classify');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Ordering Tab State
  const ORDERING_CHALLENGES = [
    { 
      title: "Ascending Order", 
      instruction: "Order from LEAST to GREATEST (Smallest to Largest)", 
      items: [
        { val: '√5', num: Math.sqrt(5) },
        { val: '2.5', num: 2.5 },
        { val: '√3', num: Math.sqrt(3) },
        { val: '2', num: 2 }
      ],
      correctOrder: ['√3', '2', '√5', '2.5']
    },
    { 
      title: "Descending Order", 
      instruction: "Order from GREATEST to LEAST (Largest to Smallest)", 
      items: [
        { val: '-√10', num: -Math.sqrt(10) },
        { val: '-3.5', num: -3.5 },
        { val: 'π', num: Math.PI },
        { val: '3', num: 3 }
      ],
      correctOrder: ['π', '3', '-√10', '-3.5']
    },
    {
      title: "Canyon Distance",
      instruction: "Word Problem: Order distances from GREATEST to LEAST",
      description: "Juana: √28 km, Lee Ann: 23/4 km, Ryne: 5.5 km, Jackson: 5 1/2 km",
      items: [
        { val: '√28', num: Math.sqrt(28) },
        { val: '23/4', num: 23/4 },
        { val: '5.5', num: 5.5 },
        { val: '5 1/2', num: 5.5 }
      ],
      correctOrder: ['23/4', '5.5', '5 1/2', '√28'] // 5.75, 5.5, 5.5, 5.29
    }
  ];
  const [orderingIndex, setOrderingIndex] = useState(0);
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [orderingFeedback, setOrderingFeedback] = useState<{ correct: boolean, show: boolean } | null>(null);

  const handleOrderItemClick = (val: string) => {
    if (userOrder.includes(val)) {
      setUserOrder(prev => prev.filter(i => i !== val));
    } else {
      setUserOrder(prev => [...prev, val]);
    }
  };

  const checkOrder = () => {
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(ORDERING_CHALLENGES[orderingIndex].correctOrder);
    setOrderingFeedback({ correct: isCorrect, show: true });
  };

  const nextOrdering = () => {
    setOrderingIndex(prev => (prev + 1) % ORDERING_CHALLENGES.length);
    setUserOrder([]);
    setOrderingFeedback(null);
  };

  // Concepts Tab State
  const CONCEPT_QUESTIONS = [
    { q: "Is a whole number a real number?", a: true, e: "Yes! Whole numbers are a subset of integers, which are rational, and all rational numbers are real." },
    { q: "Are all irrational numbers real?", a: true, e: "Yes! The set of real numbers is made up of both rational and irrational numbers." },
    { q: "Are all integers whole numbers?", a: false, e: "No. Integers include negative numbers (like -5), but whole numbers start at 0." },
    { q: "Are all real numbers rational?", a: false, e: "No. Real numbers also include irrational numbers like π and √2." },
    { q: "Is zero a natural number?", a: false, e: "No. Natural numbers (counting numbers) typically start at 1. Whole numbers start at 0." },
    { q: "Is every rational number an integer?", a: false, e: "No. Fractions like 1/2 are rational but are not integers." },
  ];
  const [conceptIndex, setConceptIndex] = useState(0);
  const [conceptFeedback, setConceptFeedback] = useState<{ correct: boolean, show: boolean } | null>(null);
  const [showConceptHint, setShowConceptHint] = useState(false);

  const CLASSIFICATION_INFO = {
    natural: "Counting numbers starting from 1 (1, 2, 3...). They are used for counting discrete objects.",
    whole: "Natural numbers plus zero (0, 1, 2, 3...). Zero is the only difference between Whole and Natural sets.",
    integers: "Whole numbers and their negative opposites (...-2, -1, 0, 1, 2...). No fractions or decimals!",
    rational: "Numbers that can be written as a fraction a/b. This includes terminating decimals (0.5) and repeating decimals (0.333...).",
    irrational: "Numbers that cannot be written as a fraction. Their decimals never end and never repeat (like π or √2).",
    real: "All numbers that can be found on a number line, including both Rational and Irrational numbers."
  };

  const [activeInfo, setActiveInfo] = useState<keyof typeof CLASSIFICATION_INFO | null>(null);

  const handleConceptAnswer = (answer: boolean) => {
    const isCorrect = answer === CONCEPT_QUESTIONS[conceptIndex].a;
    setConceptFeedback({ correct: isCorrect, show: true });
  };

  const nextConcept = () => {
    if (conceptIndex < CONCEPT_QUESTIONS.length - 1) {
      setConceptIndex(prev => prev + 1);
      setConceptFeedback(null);
      setShowConceptHint(false);
    } else {
      setConceptIndex(0);
      setConceptFeedback(null);
      setShowConceptHint(false);
    }
  };

  // Practice State
  const initialPracticeItems = [
    { id: 1, value: '5', category: 'natural' },
    { id: 2, value: '-3', category: 'integer' },
    { id: 3, value: '1/2', category: 'rational' },
    { id: 4, value: 'π', category: 'irrational' },
    { id: 5, value: <Radical>2</Radical>, category: 'irrational', rawValue: '√2' },
    { id: 6, value: '0', category: 'whole' },
    { id: 7, value: '0.75', category: 'rational' },
    { id: 8, value: <Radical>16</Radical>, category: 'natural', rawValue: '√16' },
    { id: 9, value: <span>-<Radical>5</Radical></span>, category: 'irrational', rawValue: '-√5' },
    { id: 10, value: '-12', category: 'integer' },
    { id: 11, value: '100', category: 'natural' },
  ];

  const [practiceItems, setPracticeItems] = useState(initialPracticeItems);
  const [selectedPracticeItem, setSelectedPracticeItem] = useState<typeof initialPracticeItems[0] | null>(null);
  const [placedItems, setPlacedItems] = useState<{value: React.ReactNode, category: string}[]>([]);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [practiceSubTab, setPracticeSubTab] = useState<'diagram' | 'scenarios' | 'decimals'>('diagram');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [decimalUserOrder, setDecimalUserOrder] = useState<string[]>([]);
  const [decimalFeedback, setDecimalFeedback] = useState<{correct: boolean, show: boolean} | null>(null);

  const handleDrop = (dropCategory: string) => {
    if (!selectedPracticeItem) {
      setFeedback({ message: "Select a number first!", type: 'error' });
      setTimeout(() => setFeedback(null), 2000);
      return;
    }

    const displayVal = (selectedPracticeItem as any).rawValue || selectedPracticeItem.value;

    if (selectedPracticeItem.category === dropCategory) {
      setPlacedItems(prev => [...prev, { value: selectedPracticeItem.value, category: selectedPracticeItem.category }]);
      setPracticeItems(prev => prev.filter(i => i.id !== selectedPracticeItem.id));
      setFeedback({ message: `Correct! ${displayVal} is a ${selectedPracticeItem.category} number.`, type: 'success' });
      setSelectedPracticeItem(null);
    } else {
      setFeedback({ message: `Try again! ${displayVal} doesn't belong in ${dropCategory}.`, type: 'error' });
    }
    setTimeout(() => setFeedback(null), 2000);
  };

  const resetPractice = () => {
    setPracticeItems(initialPracticeItems);
    setPlacedItems([]);
    setFeedback(null);
    setSelectedPracticeItem(null);
    setScenarioIndex(0);
    setDecimalUserOrder([]);
    setDecimalFeedback(null);
  };

  const handleDecimalClick = (val: string) => {
    if (decimalUserOrder.includes(val)) {
      setDecimalUserOrder(prev => prev.filter(i => i !== val));
    } else {
      setDecimalUserOrder(prev => [...prev, val]);
    }
  };

  const checkDecimalOrder = () => {
    const correctOrder = [...DECIMAL_CHALLENGE].sort((a, b) => a.num - b.num).map(i => i.val);
    const isCorrect = JSON.stringify(decimalUserOrder) === JSON.stringify(correctOrder);
    setDecimalFeedback({ correct: isCorrect, show: true });
  };

  const handleScenarioAnswer = (option: string) => {
    const isCorrect = option === WORD_SCENARIOS[scenarioIndex].correct;
    setFeedback({ 
      message: isCorrect ? "Correct! " + WORD_SCENARIOS[scenarioIndex].explanation : "Try again! " + WORD_SCENARIOS[scenarioIndex].explanation, 
      type: isCorrect ? 'success' : 'error' 
    });
    if (isCorrect) {
      setTimeout(() => {
        if (scenarioIndex < WORD_SCENARIOS.length - 1) {
          setScenarioIndex(prev => prev + 1);
          setFeedback(null);
        }
      }, 3000);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const isCorrect = answer === QUIZ_QUESTIONS[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    // Delay the explanation to allow the user to process the immediate feedback
    setTimeout(() => {
      setShowExplanation(true);
    }, 800);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const tabs = [
    { id: 'classify', label: 'Classification', color: 'bg-indigo-600', icon: Layers },
    { id: 'practice', label: 'Interactive', color: 'bg-violet-600', icon: MousePointer2 },
    { id: 'concepts', label: 'Concepts', color: 'bg-cyan-600', icon: HelpCircle },
    { id: 'ordering', label: 'Ordering', color: 'bg-orange-600', icon: ArrowUpDown },
    { id: 'decimals', label: 'Decimals & Roots', color: 'bg-emerald-600', icon: Calculator },
    { id: 'estimating', label: 'Estimating', color: 'bg-amber-600', icon: BookOpen },
    { id: 'quiz', label: 'Digital Quiz', color: 'bg-rose-600', icon: CheckCircle2 },
    { id: 'printable', label: 'Printable Quiz', color: 'bg-slate-700', icon: Printer },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Real Number Master</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Student Learning Portal</p>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <nav className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id 
                    ? `${tab.color} text-white shadow-md` 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'classify' && (
            <motion.div
              key="classify"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-3xl font-bold mb-6 text-indigo-900">The Real Number System</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Real numbers are all the numbers that can be found on a number line. They are divided into two main categories: 
                  <button 
                    onMouseEnter={() => setActiveInfo('rational')}
                    onMouseLeave={() => setActiveInfo(null)}
                    onClick={() => setActiveInfo(activeInfo === 'rational' ? null : 'rational')}
                    className="font-bold text-indigo-600 hover:underline cursor-help px-1"
                  >
                    Rational
                  </button> 
                  and 
                  <button 
                    onMouseEnter={() => setActiveInfo('irrational')}
                    onMouseLeave={() => setActiveInfo(null)}
                    onClick={() => setActiveInfo(activeInfo === 'irrational' ? null : 'irrational')}
                    className="font-bold text-rose-600 hover:underline cursor-help px-1"
                  >
                    Irrational
                  </button>.
                </p>

                <AnimatePresence>
                  {activeInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-8 p-4 bg-slate-900 text-white rounded-2xl text-sm shadow-xl border border-slate-700 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                      <div className="flex items-start gap-3">
                        <Info size={18} className="text-indigo-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-black uppercase tracking-widest text-[10px] text-indigo-400 mb-1">{activeInfo} Numbers</p>
                          <p className="leading-relaxed">{CLASSIFICATION_INFO[activeInfo]}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <h3 className="text-xl font-bold text-indigo-800 mb-2">Rational Numbers</h3>
                      <p className="text-slate-700">Any number that can be written as a ratio <span className="italic">a/b</span> where <span className="italic">b ≠ 0</span>.</p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2 group cursor-help" onMouseEnter={() => setActiveInfo('natural')} onMouseLeave={() => setActiveInfo(null)}>
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> 
                          <strong className="group-hover:text-indigo-600 transition-colors">Natural Numbers:</strong> 1, 2, 3...
                        </li>
                        <li className="flex items-center gap-2 group cursor-help" onMouseEnter={() => setActiveInfo('whole')} onMouseLeave={() => setActiveInfo(null)}>
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> 
                          <strong className="group-hover:text-indigo-600 transition-colors">Whole Numbers:</strong> 0, 1, 2, 3...
                        </li>
                        <li className="flex items-center gap-2 group cursor-help" onMouseEnter={() => setActiveInfo('integers')} onMouseLeave={() => setActiveInfo(null)}>
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> 
                          <strong className="group-hover:text-indigo-600 transition-colors">Integers:</strong> ...-2, -1, 0, 1, 2...
                        </li>
                        <li className="flex items-center gap-2 group cursor-help" onMouseEnter={() => setActiveInfo('rational')} onMouseLeave={() => setActiveInfo(null)}>
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> 
                          <strong className="group-hover:text-indigo-600 transition-colors">Fractions:</strong> 1/2, -3/4, 7/1...
                        </li>
                      </ul>
                    </div>
                    <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
                      <h3 className="text-xl font-bold text-rose-800 mb-2">Irrational Numbers</h3>
                      <p className="text-slate-700">Numbers that CANNOT be written as a simple fraction. Their decimals never end and never repeat.</p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2 group cursor-help" onMouseEnter={() => setActiveInfo('irrational')} onMouseLeave={() => setActiveInfo(null)}>
                          <div className="w-1.5 h-1.5 bg-rose-400 rounded-full" /> 
                          <strong className="group-hover:text-rose-600 transition-colors">Constants:</strong> π (pi), e
                        </li>
                        <li className="flex items-center gap-2 group cursor-help" onMouseEnter={() => setActiveInfo('irrational')} onMouseLeave={() => setActiveInfo(null)}>
                          <div className="w-1.5 h-1.5 bg-rose-400 rounded-full" /> 
                          <strong className="group-hover:text-rose-600 transition-colors">Non-perfect Roots:</strong> {formatMath('√2, √3, √5...')}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Venn Diagram Representation */}
                    <div className="relative aspect-square max-w-md mx-auto w-full bg-slate-50 rounded-full flex items-center justify-center p-4 border border-slate-200">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[90%] h-[90%] border-4 border-slate-300 rounded-3xl flex flex-col p-6">
                          <span className="text-xs font-black uppercase text-slate-400 absolute top-4 left-8">Real Numbers</span>
                          
                          <div className="flex h-full gap-4">
                            {/* Rational Side */}
                            <div className="flex-1 bg-indigo-50/50 border-2 border-indigo-200 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                               <span className="text-xs font-bold text-indigo-400 absolute top-2">Rational</span>
                               
                               {/* Integers */}
                               <div className="w-[85%] h-[70%] bg-indigo-100/50 border-2 border-indigo-300 rounded-2xl flex flex-col items-center justify-center relative mt-4">
                                 <span className="text-[10px] font-bold text-indigo-500 absolute top-1">Integers</span>
                                 
                                 {/* Whole */}
                                 <div className="w-[80%] h-[60%] bg-indigo-200/50 border-2 border-indigo-400 rounded-2xl flex flex-col items-center justify-center relative mt-2">
                                   <span className="text-[10px] font-bold text-indigo-600 absolute top-1">Whole</span>
                                   
                                   {/* Natural */}
                                   <div className="w-[75%] h-[55%] bg-indigo-300/50 border-2 border-indigo-500 rounded-2xl flex items-center justify-center mt-2">
                                     <span className="text-[10px] font-bold text-indigo-700">Natural</span>
                                   </div>
                                 </div>
                               </div>
                            </div>

                            {/* Irrational Side */}
                            <div className="w-1/3 bg-rose-50/50 border-2 border-rose-200 rounded-2xl p-4 flex items-center justify-center">
                              <span className="text-xs font-bold text-rose-400 rotate-90 sm:rotate-0">Irrational</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Number Line Infographic */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">Number Line Distribution</h4>
                      <div className="relative h-12 flex items-center">
                        <div className="absolute w-full h-0.5 bg-slate-700" />
                        <div className="flex justify-between w-full px-2">
                          {[-2, -1, 0, 1, 2].map(n => (
                            <div key={n} className="flex flex-col items-center">
                              <div className="w-0.5 h-2 bg-slate-500 mb-1" />
                              <span className="text-[10px] font-bold text-slate-500">{n}</span>
                            </div>
                          ))}
                        </div>
                        {/* Example Markers */}
                        <div className="absolute left-[15%] -top-4 flex flex-col items-center">
                          <span className="text-[9px] font-bold text-rose-400">-{formatMath('√3')}</span>
                          <div className="w-1 h-1 bg-rose-400 rounded-full" />
                        </div>
                        <div className="absolute left-[62.5%] -top-4 flex flex-col items-center">
                          <span className="text-[9px] font-bold text-indigo-400">1/2</span>
                          <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                        </div>
                        <div className="absolute left-[85%] -top-4 flex flex-col items-center">
                          <span className="text-[9px] font-bold text-rose-400">π/2</span>
                          <div className="w-1 h-1 bg-rose-400 rounded-full" />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-4 text-center italic">Every point on the line is a Real Number.</p>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'concepts' && (
            <motion.div
              key="concepts"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-3xl font-bold text-cyan-900 mb-2">Concept Check</h2>
                <p className="text-slate-600 mb-8">Quickly verify your understanding of number relationships.</p>

                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 min-h-[300px] flex flex-col relative">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {conceptIndex + 1} of {CONCEPT_QUESTIONS.length}</span>
                    <button 
                      onClick={() => setShowConceptHint(!showConceptHint)}
                      className={`p-2 rounded-lg transition-all ${showConceptHint ? 'bg-cyan-100 text-cyan-600' : 'bg-white text-slate-400 hover:text-cyan-600 border border-slate-200'}`}
                      title="Show Concept Hint"
                    >
                      <Info size={18} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showConceptHint && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-cyan-900 text-white rounded-xl text-xs shadow-lg border border-cyan-700"
                      >
                        <p className="font-bold text-cyan-400 mb-1 uppercase tracking-widest text-[9px]">Concept Hint</p>
                        <p className="leading-relaxed">
                          {CONCEPT_QUESTIONS[conceptIndex].a 
                            ? "Think about how the smaller set is always contained within the larger set." 
                            : "Remember that being part of a larger set doesn't mean you have all the properties of the smaller subsets."}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <h3 className="text-2xl font-bold mb-8 text-slate-800 leading-tight">
                    {formatMath(CONCEPT_QUESTIONS[conceptIndex].q)}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <button
                      disabled={conceptFeedback?.show}
                      onClick={() => handleConceptAnswer(true)}
                      className={`py-4 rounded-2xl font-bold text-lg transition-all ${
                        conceptFeedback?.show && CONCEPT_QUESTIONS[conceptIndex].a === true
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : conceptFeedback?.show && CONCEPT_QUESTIONS[conceptIndex].a === false && conceptFeedback.correct === false
                          ? 'bg-rose-100 text-rose-400 border-2 border-rose-200'
                          : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-cyan-400 hover:text-cyan-600'
                      }`}
                    >
                      True
                    </button>
                    <button
                      disabled={conceptFeedback?.show}
                      onClick={() => handleConceptAnswer(false)}
                      className={`py-4 rounded-2xl font-bold text-lg transition-all ${
                        conceptFeedback?.show && CONCEPT_QUESTIONS[conceptIndex].a === false
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : conceptFeedback?.show && CONCEPT_QUESTIONS[conceptIndex].a === true && conceptFeedback.correct === false
                          ? 'bg-rose-100 text-rose-400 border-2 border-rose-200'
                          : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-cyan-400 hover:text-cyan-600'
                      }`}
                    >
                      False
                    </button>
                  </div>

                  <AnimatePresence>
                    {conceptFeedback?.show && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-8 p-6 rounded-2xl border-2 ${
                          conceptFeedback.correct ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {conceptFeedback.correct ? (
                            <CheckCircle2 className="text-emerald-500 shrink-0" />
                          ) : (
                            <AlertCircle className="text-rose-500 shrink-0" />
                          )}
                          <div>
                            <p className={`font-bold mb-1 ${conceptFeedback.correct ? 'text-emerald-800' : 'text-rose-800'}`}>
                              {conceptFeedback.correct ? 'Correct!' : 'Incorrect'}
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {formatMath(CONCEPT_QUESTIONS[conceptIndex].e)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={nextConcept}
                          className="w-full mt-6 bg-cyan-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-cyan-700 transition-all shadow-md"
                        >
                          {conceptIndex === CONCEPT_QUESTIONS.length - 1 ? 'Restart' : 'Next Question'}
                          <ChevronRight size={18} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'ordering' && (
            <motion.div
              key="ordering"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-orange-900">Ordering Challenge</h2>
                    <p className="text-slate-600">Click the numbers in the correct sequence.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                    {ORDERING_CHALLENGES[orderingIndex].instruction.includes('LEAST') ? (
                      <MoveUp className="text-orange-600" size={20} />
                    ) : (
                      <MoveDown className="text-orange-600" size={20} />
                    )}
                    <span className="text-xs font-black text-orange-700 uppercase tracking-widest">
                      {ORDERING_CHALLENGES[orderingIndex].instruction}
                    </span>
                  </div>
                </div>

                {ORDERING_CHALLENGES[orderingIndex].description && (
                  <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600 italic">
                    {ORDERING_CHALLENGES[orderingIndex].description}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Available Numbers</h3>
                    <div className="flex flex-wrap gap-3">
                      {ORDERING_CHALLENGES[orderingIndex].items.map((item) => (
                        <button
                          key={item.val}
                          disabled={orderingFeedback?.show}
                          onClick={() => handleOrderItemClick(item.val)}
                          className={`px-6 py-3 rounded-2xl font-mono font-bold text-lg transition-all border-2 ${
                            userOrder.includes(item.val)
                              ? 'bg-slate-100 border-slate-200 text-slate-300 scale-95'
                              : 'bg-white border-orange-200 text-orange-700 hover:border-orange-400 hover:shadow-md'
                          }`}
                        >
                          {formatMath(item.val)}
                        </button>
                      ))}
                    </div>
                    {userOrder.length > 0 && !orderingFeedback?.show && (
                      <button 
                        onClick={() => setUserOrder([])}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                      >
                        <RotateCcw size={12} /> Reset Selection
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Your Sequence</h3>
                    <div className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 min-h-[120px] flex flex-wrap gap-2 items-center justify-center">
                      {userOrder.length === 0 ? (
                        <span className="text-slate-400 text-sm italic">Click numbers to start ordering...</span>
                      ) : (
                        userOrder.map((val, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="bg-orange-600 text-white px-4 py-2 rounded-xl font-mono font-bold shadow-sm">
                              {formatMath(val)}
                            </div>
                            {idx < userOrder.length - 1 && <ChevronRight size={16} className="text-slate-300" />}
                          </div>
                        ))
                      )}
                    </div>
                    
                    {userOrder.length === ORDERING_CHALLENGES[orderingIndex].items.length && !orderingFeedback?.show && (
                      <button
                        onClick={checkOrder}
                        className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all"
                      >
                        Check Sequence
                      </button>
                    )}

                    <AnimatePresence>
                      {orderingFeedback?.show && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-6 rounded-2xl border-2 ${
                            orderingFeedback.correct ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            {orderingFeedback.correct ? (
                              <CheckCircle2 className="text-emerald-500" />
                            ) : (
                              <AlertCircle className="text-rose-500" />
                            )}
                            <span className={`font-bold ${orderingFeedback.correct ? 'text-emerald-800' : 'text-rose-800'}`}>
                              {orderingFeedback.correct ? 'Perfect Order!' : 'Not Quite Right'}
                            </span>
                          </div>
                          {!orderingFeedback.correct && (
                            <div className="text-xs text-slate-600 mb-4">
                              <p className="font-bold mb-1">Correct sequence:</p>
                              <div className="flex items-center gap-1 font-mono">
                                {ORDERING_CHALLENGES[orderingIndex].correctOrder.join(' → ')}
                              </div>
                            </div>
                          )}
                          <button
                            onClick={nextOrdering}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all"
                          >
                            Next Challenge
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </section>

              {/* Tips Section */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Info size={20} />
                  </div>
                  <h4 className="font-bold mb-2">Tip: Approximate</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Convert roots and fractions to decimals first. {formatMath('√5')} ≈ 2.24, 23/4 = 5.75.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
                    <AlertCircle size={20} />
                  </div>
                  <h4 className="font-bold mb-2">Negatives</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Remember: -5 is LESS than -2. The larger the absolute value of a negative, the smaller the number.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <Target size={20} />
                  </div>
                  <h4 className="font-bold mb-2">Synonyms</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">"Increasing" = Least to Greatest. "Decreasing" = Greatest to Least.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              {/* Sub-navigation */}
              <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit mx-auto">
                <button 
                  onClick={() => setPracticeSubTab('diagram')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${practiceSubTab === 'diagram' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Venn Diagram
                </button>
                <button 
                  onClick={() => setPracticeSubTab('scenarios')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${practiceSubTab === 'scenarios' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Real World Sort
                </button>
                <button 
                  onClick={() => setPracticeSubTab('decimals')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${practiceSubTab === 'decimals' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Decimal Dash
                </button>
              </div>

              {practiceSubTab === 'diagram' && (
                <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-violet-900">Interactive Diagram</h2>
                      <p className="text-slate-600">Drag the numbers to their most specific category in the Venn diagram.</p>
                    </div>
                    <button 
                      onClick={resetPractice}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                      <RefreshCw size={16} />
                      Reset
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Numbers to Drag */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Numbers to Place</h3>
                      <div className="flex flex-wrap gap-3">
                        <AnimatePresence>
                          {practiceItems.map((item) => (
                            <motion.button
                              key={item.id}
                              layoutId={`item-${item.id}`}
                              onClick={() => setSelectedPracticeItem(item)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-4 py-2 rounded-xl font-mono font-bold transition-all shadow-sm border-2 ${
                                selectedPracticeItem?.id === item.id
                                  ? 'bg-violet-600 border-violet-600 text-white shadow-violet-200'
                                  : 'bg-white border-violet-200 text-violet-700 hover:border-violet-400'
                              }`}
                            >
                              {item.value}
                            </motion.button>
                          ))}
                        </AnimatePresence>
                      </div>
                      {practiceItems.length === 0 && (
                        <div className="text-center py-8">
                          <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm font-bold text-emerald-600">All numbers placed!</p>
                        </div>
                      )}
                    </div>

                    {/* Diagram Drop Zones */}
                    <div className="lg:col-span-2 relative aspect-[4/3] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8">
                      <div className="absolute inset-8 border-4 border-slate-300 rounded-[2rem] flex flex-col p-6">
                        <span className="text-xs font-black uppercase text-slate-400 absolute top-4 left-8">Real Numbers</span>
                        
                        <div className="flex h-full gap-4">
                          {/* Rational Container */}
                          <div className="flex-1 flex flex-col gap-4">
                            <button 
                              onClick={() => handleDrop('rational')}
                              className="flex-1 bg-indigo-50/50 border-2 border-indigo-200 rounded-2xl p-4 flex flex-col items-center justify-start relative hover:bg-indigo-100/50 transition-colors group"
                            >
                              <span className="text-xs font-bold text-indigo-400">Rational</span>
                              <div className="flex flex-wrap gap-1 mt-6 justify-center">
                                {placedItems.filter(i => i.category === 'rational').map((i, idx) => (
                                  <span key={idx} className="bg-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-indigo-200">{i.value}</span>
                                ))}
                              </div>
                              
                              {/* Integer Zone */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDrop('integer'); }}
                                className="w-[90%] h-[70%] bg-indigo-100/50 border-2 border-indigo-300 rounded-2xl flex flex-col items-center justify-start relative mt-auto mb-2 hover:bg-indigo-200/50 transition-colors"
                              >
                                <span className="text-[10px] font-bold text-indigo-500 mt-1">Integers</span>
                                <div className="flex flex-wrap gap-1 mt-4 justify-center">
                                  {placedItems.filter(i => i.category === 'integer').map((i, idx) => (
                                    <span key={idx} className="bg-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-indigo-300">{i.value}</span>
                                  ))}
                                </div>

                                {/* Whole Zone */}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDrop('whole'); }}
                                  className="w-[85%] h-[60%] bg-indigo-200/50 border-2 border-indigo-400 rounded-2xl flex flex-col items-center justify-start mt-auto mb-2 hover:bg-indigo-300/50 transition-colors"
                                >
                                  <span className="text-[10px] font-bold text-indigo-600 mt-1">Whole</span>
                                  <div className="flex flex-wrap gap-1 mt-2 justify-center">
                                    {placedItems.filter(i => i.category === 'whole').map((i, idx) => (
                                      <span key={idx} className="bg-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-indigo-400">{i.value}</span>
                                    ))}
                                  </div>

                                  {/* Natural Zone */}
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDrop('natural'); }}
                                    className="w-[80%] h-[55%] bg-indigo-300/50 border-2 border-indigo-500 rounded-2xl flex flex-col items-center justify-start mt-auto mb-2 hover:bg-indigo-400/50 transition-colors"
                                  >
                                    <span className="text-[10px] font-bold text-indigo-700 mt-1">Natural</span>
                                    <div className="flex flex-wrap gap-1 mt-1 justify-center">
                                      {placedItems.filter(i => i.category === 'natural').map((i, idx) => (
                                        <span key={idx} className="bg-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-indigo-500">{i.value}</span>
                                      ))}
                                    </div>
                                  </button>
                                </button>
                              </button>
                            </button>
                          </div>

                          {/* Irrational Zone */}
                          <button 
                            onClick={() => handleDrop('irrational')}
                            className="w-1/3 bg-rose-50/50 border-2 border-rose-200 rounded-2xl p-4 flex flex-col items-center justify-start relative hover:bg-rose-100/50 transition-colors"
                          >
                            <span className="text-xs font-bold text-rose-400">Irrational</span>
                            <div className="flex flex-wrap gap-1 mt-6 justify-center">
                              {placedItems.filter(i => i.category === 'irrational').map((i, idx) => (
                                <span key={idx} className="bg-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-rose-200">{i.value}</span>
                              ))}
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Feedback Overlay */}
                      <AnimatePresence>
                        {feedback && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 ${
                              feedback.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                            }`}
                          >
                            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {feedback.message}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Instruction Overlay */}
                      {practiceItems.length > 0 && (
                        <div className="absolute top-4 right-4 bg-violet-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold animate-pulse">
                          Click a number, then click its zone!
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {practiceSubTab === 'scenarios' && (
                <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 max-w-2xl mx-auto">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-violet-900">Real World Sort</h2>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Scenario {scenarioIndex + 1} of {WORD_SCENARIOS.length}</span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 mb-8">
                    <p className="text-xl font-bold text-slate-800 leading-relaxed">
                      {WORD_SCENARIOS[scenarioIndex].problem}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {WORD_SCENARIOS[scenarioIndex].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleScenarioAnswer(opt)}
                        className="p-4 rounded-xl border-2 border-slate-100 bg-white hover:border-violet-400 hover:bg-violet-50 transition-all font-bold text-slate-700"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-8 p-6 rounded-2xl border-2 ${
                          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {feedback.type === 'success' ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
                          <p className={`text-sm font-medium ${feedback.type === 'success' ? 'text-emerald-800' : 'text-rose-800'}`}>
                            {feedback.message}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              )}

              {practiceSubTab === 'decimals' && (
                <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 max-w-2xl mx-auto">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-violet-900">Decimal Dash</h2>
                    <button 
                      onClick={resetPractice}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>

                  <p className="text-slate-600 mb-8">Order these decimals from <span className="font-bold">LEAST to GREATEST</span>.</p>

                  <div className="flex flex-wrap gap-3 justify-center mb-12">
                    {DECIMAL_CHALLENGE.map((item) => (
                      <button
                        key={item.val}
                        disabled={decimalFeedback?.show}
                        onClick={() => handleDecimalClick(item.val)}
                        className={`px-6 py-3 rounded-xl font-mono font-bold text-lg transition-all border-2 ${
                          decimalUserOrder.includes(item.val)
                            ? 'bg-slate-100 border-slate-200 text-slate-300 scale-95'
                            : 'bg-white border-violet-200 text-violet-700 hover:border-violet-400'
                        }`}
                      >
                        {item.val}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Your Sequence</h3>
                    <div className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 min-h-[100px] flex flex-wrap gap-2 items-center justify-center">
                      {decimalUserOrder.length === 0 ? (
                        <span className="text-slate-400 text-sm italic">Click decimals to order...</span>
                      ) : (
                        decimalUserOrder.map((val, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="bg-violet-600 text-white px-4 py-2 rounded-xl font-mono font-bold shadow-sm">
                              {val}
                            </div>
                            {idx < decimalUserOrder.length - 1 && <ChevronRight size={16} className="text-slate-300" />}
                          </div>
                        ))
                      )}
                    </div>
                    
                    {decimalUserOrder.length === DECIMAL_CHALLENGE.length && !decimalFeedback?.show && (
                      <button
                        onClick={checkDecimalOrder}
                        className="w-full bg-violet-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all"
                      >
                        Check Order
                      </button>
                    )}

                    <AnimatePresence>
                      {decimalFeedback?.show && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-6 rounded-2xl border-2 ${
                            decimalFeedback.correct ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {decimalFeedback.correct ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
                            <span className={`font-bold ${decimalFeedback.correct ? 'text-emerald-800' : 'text-rose-800'}`}>
                              {decimalFeedback.correct ? 'Correct! You mastered decimal place value.' : 'Not quite. Check the place values again!'}
                            </span>
                          </div>
                          {!decimalFeedback.correct && (
                            <button 
                              onClick={() => { setDecimalUserOrder([]); setDecimalFeedback(null); }}
                              className="mt-4 text-sm font-bold text-violet-600 hover:underline"
                            >
                              Try Again
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>
              )}
            </motion.div>
          )}

          {activeTab === 'decimals' && (
            <motion.div
              key="decimals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid md:grid-cols-2 gap-8">
                <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                  <h2 className="text-2xl font-bold mb-6 text-emerald-900 flex items-center gap-2">
                    <Calculator className="text-emerald-600" />
                    Rational Decimals
                  </h2>
                  <div className="space-y-6">
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <h3 className="font-bold text-emerald-800 mb-2">Terminating Decimals</h3>
                      <p className="text-sm text-slate-600">Decimals that end after a finite number of digits.</p>
                      <div className="mt-3 font-mono text-lg text-emerald-700 bg-white p-2 rounded-lg border border-emerald-200 text-center">
                        1/4 = 0.25
                      </div>
                    </div>
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <h3 className="font-bold text-emerald-800 mb-2">Repeating Decimals</h3>
                      <p className="text-sm text-slate-600">Decimals that have a block of digits that repeat indefinitely.</p>
                      <div className="mt-3 font-mono text-lg text-emerald-700 bg-white p-2 rounded-lg border border-emerald-200 text-center">
                        1/3 = 0.333... (0.3̄)
                      </div>
                    </div>

                    {/* Decimal Expansion Infographic */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Decimal Expansion Flow</h4>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 text-center">
                          <div className="text-xs font-bold text-slate-500 mb-1">Fraction</div>
                          <div className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-sm">a/b</div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 mt-4" />
                        <div className="flex-1 text-center">
                          <div className="text-xs font-bold text-slate-500 mb-1">Division</div>
                          <div className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-sm">a ÷ b</div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 mt-4" />
                        <div className="flex-1 text-center">
                          <div className="text-xs font-bold text-slate-500 mb-1">Result</div>
                          <div className="bg-emerald-600 text-white rounded-lg p-2 font-mono text-sm shadow-sm">0.xyz</div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex gap-4">
                        <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 text-[10px]">
                          <span className="font-bold text-emerald-600">Terminating:</span> Remainder becomes 0.
                        </div>
                        <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 text-[10px]">
                          <span className="font-bold text-emerald-600">Repeating:</span> Remainder repeats.
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                  <h2 className="text-2xl font-bold mb-6 text-indigo-900 flex items-center gap-2">
                    <Layers className="text-indigo-600" />
                    Perfect Squares
                  </h2>
                  <p className="text-sm text-slate-600 mb-6">A number that is the result of multiplying an integer by itself.</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144].map(num => (
                      <div key={num} className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                        <div className="text-xs text-indigo-400 font-bold"><Radical>{num}</Radical></div>
                        <div className="text-lg font-bold text-indigo-700">{Math.sqrt(num)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
                    Note: Every positive number has two square roots, one positive and one negative. The symbol <Radical>x</Radical> indicates the principal (positive) square root.
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'estimating' && (
            <motion.div
              key="estimating"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-8"
            >
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-3xl font-bold mb-6 text-amber-900">Estimating Irrational Numbers</h2>
                <div className="grid md:grid-cols-2 gap-12 items-start">
                  <div className="space-y-6">
                    <p className="text-slate-600">To estimate a square root that isn't a perfect square, find the two closest perfect squares it falls between.</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">1</div>
                        <p className="text-sm">Identify the perfect squares above and below your number.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">2</div>
                        <p className="text-sm">Determine which perfect square it is closer to.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">3</div>
                        <p className="text-sm">Estimate the decimal value based on that distance.</p>
                      </div>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
                      <h4 className="font-bold text-amber-800 mb-2">Example: Estimate {formatMath('√30')}</h4>
                      <div className="space-y-2 text-sm text-slate-700">
                        <p>• {formatMath('√25')} = 5 and {formatMath('√36')} = 6</p>
                        <p>• 30 is between 25 and 36</p>
                        <p>• 30 is roughly in the middle, so {formatMath('√30')} ≈ 5.5</p>
                      </div>
                    </div>

                    <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-200">
                      <h4 className="font-bold text-indigo-800 mb-2">Comparing Real Numbers</h4>
                      <p className="text-sm text-slate-600 mb-3">To compare numbers like <span className="font-mono">{formatMath('√3')} + 5</span> and <span className="font-mono">3 + {formatMath('√5')}</span>, approximate the roots first:</p>
                      <div className="space-y-2 text-xs text-slate-700">
                        <p>1. {formatMath('√3')} ≈ 1.73 → 1.73 + 5 = <span className="font-bold text-indigo-600">6.73</span></p>
                        <p>2. {formatMath('√5')} ≈ 2.24 → 3 + 2.24 = <span className="font-bold text-indigo-600">5.24</span></p>
                        <p className="pt-2 font-bold">Result: {formatMath('√3')} + 5 &gt; 3 + {formatMath('√5')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                    <h3 className="font-bold mb-4 text-slate-700">Number Line Visualization</h3>
                    <div className="relative h-24 flex items-end pb-8">
                      <div className="absolute bottom-8 left-0 right-0 h-0.5 bg-slate-300" />
                      {[0, 1, 2, 3, 4, 5, 6, 7].map(val => (
                        <div key={val} className="flex-1 flex flex-col items-center relative">
                          <div className="h-3 w-0.5 bg-slate-400 mb-1" />
                          <span className="text-xs font-bold text-slate-500">{val}</span>
                        </div>
                      ))}
                      {/* √30 marker */}
                      <div className="absolute bottom-8 left-[78.5%] flex flex-col items-center">
                        <motion.div 
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="mb-1"
                        >
                          <div className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{formatMath('√30')}</div>
                          <div className="w-0.5 h-4 bg-amber-600 mx-auto" />
                        </motion.div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-4 uppercase tracking-widest font-bold">Comparing Real Numbers on a Line</p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {!quizStarted ? (
                <div className="bg-white rounded-3xl p-12 shadow-xl border border-slate-200 text-center">
                  <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Real Number Challenge</h2>
                  <p className="text-slate-600 mb-8">Test your mastery with {QUIZ_QUESTIONS.length} questions covering classification, square roots, and estimation.</p>
                  <button
                    onClick={() => setQuizStarted(true)}
                    className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                  >
                    Start Digital Quiz
                  </button>
                </div>
              ) : quizCompleted ? (
                <div className="bg-white rounded-3xl p-12 shadow-xl border border-slate-200 text-center">
                  <div className="text-6xl mb-6">
                    {score >= QUIZ_QUESTIONS.length * 0.9 ? '🏆' : score >= QUIZ_QUESTIONS.length * 0.7 ? '🌟' : '📚'}
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
                  <p className="text-slate-500 mb-6">You scored</p>
                  <div className="text-6xl font-black text-rose-600 mb-8">
                    {score} <span className="text-2xl text-slate-300">/ {QUIZ_QUESTIONS.length}</span>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={resetQuiz}
                      className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                      <RotateCcw size={18} />
                      Try Again
                    </button>
                    <button
                      onClick={() => setActiveTab('printable')}
                      className="flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all"
                    >
                      <Printer size={18} />
                      Print Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                  {/* Progress Bar */}
                  <div className="h-2 bg-slate-100">
                    <motion.div 
                      className="h-full bg-rose-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</span>
                      <span className="text-xs font-bold bg-rose-50 text-rose-600 px-3 py-1 rounded-full">Score: {score}</span>
                    </div>

                    <AnimatePresence>
                      {selectedAnswer && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mb-6 p-3 rounded-xl text-center font-bold flex items-center justify-center gap-2 ${
                            selectedAnswer === QUIZ_QUESTIONS[currentQuestionIndex].correctAnswer
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {selectedAnswer === QUIZ_QUESTIONS[currentQuestionIndex].correctAnswer ? (
                            <><CheckCircle2 size={18} /> Correct!</>
                          ) : (
                            <><AlertCircle size={18} /> Incorrect</>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <h3 className="text-xl font-bold mb-8 leading-tight">
                      {formatMath(QUIZ_QUESTIONS[currentQuestionIndex].text)}
                    </h3>

                    <QuizVisual question={QUIZ_QUESTIONS[currentQuestionIndex]} />

                    <div className="space-y-3">
                      {QUIZ_QUESTIONS[currentQuestionIndex].options.map((option, idx) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === QUIZ_QUESTIONS[currentQuestionIndex].correctAnswer;
                        const showResult = selectedAnswer !== null;

                        return (
                          <button
                            key={idx}
                            disabled={showResult}
                            onClick={() => handleAnswerSelect(option)}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ${
                              showResult
                                ? isCorrect
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                                  : isSelected
                                    ? 'bg-rose-50 border-rose-500 text-rose-900'
                                    : 'bg-white border-slate-100 opacity-50'
                                : 'bg-white border-slate-100 hover:border-rose-200 hover:bg-rose-50/30'
                            }`}
                          >
                            <span className="font-semibold">{formatMath(option)}</span>
                            {showResult && isCorrect && <CheckCircle2 size={20} className="text-emerald-500" />}
                            {showResult && isSelected && !isCorrect && <AlertCircle size={20} className="text-rose-500" />}
                          </button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {showExplanation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200"
                        >
                          <div className="flex items-start gap-3">
                            <Info size={18} className="text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Explanation</p>
                              <p className="text-sm text-slate-600">{formatMath(QUIZ_QUESTIONS[currentQuestionIndex].explanation)}</p>
                            </div>
                          </div>
                          <button
                            onClick={nextQuestion}
                            className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
                          >
                            {currentQuestionIndex === QUIZ_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question'}
                            <ChevronRight size={18} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'printable' && (
            <motion.div
              key="printable"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl shadow-lg">
                <div>
                  <h2 className="text-xl font-bold">Printable Worksheet</h2>
                  <p className="text-slate-400 text-sm">{QUIZ_QUESTIONS.length}-Question Quiz with Answer Key</p>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-all"
                >
                  <Download size={18} />
                  Download PDF
                </button>
              </div>

              <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0" id="printable-quiz">
                <div className="text-center mb-12 border-b-2 border-slate-100 pb-8">
                  <h1 className="text-3xl font-bold mb-2">Real Number Mastery Quiz</h1>
                  <div className="flex justify-center gap-8 text-slate-500 text-sm mt-4">
                    <span>Name: __________________________</span>
                    <span>Date: __________________________</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {QUIZ_QUESTIONS.map((q, i) => (
                    <div key={q.id} className="break-inside-avoid">
                      <p className="font-bold mb-3">{i + 1}. {formatMath(q.text)}</p>
                      <div className="ml-4 mb-4">
                        <QuizVisual question={q} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 ml-4">
                        {q.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 border border-slate-400 rounded-full" />
                            <span>{formatMath(opt)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Answer Key Section (Visible only on print or specific toggle) */}
                <div className="mt-20 pt-12 border-t-2 border-dashed border-slate-200 break-before-page">
                  <h2 className="text-xl font-bold mb-6 text-slate-400 uppercase tracking-widest">Answer Key</h2>
                  <div className="grid grid-cols-4 gap-4">
                    {QUIZ_QUESTIONS.map((q, i) => (
                      <div key={q.id} className="text-sm">
                        <span className="font-bold text-slate-400 mr-2">{i + 1}.</span>
                        <span className="font-semibold">{formatMath(q.correctAnswer)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-12 text-center text-slate-400 text-sm border-t border-slate-200 mt-12">
        <p>© 2026 Real Number Master • Educational Tool for Students</p>
      </footer>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          header, nav, footer, button, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          main {
            padding: 0 !important;
            max-width: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
