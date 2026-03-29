/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  TrendingUp, 
  BookOpen, 
  CheckCircle2, 
  Info, 
  ArrowRight,
  DollarSign,
  Clock,
  Percent,
  BarChart3,
  GraduationCap,
  Printer,
  RotateCcw,
  Globe,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type Tab = 'learn' | 'compare' | 'scenarios' | 'practice' | 'quiz' | 'applications' | 'faq';

interface QuizQuestion {
  id: number;
  type: 'simple_i' | 'simple_p' | 'simple_r' | 'simple_t' | 'compound_a' | 'compare';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Scenario {
  id: number;
  title: string;
  description: string;
  principal: number;
  rate: number;
  time: number;
  category: 'Savings' | 'Loan' | 'Investment';
}

// --- Constants & Data ---
const REAL_WORLD_SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Marlena's Small Start",
    description: "Marlena saved $50 in an account earning 3.5% interest. She wants to see how it grows over 10 years.",
    principal: 50,
    rate: 3.5,
    time: 10,
    category: 'Savings'
  },
  {
    id: 2,
    title: "Jim's Business Expansion",
    description: "Jim is putting $15,000 into a savings account for 5 years. He's comparing 4.5% simple interest vs 3.45% compound interest.",
    principal: 15000,
    rate: 4.5,
    time: 5,
    category: 'Investment'
  },
  {
    id: 3,
    title: "Jakobie's Long Term Goal",
    description: "Jakobie saved $7,800 at 7.5% interest. He wants to know the difference after 20 years if it's compounded vs simple.",
    principal: 7800,
    rate: 7.5,
    time: 20,
    category: 'Savings'
  },
  {
    id: 4,
    title: "Dwight's Big Loan",
    description: "Dwight is taking out a $25,000 loan. He's looking at a 6-year simple interest loan at 3.5%.",
    principal: 25000,
    rate: 3.5,
    time: 6,
    category: 'Loan'
  },
  {
    id: 5,
    title: "Ivette's Car Loan",
    description: "Ivette needs a $2,500 loan for a car. She's comparing a 2.67% rate over roughly 4 years (50 months).",
    principal: 2500,
    rate: 2.67,
    time: 4.16,
    category: 'Loan'
  },
  {
    id: 6,
    title: "Lester's Investment Choice",
    description: "Lester is choosing between $400 at 4.5% simple interest or $450 at 3.2% compound interest for 3 years.",
    principal: 400, // We'll use 400 as base for the comparison chart
    rate: 4.5,
    time: 3,
    category: 'Investment'
  },
  {
    id: 7,
    title: "Hei's Retirement Plan",
    description: "Hei starts with $1,500 and earns 5% compounded annually. She wants to see her balance after 5 years.",
    principal: 1500,
    rate: 5,
    time: 5,
    category: 'Savings'
  }
];

const FAQs = [
  {
    question: "What is the main difference between simple and compound interest?",
    answer: "Simple interest is calculated only on the original amount of money (the principal). Compound interest is calculated on the principal plus any interest that has already been added. This means compound interest grows faster over time because you earn 'interest on interest'."
  },
  {
    question: "When is simple interest typically used?",
    answer: "Simple interest is common for short-term personal loans, some auto loans, and specific types of investments like Certificates of Deposit (CDs) where the interest is paid out rather than reinvested."
  },
  {
    question: "When is compound interest typically used?",
    answer: "Compound interest is the standard for most long-term financial products, including savings accounts, retirement funds (like 401ks), and credit card debt. It's designed to reward long-term saving and is a major factor in building wealth."
  },
  {
    question: "Why do credit cards use compound interest?",
    answer: "Credit card companies use compounding (often daily) to maximize the interest they earn on unpaid balances. This is why credit card debt can grow so quickly if you only make minimum payments."
  },
  {
    question: "Is compound interest always better?",
    answer: "It depends on whether you are the borrower or the saver! As a saver or investor, compound interest is much better because your money grows exponentially. As a borrower, simple interest is usually better because the total amount you owe grows more slowly."
  },
  {
    question: "What does 'compounding frequency' mean?",
    answer: "This refers to how often the interest is calculated and added back to the principal. It could be yearly, monthly, weekly, or even daily. The more frequently interest compounds, the faster the balance grows."
  }
];

// --- Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const simple = payload.find((p: any) => p.dataKey === 'simple')?.value || 0;
    const compound = payload.find((p: any) => p.dataKey === 'compound')?.value || 0;
    const diff = Math.round((compound - simple) * 100) / 100;

    return (
      <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100 min-w-[160px]">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Year {label}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-medium text-slate-600">Simple</span>
            </div>
            <span className="text-xs font-bold text-slate-900">${simple.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-600">Compound</span>
            </div>
            <span className="text-xs font-bold text-slate-900">${compound.toLocaleString()}</span>
          </div>
          {diff > 0 && (
            <div className="pt-1.5 mt-1.5 border-t border-slate-50 flex justify-between items-center gap-4">
              <span className="text-[10px] font-bold text-amber-500 uppercase">Difference</span>
              <span className="text-[10px] font-bold text-amber-600">+${diff.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const Card = ({ children, className }: { children: React.ReactNode; className?: string; key?: React.Key }) => (
  <div className={cn("bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden", className)}>
    {children}
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label, color }: { active: boolean; onClick: () => void; icon: any; label: string; color: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 font-medium",
      active 
        ? `${color} text-white shadow-lg scale-105` 
        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
    )}
  >
    <Icon size={18} />
    {label}
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState<Set<number>>(new Set());
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizMode, setQuizMode] = useState<'digital' | 'printable'>('digital');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const generateQuiz = () => {
    const questions: QuizQuestion[] = [];
    const types: QuizQuestion['type'][] = ['simple_i', 'simple_p', 'simple_r', 'simple_t', 'compound_a', 'compare'];
    
    for (let i = 0; i < 10; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const p = Math.floor(Math.random() * 90 + 10) * 100; // 1000 to 10000
      const r_percent = Math.floor(Math.random() * 10 + 2); // 2% to 12%
      const r = r_percent / 100;
      const t = Math.floor(Math.random() * 10 + 1); // 1 to 10 years
      
      let question = "";
      let correctAnswer = "";
      let options: string[] = [];
      let explanation = "";

      switch (type) {
        case 'simple_i':
          const i_val = p * r * t;
          question = `Calculate the simple interest earned on a principal of $${p.toLocaleString()} at an annual rate of ${r_percent}% for ${t} years.`;
          correctAnswer = `$${i_val.toLocaleString()}`;
          explanation = `Use I = Prt: $${p} × ${r} × ${t} = $${i_val}`;
          options = [correctAnswer, `$${(i_val * 1.1).toFixed(0)}`, `$${(i_val * 0.9).toFixed(0)}`, `$${(i_val + 100).toFixed(0)}`];
          break;
        case 'simple_p':
          const i_p = p * r * t;
          question = `An account earned $${i_p.toLocaleString()} in simple interest over ${t} years at a rate of ${r_percent}%. What was the original principal?`;
          correctAnswer = `$${p.toLocaleString()}`;
          explanation = `Use P = I / (rt): $${i_p} / (${r} × ${t}) = $${p}`;
          options = [correctAnswer, `$${(p * 1.2).toFixed(0)}`, `$${(p * 0.8).toFixed(0)}`, `$${(p + 500).toFixed(0)}`];
          break;
        case 'simple_r':
          const i_r = p * r * t;
          question = `A principal of $${p.toLocaleString()} earned $${i_r.toLocaleString()} in simple interest over ${t} years. What was the annual interest rate?`;
          correctAnswer = `${r_percent}%`;
          explanation = `Use r = I / (Pt): $${i_r} / ($${p} × ${t}) = ${r} (${r_percent}%)`;
          options = [correctAnswer, `${r_percent + 2}%`, `${r_percent - 1}%`, `${(r_percent * 1.5).toFixed(1)}%`];
          break;
        case 'simple_t':
          const i_t = p * r * t;
          question = `How many years would it take for a principal of $${p.toLocaleString()} to earn $${i_t.toLocaleString()} in simple interest at a rate of ${r_percent}%?`;
          correctAnswer = `${t} years`;
          explanation = `Use t = I / (Pr): $${i_t} / ($${p} × ${r}) = ${t}`;
          options = [correctAnswer, `${t + 2} years`, `${t + 5} years`, `${Math.max(1, t - 1)} years`];
          break;
        case 'compound_a':
          const a_comp = p * Math.pow(1 + r, t);
          question = `Calculate the total balance (A) for $${p.toLocaleString()} compounded annually at ${r_percent}% for ${t} years. (Round to nearest dollar)`;
          correctAnswer = `$${Math.round(a_comp).toLocaleString()}`;
          explanation = `Use A = P(1+r)^t: $${p}(1+${r})^${t} = $${Math.round(a_comp)}`;
          options = [correctAnswer, `$${Math.round(a_comp * 1.05).toLocaleString()}`, `$${Math.round(a_comp * 0.95).toLocaleString()}`, `$${Math.round(p + (p * r * t)).toLocaleString()}`];
          break;
        case 'compare':
          const simple_total = p + (p * r * t);
          const compound_total = p * Math.pow(1 + r, t);
          const diff = compound_total - simple_total;
          question = `For a principal of $${p.toLocaleString()} at ${r_percent}% for ${t} years, how much MORE interest does compound interest earn compared to simple interest? (Round to nearest dollar)`;
          correctAnswer = `$${Math.round(diff).toLocaleString()}`;
          explanation = `Compound: $${Math.round(compound_total)}, Simple: $${Math.round(simple_total)}. Difference: $${Math.round(diff)}`;
          options = [correctAnswer, `$${Math.round(diff * 1.5).toLocaleString()}`, `$${Math.round(diff + 50).toLocaleString()}`, `$0`];
          break;
      }

      // Shuffle options
      options = options.sort(() => Math.random() - 0.5);

      questions.push({
        id: i,
        type,
        question,
        options,
        correctAnswer,
        explanation
      });
    }
    setQuizQuestions(questions);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  useEffect(() => {
    if (activeTab === 'quiz' && quizQuestions.length === 0) {
      generateQuiz();
    }
  }, [activeTab]);
  const [calcData, setCalcData] = useState({
    principal: 1000,
    rate: 5,
    time: 10
  });

  // --- Calculation Logic ---
  const getComparisonData = (p: number, r_val: number, t_val: number) => {
    const data = [];
    const r = r_val / 100;
    const steps = Math.ceil(t_val);

    for (let t = 0; t <= steps; t++) {
      const actualT = t > t_val ? t_val : t;
      const simpleInterest = p * r * actualT;
      const simpleTotal = p + simpleInterest;
      
      const compoundTotal = p * Math.pow(1 + r, actualT);
      const compoundInterest = compoundTotal - p;

      data.push({
        year: actualT,
        simple: Number(simpleTotal.toFixed(2)),
        compound: Number(compoundTotal.toFixed(2)),
        difference: Number((compoundTotal - simpleTotal).toFixed(2))
      });
      if (t >= t_val) break;
    }
    return data;
  };

  const comparisonData = useMemo(() => 
    getComparisonData(calcData.principal, calcData.rate, calcData.time), 
  [calcData]);

  const scenarioComparisonData = useMemo(() => 
    selectedScenario ? getComparisonData(selectedScenario.principal, selectedScenario.rate, selectedScenario.time) : [],
  [selectedScenario]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-emerald-100 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-64 h-64 bg-amber-100 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="text-center mb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold mb-1.5 border border-indigo-100 uppercase tracking-wider"
          >
            <TrendingUp size={12} />
            Financial Literacy
          </motion.div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1">
            Interest <span className="text-indigo-600">Master</span>
          </h1>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-tight">
            Explore simple and compound interest through real-world scenarios.
          </p>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap justify-center gap-3 mb-6">
          <TabButton 
            active={activeTab === 'learn'} 
            onClick={() => setActiveTab('learn')} 
            icon={BookOpen} 
            label="Learn" 
            color="bg-indigo-600"
          />
          <TabButton 
            active={activeTab === 'scenarios'} 
            onClick={() => setActiveTab('scenarios')} 
            icon={ArrowRight} 
            label="Scenarios" 
            color="bg-violet-600"
          />
          <TabButton 
            active={activeTab === 'applications'} 
            onClick={() => setActiveTab('applications')} 
            icon={Globe} 
            label="Real World" 
            color="bg-cyan-600"
          />
          <TabButton 
            active={activeTab === 'faq'} 
            onClick={() => setActiveTab('faq')} 
            icon={HelpCircle} 
            label="FAQ" 
            color="bg-slate-700"
          />
          <TabButton 
            active={activeTab === 'compare'} 
            onClick={() => setActiveTab('compare')} 
            icon={BarChart3} 
            label="Simulator" 
            color="bg-emerald-600"
          />
          <TabButton 
            active={activeTab === 'practice'} 
            onClick={() => setActiveTab('practice')} 
            icon={Calculator} 
            label="Practice" 
            color="bg-amber-500"
          />
          <TabButton 
            active={activeTab === 'quiz'} 
            onClick={() => setActiveTab('quiz')} 
            icon={GraduationCap} 
            label="Quiz Me" 
            color="bg-rose-500"
          />
        </nav>

        {/* Progress Tracker */}
        <div className="max-w-2xl mx-auto mb-6 no-print">
          <div className="flex justify-between items-end mb-1">
            <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Your Progress</h3>
            <span className="text-[10px] font-bold text-indigo-600">
              {Math.round(((completedScenarios.size + completedChallenges.size) / (REAL_WORLD_SCENARIOS.length + 3)) * 100)}%
            </span>
          </div>
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((completedScenarios.size + completedChallenges.size) / (REAL_WORLD_SCENARIOS.length + 3)) * 100}%` }}
              className="h-full bg-indigo-600"
            />
          </div>
          <div className="flex gap-3 mt-1 text-[8px] font-bold text-slate-400 uppercase tracking-tight">
            <span>Scenarios: {completedScenarios.size}/{REAL_WORLD_SCENARIOS.length}</span>
            <span>Challenges: {completedChallenges.size}/3</span>
          </div>
        </div>

        {/* Content Area */}
        <main>
          <AnimatePresence mode="wait">
            {activeTab === 'learn' && (
              <motion.div
                key="learn"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid md:grid-cols-2 gap-4"
              >
                {/* Simple Interest Section */}
                <Card className="p-6 border-t-4 border-t-indigo-500">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Info size={20} />
                    </div>
                    <h2 className="text-xl font-bold">Simple Interest</h2>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    Interest earned only on the <span className="font-semibold text-slate-900">principal</span>. It doesn't grow on top of itself.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">The Formula</p>
                    <p className="text-2xl font-bold text-indigo-600">I = Prt</p>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600">
                      <p><span className="font-semibold">I:</span> Interest</p>
                      <p><span className="font-semibold">P:</span> Principal</p>
                      <p><span className="font-semibold">r:</span> Rate (dec)</p>
                      <p><span className="font-semibold">t:</span> Time (yrs)</p>
                    </div>
                  </div>
                  <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                    <h3 className="text-xs font-semibold text-indigo-900 mb-1 flex items-center gap-1">
                      <ArrowRight size={12} /> Example
                    </h3>
                    <p className="text-[11px] text-indigo-800">
                      $1,000 at 4% simple interest earns exactly $40 every year. After 10 years, you have $400 in interest.
                    </p>
                  </div>
                </Card>

                {/* Compound Interest Section */}
                <Card className="p-6 border-t-4 border-t-emerald-500">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <TrendingUp size={20} />
                    </div>
                    <h2 className="text-xl font-bold">Compound Interest</h2>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    Interest earned on both the principal <span className="font-semibold text-slate-900">and</span> interest already earned.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">The Formula</p>
                    <p className="text-2xl font-bold text-emerald-600">A = P(1 + r)<sup>t</sup></p>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600">
                      <p><span className="font-semibold">A:</span> Total Balance</p>
                      <p><span className="font-semibold">P:</span> Principal</p>
                      <p><span className="font-semibold">r:</span> Rate (dec)</p>
                      <p><span className="font-semibold">t:</span> Time (yrs)</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                    <h3 className="text-xs font-semibold text-emerald-900 mb-1 flex items-center gap-1">
                      <ArrowRight size={12} /> Example
                    </h3>
                    <p className="text-[11px] text-emerald-800">
                      $1,000 at 4% compounded annually earns $40 in Year 1, but $41.60 in Year 2. It grows faster!
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'faq' && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
                  <p className="text-slate-500">Everything you need to know about interest calculations and real-world banking.</p>
                </div>

                <div className="space-y-4">
                  {FAQs.map((faq, idx) => (
                    <Card key={idx} className="overflow-hidden">
                      <button 
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-all"
                      >
                        <span className="font-bold text-slate-800">{faq.question}</span>
                        <div className={cn(
                          "p-1 rounded-full transition-all",
                          openFaq === idx ? "bg-slate-900 text-white rotate-180" : "bg-slate-100 text-slate-500"
                        )}>
                          {openFaq === idx ? <Minus size={16} /> : <Plus size={16} />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {openFaq === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-indigo-600 rounded-3xl text-white text-center">
                  <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                  <p className="text-indigo-100 mb-6">Explore the 'Learn' and 'Real World' tabs to see more examples and detailed explanations.</p>
                  <button 
                    onClick={() => setActiveTab('learn')}
                    className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all"
                  >
                    Back to Basics
                  </button>
                </div>
              </motion.div>
            )}
            {activeTab === 'applications' && (
              <motion.div
                key="applications"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Simple Interest Applications */}
                  <Card className="p-6 border-l-4 border-l-cyan-500">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <DollarSign className="text-cyan-600" />
                      Where Simple Interest is Used
                    </h2>
                    <div className="space-y-4">
                      <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                        <h3 className="font-bold text-cyan-900 text-sm">Short-Term Personal Loans</h3>
                        <p className="text-xs text-cyan-800 mt-1 leading-relaxed">Often used for small loans between friends or family members where the math needs to be easy to track and understand.</p>
                      </div>
                      <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                        <h3 className="font-bold text-cyan-900 text-sm">Auto Loans (Some)</h3>
                        <p className="text-xs text-cyan-800 mt-1 leading-relaxed">Many car loans use simple interest. You pay interest on the principal balance, and paying early can save you money on interest.</p>
                      </div>
                      <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                        <h3 className="font-bold text-cyan-900 text-sm">Certificates of Deposit (CDs)</h3>
                        <p className="text-xs text-cyan-800 mt-1 leading-relaxed">Some bank CDs pay out simple interest monthly or annually directly to your checking account rather than reinvesting it.</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-slate-900 text-sm">Key Takeaway</h3>
                        <p className="text-xs text-slate-600 mt-1 italic">Simple interest is predictable. It's great for borrowers because the debt doesn't "snowball" out of control.</p>
                      </div>
                    </div>
                  </Card>

                  {/* Compound Interest Applications */}
                  <Card className="p-6 border-l-4 border-l-indigo-500">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="text-indigo-600" />
                      Where Compound Interest is Used
                    </h2>
                    <div className="space-y-4">
                      <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <h3 className="font-bold text-indigo-900 text-sm">Savings & Money Market Accounts</h3>
                        <p className="text-xs text-indigo-800 mt-1 leading-relaxed">Banks use compounding to reward you for keeping money in your account. Your interest earns interest, building wealth over time.</p>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <h3 className="font-bold text-indigo-900 text-sm">Credit Cards</h3>
                        <p className="text-xs text-indigo-800 mt-1 leading-relaxed">Credit cards compound daily. If you don't pay your full balance, you pay interest on your interest, which can lead to high debt.</p>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <h3 className="font-bold text-indigo-900 text-sm">Investment Accounts (401k/IRA)</h3>
                        <p className="text-xs text-indigo-800 mt-1 leading-relaxed">The "Magic of Compounding" is what allows small monthly investments to grow into large sums over 30-40 years.</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-slate-900 text-sm">Key Takeaway</h3>
                        <p className="text-xs text-slate-600 mt-1 italic">Compound interest creates exponential growth. It's your best friend for saving, but your worst enemy for debt.</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Comparison Table */}
                <Card className="p-6 bg-slate-900 text-white">
                  <h2 className="text-lg font-bold mb-4 text-center">Quick Reference: Banking & Finance</h2>
                  <div className="overflow-x-auto">
                    <div className="min-w-[500px] grid grid-cols-3 gap-4 text-center">
                      <div className="p-2 border-b border-slate-700 font-bold text-[10px] uppercase tracking-wider text-slate-400">Financial Product</div>
                      <div className="p-2 border-b border-slate-700 font-bold text-[10px] uppercase tracking-wider text-slate-400">Interest Type</div>
                      <div className="p-2 border-b border-slate-700 font-bold text-[10px] uppercase tracking-wider text-slate-400">Real-World Impact</div>
                      
                      <div className="p-3 text-sm font-medium border-b border-slate-800">Credit Cards</div>
                      <div className="p-3 text-sm border-b border-slate-800 text-rose-400 font-bold">Compound</div>
                      <div className="p-3 text-[11px] border-b border-slate-800 text-slate-300">Debt grows very fast if not paid monthly.</div>

                      <div className="p-3 text-sm font-medium border-b border-slate-800">Savings Accounts</div>
                      <div className="p-3 text-sm border-b border-slate-800 text-emerald-400 font-bold">Compound</div>
                      <div className="p-3 text-[11px] border-b border-slate-800 text-slate-300">Your balance grows faster the longer you save.</div>

                      <div className="p-3 text-sm font-medium border-b border-slate-800">Student Loans</div>
                      <div className="p-3 text-sm border-b border-slate-800 text-rose-400 font-bold">Compound</div>
                      <div className="p-3 text-[11px] border-b border-slate-800 text-slate-300">Unpaid interest is added to your principal.</div>

                      <div className="p-3 text-sm font-medium">Personal Loans</div>
                      <div className="p-3 text-sm text-cyan-400 font-bold">Simple</div>
                      <div className="p-3 text-[11px] text-slate-300">Interest is only charged on the original amount.</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'scenarios' && (
              <motion.div
                key="scenarios"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-12 gap-8"
              >
                {/* Scenario List */}
                <div className="lg:col-span-3 space-y-3">
                  <h2 className="text-lg font-bold mb-2 px-2">Scenarios</h2>
                  <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {REAL_WORLD_SCENARIOS.map((scenario) => (
                      <button
                        key={scenario.id}
                        onClick={() => setSelectedScenario(scenario)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl transition-all border",
                          selectedScenario?.id === scenario.id
                            ? "bg-violet-600 text-white border-violet-600 shadow-md scale-[1.01]"
                            : "bg-white text-slate-700 border-slate-100 hover:border-violet-200 hover:bg-violet-50"
                        )}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                            selectedScenario?.id === scenario.id ? "bg-violet-500 text-white" : "bg-slate-100 text-slate-500"
                          )}>
                            {scenario.category}
                          </span>
                          <span className="text-[10px] opacity-70">{scenario.time}y</span>
                        </div>
                        <h3 className="font-bold text-base leading-tight">{scenario.title}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <p className={cn(
                            "text-xs line-clamp-1 flex-1",
                            selectedScenario?.id === scenario.id ? "text-violet-100" : "text-slate-500"
                          )}>
                            {scenario.description}
                          </p>
                          {completedScenarios.has(scenario.id) && (
                            <CheckCircle2 size={12} className={selectedScenario?.id === scenario.id ? "text-white" : "text-emerald-500"} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scenario Details */}
                <div className="lg:col-span-9">
                  {selectedScenario ? (
                    <div className="space-y-4">
                      <Card className="p-5 border-t-4 border-t-violet-500">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                          <div className="flex-1 min-w-[240px]">
                            <div className="flex items-center gap-3 mb-1">
                              <h2 className="text-xl font-bold">{selectedScenario.title}</h2>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {REAL_WORLD_SCENARIOS.findIndex(s => s.id === selectedScenario.id) + 1} / {REAL_WORLD_SCENARIOS.length}
                              </span>
                            </div>
                            <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{selectedScenario.description}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 text-center min-w-[70px]">
                              <p className="text-[9px] text-slate-400 uppercase font-bold">Principal</p>
                              <p className="text-sm font-bold text-slate-900">${selectedScenario.principal.toLocaleString()}</p>
                            </div>
                            <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 text-center min-w-[60px]">
                              <p className="text-[9px] text-slate-400 uppercase font-bold">Rate</p>
                              <p className="text-sm font-bold text-slate-900">{selectedScenario.rate}%</p>
                            </div>
                            <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 text-center min-w-[60px]">
                              <p className="text-[9px] text-slate-400 uppercase font-bold">Time</p>
                              <p className="text-sm font-bold text-slate-900">{selectedScenario.time}y</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid xl:grid-cols-5 gap-6">
                          <div className="xl:col-span-3">
                            <div className="h-[240px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={scenarioComparisonData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                  <XAxis dataKey="year" stroke="#64748B" fontSize={10} />
                                  <YAxis stroke="#64748B" tickFormatter={(v) => `$${v}`} fontSize={10} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                  <Line 
                                    type="monotone" 
                                    dataKey="simple" 
                                    stroke="#6366f1" 
                                    strokeWidth={2} 
                                    dot={false} 
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="compound" 
                                    stroke="#10b981" 
                                    strokeWidth={2} 
                                    dot={false} 
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="xl:col-span-2 space-y-3">
                            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="font-bold text-indigo-900 text-xs">Simple Interest</h4>
                                <span className="text-sm font-bold text-indigo-600">
                                  ${scenarioComparisonData[scenarioComparisonData.length - 1].simple.toLocaleString()}
                                </span>
                              </div>
                              <div className="mt-2 pt-2 border-t border-indigo-200/30">
                                <p className="text-[9px] font-bold text-indigo-400 uppercase mb-1">Calculation</p>
                                <div className="font-mono text-[10px] text-indigo-700 leading-tight">
                                  <p>I = {selectedScenario.principal} × {selectedScenario.rate/100} × {selectedScenario.time} = ${(selectedScenario.principal * (selectedScenario.rate/100) * selectedScenario.time).toLocaleString()}</p>
                                  <p className="font-bold mt-0.5">A = P + I = ${scenarioComparisonData[scenarioComparisonData.length - 1].simple.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="font-bold text-emerald-900 text-xs">Compound Interest</h4>
                                <span className="text-sm font-bold text-emerald-600">
                                  ${scenarioComparisonData[scenarioComparisonData.length - 1].compound.toLocaleString()}
                                </span>
                              </div>
                              <div className="mt-2 pt-2 border-t border-emerald-200/30">
                                <p className="text-[9px] font-bold text-emerald-400 uppercase mb-1">Calculation</p>
                                <div className="font-mono text-[10px] text-emerald-700 leading-tight">
                                  <p>A = {selectedScenario.principal} × (1 + {selectedScenario.rate/100})^{selectedScenario.time}</p>
                                  <p className="font-bold mt-0.5">A = ${scenarioComparisonData[scenarioComparisonData.length - 1].compound.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              <button
                                onClick={() => {
                                  setCompletedScenarios(prev => {
                                    const next = new Set(prev);
                                    if (next.has(selectedScenario.id)) next.delete(selectedScenario.id);
                                    else next.add(selectedScenario.id);
                                    return next;
                                  });
                                }}
                                className={cn(
                                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                                  completedScenarios.has(selectedScenario.id)
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                                )}
                              >
                                <CheckCircle2 size={12} />
                                {completedScenarios.has(selectedScenario.id) ? "Completed" : "Mark Done"}
                              </button>
                              
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => {
                                    const currentIndex = REAL_WORLD_SCENARIOS.findIndex(s => s.id === selectedScenario.id);
                                    const prevIndex = (currentIndex - 1 + REAL_WORLD_SCENARIOS.length) % REAL_WORLD_SCENARIOS.length;
                                    setSelectedScenario(REAL_WORLD_SCENARIOS[prevIndex]);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-all shadow-sm"
                                >
                                  Prev
                                </button>
                                <button
                                  onClick={() => {
                                    const currentIndex = REAL_WORLD_SCENARIOS.findIndex(s => s.id === selectedScenario.id);
                                    const nextIndex = (currentIndex + 1) % REAL_WORLD_SCENARIOS.length;
                                    setSelectedScenario(REAL_WORLD_SCENARIOS[nextIndex]);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-all shadow-md"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-2xl">
                      <ArrowRight size={32} className="mb-3 opacity-20" />
                      <p className="text-lg font-medium text-center">Select a scenario to start exploring</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'compare' && (
              <motion.div
                key="compare"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="grid lg:grid-cols-3 gap-4">
                  {/* Controls */}
                  <Card className="p-6 lg:col-span-1">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Calculator size={18} className="text-indigo-600" />
                      Controls
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                          <DollarSign size={12} /> Principal ($)
                        </label>
                        <input 
                          type="range" min="100" max="10000" step="100"
                          value={calcData.principal}
                          onChange={(e) => setCalcData({...calcData, principal: Number(e.target.value)})}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="mt-1 text-lg font-bold text-indigo-600">${calcData.principal.toLocaleString()}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                          <Percent size={12} /> Rate (%)
                        </label>
                        <input 
                          type="range" min="1" max="20" step="0.5"
                          value={calcData.rate}
                          onChange={(e) => setCalcData({...calcData, rate: Number(e.target.value)})}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <div className="mt-1 text-lg font-bold text-emerald-600">{calcData.rate}%</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                          <Clock size={12} /> Time (Years)
                        </label>
                        <input 
                          type="range" min="1" max="50" step="1"
                          value={calcData.time}
                          onChange={(e) => setCalcData({...calcData, time: Number(e.target.value)})}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="mt-1 text-lg font-bold text-amber-500">{calcData.time}y</div>
                      </div>
                    </div>
                  </Card>

                  {/* Graph */}
                  <Card className="p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-bold">Growth</h2>
                      <div className="flex gap-3 text-[10px] font-bold uppercase">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                          <span>Simple</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Compound</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={comparisonData}>
                          <defs>
                            <linearGradient id="colorSimple" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorCompound" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis 
                            dataKey="year" 
                            stroke="#64748B"
                            fontSize={10}
                          />
                          <YAxis 
                            stroke="#64748B"
                            tickFormatter={(value) => `$${value}`}
                            fontSize={10}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area 
                            type="monotone" 
                            dataKey="simple" 
                            stroke="#6366f1" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorSimple)" 
                            activeDot={{ r: 4, strokeWidth: 0 }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="compound" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorCompound)" 
                            activeDot={{ r: 4, strokeWidth: 0 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                {/* Summary Stats */}
                <div className="grid md:grid-cols-3 gap-3">
                  <Card className="p-3 bg-indigo-50/30 border-indigo-100">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Simple Total</p>
                      <p className="text-lg font-bold text-indigo-900">
                        ${comparisonData[comparisonData.length - 1].simple.toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-indigo-100/50">
                      <p className="text-[9px] font-bold text-indigo-400 uppercase mb-1">Calculation</p>
                      <div className="font-mono text-[10px] text-indigo-700 leading-tight">
                        <p>I = {calcData.principal} × {calcData.rate/100} × {calcData.time} = ${(calcData.principal * (calcData.rate/100) * calcData.time).toLocaleString()}</p>
                        <p className="font-bold mt-0.5">A = P + I = ${comparisonData[comparisonData.length - 1].simple.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3 bg-emerald-50/30 border-emerald-100">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Compound Total</p>
                      <p className="text-lg font-bold text-emerald-900">
                        ${comparisonData[comparisonData.length - 1].compound.toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-emerald-100/50">
                      <p className="text-[9px] font-bold text-emerald-400 uppercase mb-1">Calculation</p>
                      <div className="font-mono text-[10px] text-emerald-700 leading-tight">
                        <p>A = {calcData.principal} × (1 + {calcData.rate/100})^{calcData.time}</p>
                        <p className="font-bold mt-0.5">A = ${comparisonData[comparisonData.length - 1].compound.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3 bg-amber-50/30 border-amber-100">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Difference</p>
                      <p className="text-lg font-bold text-amber-900">
                        +${comparisonData[comparisonData.length - 1].difference.toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-amber-100/50">
                      <p className="text-[9px] font-bold text-amber-400 uppercase mb-1">Bonus Growth</p>
                      <p className="text-[10px] text-amber-700 leading-tight italic">
                        Compound interest earned an extra <span className="font-bold">${comparisonData[comparisonData.length - 1].difference.toLocaleString()}</span>.
                      </p>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'practice' && (
              <motion.div
                key="practice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Practice</h2>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((idx) => (
                          <div 
                            key={idx}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              currentChallenge === idx ? "ring-2 ring-offset-1 ring-amber-400" : "",
                              completedChallenges.has(idx) ? "bg-emerald-500" : "bg-slate-200"
                            )}
                          />
                        ))}
                      </div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase">Challenge {currentChallenge + 1}/3</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <AnimatePresence mode="wait">
                      {currentChallenge === 0 && (
                        <motion.div 
                          key="c1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={cn(
                            "p-5 rounded-xl transition-all border",
                            completedChallenges.has(0) ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
                          )}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-base font-bold flex items-center gap-2">
                              <span className={cn(
                                "w-7 h-7 rounded-full text-white flex items-center justify-center text-xs transition-colors",
                                completedChallenges.has(0) ? "bg-emerald-500" : "bg-indigo-600"
                              )}>
                                {completedChallenges.has(0) ? <CheckCircle2 size={16} /> : "1"}
                              </span>
                              Adan's Savings Goal
                            </h3>
                            {completedChallenges.has(0) && (
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Completed</span>
                            )}
                          </div>
                          <p className="text-slate-600 text-sm mb-4">
                            Adan deposits <span className="font-bold text-slate-900">$1,000</span> at <span className="font-bold text-slate-900">4% simple interest</span>. How much interest does he earn in the <span className="italic">first year</span>?
                          </p>
                          <div className="flex gap-3">
                            <input 
                              type="number" 
                              placeholder="Answer..."
                              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            <button 
                              onClick={() => setCompletedChallenges(prev => new Set(prev).add(0))}
                              className={cn(
                                "px-4 py-2 text-sm rounded-lg font-bold transition-colors shadow-sm",
                                completedChallenges.has(0) ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                              )}
                            >
                              {completedChallenges.has(0) ? "Correct!" : "Check"}
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {currentChallenge === 1 && (
                        <motion.div 
                          key="c2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={cn(
                            "p-5 rounded-xl transition-all border",
                            completedChallenges.has(1) ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
                          )}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-base font-bold flex items-center gap-2">
                              <span className={cn(
                                "w-7 h-7 rounded-full text-white flex items-center justify-center text-xs transition-colors",
                                completedChallenges.has(1) ? "bg-emerald-500" : "bg-emerald-600"
                              )}>
                                {completedChallenges.has(1) ? <CheckCircle2 size={16} /> : "2"}
                              </span>
                              Lilly's Compounding Power
                            </h3>
                            {completedChallenges.has(1) && (
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Completed</span>
                            )}
                          </div>
                          <p className="text-slate-600 text-sm mb-4">
                            Lilly has <span className="font-bold text-slate-900">$1,000</span> earning <span className="font-bold text-slate-900">4% compounded annually</span>. After 2 years, what is her <span className="italic">total balance</span>?
                          </p>
                          <div className="flex gap-3">
                            <input 
                              type="number" 
                              placeholder="Answer..."
                              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                            <button 
                              onClick={() => setCompletedChallenges(prev => new Set(prev).add(1))}
                              className={cn(
                                "px-4 py-2 text-sm rounded-lg font-bold transition-colors shadow-sm",
                                completedChallenges.has(1) ? "bg-emerald-500 text-white" : "bg-emerald-600 text-white hover:bg-emerald-700"
                              )}
                            >
                              {completedChallenges.has(1) ? "Correct!" : "Check"}
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {currentChallenge === 2 && (
                        <motion.div 
                          key="c3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={cn(
                            "p-5 rounded-xl transition-all border",
                            completedChallenges.has(2) ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
                          )}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-base font-bold flex items-center gap-2">
                              <span className={cn(
                                "w-7 h-7 rounded-full text-white flex items-center justify-center text-xs transition-colors",
                                completedChallenges.has(2) ? "bg-emerald-500" : "bg-amber-500"
                              )}>
                                {completedChallenges.has(2) ? <CheckCircle2 size={16} /> : "3"}
                              </span>
                              The Comparison
                            </h3>
                            {completedChallenges.has(2) && (
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Completed</span>
                            )}
                          </div>
                          <p className="text-slate-600 text-sm mb-4">
                            Suppose you have <span className="font-bold text-slate-900">$100</span> at <span className="font-bold text-slate-900">5% interest</span> for 10 years. Which account earns more interest?
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => setCompletedChallenges(prev => new Set(prev).add(2))}
                              className={cn(
                                "p-3 rounded-lg border-2 transition-all text-left group",
                                completedChallenges.has(2) ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-indigo-500 hover:bg-indigo-50"
                              )}
                            >
                              <div className="font-bold text-sm mb-0.5">Simple</div>
                              <div className="text-[10px] text-slate-500">Earns $50</div>
                            </button>
                            <button 
                              onClick={() => setCompletedChallenges(prev => new Set(prev).add(2))}
                              className={cn(
                                "p-3 rounded-lg border-2 transition-all text-left group",
                                completedChallenges.has(2) ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
                              )}
                            >
                              <div className="font-bold text-sm mb-0.5">Compound</div>
                              <div className="text-[10px] text-slate-500">Earns $62.89</div>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between mt-6">
                      <button
                        onClick={() => setCurrentChallenge(prev => Math.max(0, prev - 1))}
                        disabled={currentChallenge === 0}
                        className="px-4 py-1.5 text-sm rounded-lg font-bold border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setCurrentChallenge(prev => (prev + 1) % 3)}
                        className="px-4 py-1.5 text-sm bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-all shadow-sm"
                      >
                        Next Challenge
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="flex justify-center gap-4 mb-6 no-print">
                  <button 
                    onClick={() => setQuizMode('digital')}
                    className={cn(
                      "px-6 py-2 rounded-xl font-bold transition-all",
                      quizMode === 'digital' ? "bg-rose-500 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    Digital Test
                  </button>
                  <button 
                    onClick={() => setQuizMode('printable')}
                    className={cn(
                      "px-6 py-2 rounded-xl font-bold transition-all",
                      quizMode === 'printable' ? "bg-rose-500 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    Printable Option
                  </button>
                </div>

                <Card className={cn("p-8", quizMode === 'printable' ? "print-content" : "")}>
                  <div className="flex justify-between items-center mb-8 no-print">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <GraduationCap className="text-rose-500" />
                      Interest Mastery Quiz
                    </h2>
                    <div className="flex gap-3">
                      <button 
                        onClick={generateQuiz}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
                      >
                        <RotateCcw size={14} /> New Test
                      </button>
                      {quizMode === 'printable' && (
                        <button 
                          onClick={() => {
                            // Focus the window before printing
                            window.focus();
                            // Small delay to ensure any state changes are reflected in the DOM
                            setTimeout(() => {
                              window.print();
                            }, 250);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-all shadow-sm"
                        >
                          <Printer size={14} /> Print Quiz
                        </button>
                      )}
                    </div>
                  </div>

                  {quizMode === 'printable' && (
                    <div className="hidden print:block mb-8 border-b pb-4">
                      <h1 className="text-3xl font-bold mb-2 text-center">Interest Mastery Quiz</h1>
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Name: __________________________</span>
                        <span>Date: __________________________</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-8">
                    {quizQuestions.map((q, idx) => (
                      <div key={q.id} className={cn("space-y-4", quizMode === 'printable' ? "break-inside-avoid pb-6 border-b border-slate-100 last:border-0" : "")}>
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <p className="font-medium text-slate-800 leading-relaxed">{q.question}</p>
                        </div>

                        {quizMode === 'digital' ? (
                          <div className="grid md:grid-cols-2 gap-3 ml-9">
                            {q.options.map((opt) => (
                              <button
                                key={opt}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                className={cn(
                                  "p-3 rounded-xl border-2 text-left transition-all text-sm",
                                  quizAnswers[q.id] === opt 
                                    ? (quizSubmitted 
                                        ? (opt === q.correctAnswer ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-rose-500 bg-rose-50 text-rose-700")
                                        : "border-rose-500 bg-rose-50 text-rose-700 shadow-sm")
                                    : (quizSubmitted && opt === q.correctAnswer ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 hover:border-slate-200 bg-slate-50/50")
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-y-4 ml-9">
                            {['A', 'B', 'C', 'D'].map((letter, i) => (
                              <div key={letter} className="flex items-center gap-2 text-sm">
                                <span className="w-5 h-5 border border-slate-300 rounded-full flex items-center justify-center text-[10px] font-bold">
                                  {letter}
                                </span>
                                <span>{q.options[i]}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {quizSubmitted && quizMode === 'digital' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={cn(
                              "ml-9 p-3 rounded-lg text-xs",
                              quizAnswers[q.id] === q.correctAnswer ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                            )}
                          >
                            <p className="font-bold mb-1">
                              {quizAnswers[q.id] === q.correctAnswer ? "✓ Correct!" : `✗ Incorrect. Correct answer: ${q.correctAnswer}`}
                            </p>
                            <p className="opacity-80">{q.explanation}</p>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>

                  {quizMode === 'printable' && (
                    <div className="hidden print:block mt-12 pt-8 border-t-2 border-dashed border-slate-200 break-before-page">
                      <h3 className="text-xl font-bold mb-4 text-center">Answer Key</h3>
                      <div className="grid grid-cols-5 gap-4">
                        {quizQuestions.map((q, idx) => (
                          <div key={`key-${q.id}`} className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-slate-400">{idx + 1}.</span>
                            <span className="font-bold">{q.correctAnswer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {quizMode === 'digital' && !quizSubmitted && (
                    <div className="mt-12 flex justify-center">
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                        className="px-12 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Quiz
                      </button>
                    </div>
                  )}

                  {quizSubmitted && quizMode === 'digital' && (
                    <div className="mt-12 space-y-8">
                      <div className="p-8 bg-slate-900 rounded-3xl text-white text-center print-results-summary">
                        <h3 className="text-xl font-bold mb-2">Quiz Results</h3>
                        <div className="text-5xl font-black text-rose-400 mb-4">
                          {Object.values(quizAnswers).filter((ans, i) => ans === quizQuestions[i].correctAnswer).length} / {quizQuestions.length}
                        </div>
                        <p className="text-slate-400 mb-6">
                          {Object.values(quizAnswers).filter((ans, i) => ans === quizQuestions[i].correctAnswer).length >= 8 
                            ? "Excellent work! You've mastered interest calculations." 
                            : "Good effort! Review the breakdown below to improve your score."}
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                          <button
                            onClick={generateQuiz}
                            className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all"
                          >
                            Try Another Test
                          </button>
                          <button
                            onClick={() => {
                              window.focus();
                              setTimeout(() => {
                                window.print();
                              }, 250);
                            }}
                            className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all flex items-center gap-2"
                          >
                            <Printer size={18} /> Print Results
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 px-2">
                          <CheckCircle2 className="text-emerald-500" size={20} />
                          Performance Breakdown
                        </h3>
                        <div className="grid gap-4">
                          {quizQuestions.map((q, idx) => {
                            const isCorrect = quizAnswers[q.id] === q.correctAnswer;
                            return (
                              <div 
                                key={`summary-${q.id}`}
                                className={cn(
                                  "p-4 rounded-2xl border-2 transition-all",
                                  isCorrect ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"
                                )}
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex gap-3">
                                    <span className={cn(
                                      "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                      isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                    )}>
                                      {idx + 1}
                                    </span>
                                    <div>
                                      <p className="text-sm font-medium text-slate-800 mb-2">{q.question}</p>
                                      <div className="grid sm:grid-cols-2 gap-4 text-xs">
                                        <div>
                                          <p className="text-slate-500 font-bold uppercase tracking-tighter mb-1">Your Answer</p>
                                          <p className={cn("font-bold", isCorrect ? "text-emerald-600" : "text-rose-600")}>
                                            {quizAnswers[q.id] || "No answer"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-slate-500 font-bold uppercase tracking-tighter mb-1">Correct Answer</p>
                                          <p className="text-emerald-600 font-bold">{q.correctAnswer}</p>
                                        </div>
                                      </div>
                                      <div className="mt-3 p-3 bg-white/50 rounded-lg border border-slate-100 text-xs text-slate-600">
                                        <p className="font-bold text-slate-800 mb-1">Explanation:</p>
                                        {q.explanation}
                                      </div>
                                    </div>
                                  </div>
                                  <div className={cn(
                                    "p-2 rounded-full",
                                    isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                                  )}>
                                    {isCorrect ? <CheckCircle2 size={18} /> : <RotateCcw size={18} className="rotate-45" />}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {quizMode === 'printable' && (
                    <div className="hidden print:block mt-12 pt-8 border-t border-dashed">
                      <h3 className="text-lg font-bold mb-4">Answer Key</h3>
                      <div className="grid grid-cols-5 gap-4">
                        {quizQuestions.map((q, i) => (
                          <div key={q.id} className="text-sm">
                            <span className="font-bold">{i + 1}.</span> {q.correctAnswer}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-20 text-center text-slate-400 text-sm">
          <p>© 2026 Interest Master Learning Tool • Based on TEKS 8.12.C, 8.12.D</p>
          <div className="flex justify-center gap-6 mt-4">
            <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Interactive Formulas</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Real-time Visualization</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Student Practice</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
