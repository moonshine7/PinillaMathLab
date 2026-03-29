import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  PencilLine, 
  ClipboardCheck, 
  Printer, 
  ChevronRight, 
  Calculator, 
  Lightbulb,
  MessageSquare,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Download,
  Sparkles,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateTutorResponse, generateMathImage } from './services/geminiService';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type Tab = 'lesson' | 'practice' | 'quiz' | 'tutor';

interface Problem {
  id: number;
  title: string;
  context: string;
  unit: string;
  dataA: number[];
  dataB: number[];
  labelA: string;
  labelB: string;
  comparisonExplanation: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// --- Data ---

const LESSON_CONTENT = `
# Understanding Mean Absolute Deviation (M.A.D)

Mean Absolute Deviation (M.A.D) is a **measure of variability**. While the **mean** tells us the average of a data set, the **M.A.D** tells us how spread out the data is from that mean.

### Why does it matter?
In the real world, consistency is often key. 
- A **low M.A.D** means the data points are close to the average (consistent).
- A **high M.A.D** means the data points are spread out (variable).

### The 3-Step Process:
1. **Find the Mean:** Add all values and divide by the number of values.
2. **Find the Distances:** Subtract the mean from each value (use absolute values, so no negatives!).
3. **Find the M.A.D:** Calculate the mean of those distances.

### Real World Example: Building Heights
Imagine 5 buildings with heights: 60ft, 58ft, 54ft, 56ft, 62ft.
- **Mean:** (60+58+54+56+62) / 5 = **58ft**
- **Distances from 58:** |60-58|=2, |58-58|=0, |54-58|=4, |56-58|=2, |62-58|=4
- **M.A.D:** (2+0+4+2+4) / 5 = **2.4ft**

## M.A.D. in the Real World
Beyond simple numbers, M.A.D. is a powerful tool for comparing **consistency** and **reliability** in many fields:

1. **Quality Control:** Factories use M.A.D. to ensure that every product (like a bag of chips or a bolt) is almost exactly the same size. A high M.A.D. means the machines need to be fixed!
2. **Sports Analytics:** Coaches use M.A.D. to see which player is more consistent. A basketball player who scores exactly 20 points every game has a M.A.D. of 0, while one who scores 40 one night and 0 the next has a very high M.A.D.
3. **Weather Forecasting:** Meteorologists compare the M.A.D. of different weather models to see which one is more reliable over time.
4. **Finance:** Investors look at the M.A.D. of stock prices to understand how "volatile" or risky an investment might be.
`;

const PRACTICE_PROBLEMS: Problem[] = [
  {
    id: 1,
    title: "Barista Consistency Contest",
    context: "Two baristas are competing for a 'Consistency Award'. Calculate the M.A.D for both to see who stays closer to the target size.",
    unit: "oz",
    labelA: "Barista Joe",
    dataA: [19.1, 20.1, 19.6, 19.2],
    labelB: "Barista Maria",
    dataB: [19.8, 20.2, 20.0, 19.9],
    comparisonExplanation: "Barista Maria is more consistent because her M.A.D is lower, meaning her pours are closer to the average."
  },
  {
    id: 2,
    title: "Paper Mill Machine Test",
    context: "A paper mill is testing two machines. Both are set to produce paper with a width of 8.5 inches. Which machine has less variability?",
    unit: "inches",
    labelA: "Machine A",
    dataA: [8.502, 8.505, 8.502, 8.503],
    labelB: "Machine B",
    dataB: [8.503, 8.501, 8.498, 8.499],
    comparisonExplanation: "Machine A has less variability (lower M.A.D), making it the better choice for precision cutting."
  },
  {
    id: 3,
    title: "Texas Rainfall Comparison",
    context: "Compare the annual rainfall variability between Austin and San Antonio over 4 years.",
    unit: "inches",
    labelA: "Austin",
    dataA: [36.0, 21.4, 52.2, 22.3],
    labelB: "San Antonio",
    dataB: [46.2, 28.4, 45.3, 16.5],
    comparisonExplanation: "San Antonio shows slightly more variability in this data set, though both cities experience significant spread."
  },
  {
    id: 4,
    title: "Teacher Training Progress",
    context: "Teachers were trained to standardize essay scores. Compare the variability of scores at the beginning vs the end of training.",
    unit: "points",
    labelA: "Beginning",
    dataA: [76, 81, 85, 79],
    labelB: "End",
    dataB: [79, 82, 84, 81],
    comparisonExplanation: "The training was successful! The M.A.D decreased at the end, meaning teachers became more consistent in their scoring."
  },
  {
    id: 5,
    title: "Smartphone Battery Test",
    context: "A tech reviewer is testing the battery life of two new smartphones. Which model provides more consistent battery performance?",
    unit: "hours",
    labelA: "Model X",
    dataA: [12.5, 13.0, 12.8, 12.7],
    labelB: "Model Y",
    dataB: [11.0, 14.5, 10.5, 15.0],
    comparisonExplanation: "Model X is much more consistent because its M.A.D is significantly lower, meaning users can rely on it to last about the same time every day."
  },
  {
    id: 6,
    title: "Delivery App Speed",
    context: "A customer wants to know which delivery app is more reliable. Compare the delivery times for 'FastFood' and 'QuickBite' over 5 orders.",
    unit: "minutes",
    labelA: "FastFood",
    dataA: [25, 35, 30, 40, 20],
    labelB: "QuickBite",
    dataB: [28, 32, 30, 29, 31],
    comparisonExplanation: "QuickBite is more consistent. Even though both apps have the same average delivery time, QuickBite's lower M.A.D means you are less likely to have a very late or very early delivery."
  }
];

const QUIZ_QUESTIONS_POOL: QuizQuestion[] = [
  {
    id: 1,
    question: "What does a M.A.D of 0 mean?",
    options: ["The average is zero", "All data points are exactly the same", "The data is very spread out", "There is no data"],
    correctIndex: 1,
    explanation: "If M.A.D is 0, every distance from the mean is 0, which means every value is equal to the mean."
  },
  {
    id: 2,
    question: "Which step comes FIRST in calculating M.A.D?",
    options: ["Find the absolute distances", "Find the median", "Find the mean of the data set", "Find the range"],
    correctIndex: 2,
    explanation: "You must know the mean first to calculate how far each point is from it."
  },
  {
    id: 3,
    question: "If Machine A has a M.A.D of 0.05 and Machine B has a M.A.D of 0.12, which machine is more consistent?",
    options: ["Machine A", "Machine B", "They are equally consistent", "Not enough information"],
    correctIndex: 0,
    explanation: "A lower M.A.D indicates less variability and higher consistency."
  },
  {
    id: 4,
    question: "What is the M.A.D of the data set: 10, 10, 10, 10?",
    options: ["10", "5", "0", "1"],
    correctIndex: 2,
    explanation: "Since all numbers are the same, they are all 0 distance from the mean."
  },
  {
    id: 5,
    question: "If a data set has a mean of 50 and one value is 42, what is the distance from the mean for that value?",
    options: ["-8", "8", "50", "42"],
    correctIndex: 1,
    explanation: "Distance is the absolute difference: |42 - 50| = 8."
  },
  {
    id: 6,
    question: "Which of these is a measure of variability?",
    options: ["Mean", "Median", "Mode", "Mean Absolute Deviation"],
    correctIndex: 3,
    explanation: "M.A.D measures how spread out data is, which is variability."
  },
  {
    id: 7,
    question: "True or False: M.A.D can be a negative number.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation: "Distances are absolute (positive), so their average cannot be negative."
  },
  {
    id: 8,
    question: "A data set with a high M.A.D is considered:",
    options: ["Very consistent", "Highly variable", "Small", "Inaccurate"],
    correctIndex: 1,
    explanation: "High M.A.D means values are far from the mean, indicating high variability."
  },
  {
    id: 9,
    question: "If you add 10 to every number in a data set, what happens to the M.A.D?",
    options: ["It increases by 10", "It decreases by 10", "It stays the same", "It doubles"],
    correctIndex: 2,
    explanation: "Adding a constant shifts the mean and all values equally, so the distances between them stay the same."
  },
  {
    id: 10,
    question: "M.A.D stands for:",
    options: ["Median Absolute Deviation", "Mean Absolute Deviation", "Mean Actual Distance", "Main Absolute Division"],
    correctIndex: 1,
    explanation: "M.A.D stands for Mean Absolute Deviation."
  },
  {
    id: 11,
    question: "Which is more consistent: a M.A.D of 1.5 or a M.A.D of 4.2?",
    options: ["M.A.D of 1.5", "M.A.D of 4.2", "Both are the same", "Cannot be determined"],
    correctIndex: 0,
    explanation: "Lower M.A.D means the data is closer to the mean and more consistent."
  },
  {
    id: 12,
    question: "In the 'Absolute' part of M.A.D, what does it mean for the distances?",
    options: ["They are rounded", "They are always positive", "They are squared", "They are ignored"],
    correctIndex: 1,
    explanation: "Absolute value turns negative differences into positive distances."
  },
  {
    id: 13,
    question: "If the mean is 20 and the values are 18 and 22, what is the M.A.D?",
    options: ["0", "2", "4", "20"],
    correctIndex: 1,
    explanation: "Distances are |18-20|=2 and |22-20|=2. The mean of (2+2)/2 is 2."
  },
  {
    id: 14,
    question: "Why do we use M.A.D instead of just the mean?",
    options: ["To find the middle number", "To see how reliable the average is", "To find the most common number", "To make the math harder"],
    correctIndex: 1,
    explanation: "M.A.D tells us if the mean is a good representation of the data set."
  },
  {
    id: 15,
    question: "A M.A.D of 5.0 in a data set of heights (inches) means:",
    options: ["The tallest person is 5 inches", "The average height is 5 inches", "On average, heights are 5 inches away from the mean", "There are 5 people in the set"],
    correctIndex: 2,
    explanation: "M.A.D represents the average distance from the mean."
  }
];

// --- Components ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('lesson');
  const [tutorInput, setTutorInput] = useState('');
  const [tutorMessages, setTutorMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [scenarioImage, setScenarioImage] = useState<string | null>(null);
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    }
  };

  const handleOpenKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorInput.trim()) return;

    const userMsg = tutorInput;
    setTutorMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setTutorInput('');
    setIsTutorLoading(true);

    try {
      const response = await generateTutorResponse(userMsg, "The student is learning about Mean Absolute Deviation (M.A.D).");
      setTutorMessages(prev => [...prev, { role: 'ai', text: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      setTutorMessages(prev => [...prev, { role: 'ai', text: "Error connecting to tutor. Please try again." }]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  const handleGenerateScenarioImage = async () => {
    if (imageSize !== "1K" && !hasApiKey) {
      await handleOpenKeyDialog();
    }
    setIsScenarioLoading(true);
    
    const scenarios = [
      "A split screen comparison of two basketball players: one scoring consistently and one scoring inconsistently, with M.A.D labels showing variability",
      "A quality control factory line comparing two machines: one producing identical bolts (low M.A.D) and one producing bolts of different sizes (high M.A.D)",
      "A comparison of two delivery drivers: one always arriving exactly at 30 minutes, and another arriving at very different times, illustrating M.A.D",
      "Two baristas pouring coffee: one filling every cup to the same level, another with uneven levels, showing consistency vs variability",
      "A weather forecast comparison showing two different models: one with a tight range of predicted temperatures and one with a wide, variable range"
    ];
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    try {
      const img = await generateMathImage(randomScenario, imageSize);
      setScenarioImage(img);
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        await handleOpenKeyDialog();
      }
    } finally {
      setIsScenarioLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-mad-blue rounded-lg flex items-center justify-center text-white">
              <Calculator size={24} />
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight">MAD Explorer</h1>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <TabButton active={activeTab === 'lesson'} onClick={() => setActiveTab('lesson')} icon={<BookOpen size={18} />} label="Lesson" color="bg-mad-blue" />
            <TabButton active={activeTab === 'practice'} onClick={() => setActiveTab('practice')} icon={<PencilLine size={18} />} label="Practice" color="bg-mad-green" />
            <TabButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<ClipboardCheck size={18} />} label="Quiz" color="bg-mad-orange" />
            <TabButton active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<MessageSquare size={18} />} label="AI Tutor" color="bg-mad-purple" />
          </nav>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden flex border-b border-slate-200 bg-white overflow-x-auto">
        <MobileTabButton active={activeTab === 'lesson'} onClick={() => setActiveTab('lesson')} icon={<BookOpen size={20} />} label="Lesson" />
        <MobileTabButton active={activeTab === 'practice'} onClick={() => setActiveTab('practice')} icon={<PencilLine size={20} />} label="Practice" />
        <MobileTabButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<ClipboardCheck size={20} />} label="Quiz" />
        <MobileTabButton active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<MessageSquare size={20} />} label="Tutor" />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'lesson' && (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <div className="markdown-body">
                    <Markdown>{LESSON_CONTENT}</Markdown>
                  </div>
                  
                  {/* Scenario Image Section */}
                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="flex-1 space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <ImageIcon className="text-mad-orange" size={24} />
                          Visualizing Real-World Consistency
                        </h3>
                        <p className="text-slate-600">
                          Click below to generate an AI illustration showing how M.A.D. helps us compare the consistency of two different things, like athletes or products.
                        </p>
                        <button 
                          onClick={handleGenerateScenarioImage}
                          disabled={isScenarioLoading}
                          className="px-6 py-3 bg-mad-orange text-white rounded-xl font-bold flex items-center gap-2 hover:bg-mad-orange/90 transition-colors disabled:opacity-50"
                        >
                          {isScenarioLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                          {scenarioImage ? "Regenerate Scenario" : "Generate Scenario Illustration"}
                        </button>
                      </div>
                      <div className="flex-1 w-full">
                        {scenarioImage ? (
                          <motion.img 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={scenarioImage} 
                            alt="Real World M.A.D Scenario" 
                            className="w-full rounded-2xl shadow-xl border-4 border-white"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <ImageIcon size={48} className="mb-4 opacity-20" />
                            <p className="text-sm">Your real-world scenario illustration will appear here.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-mad-blue/5 p-6 rounded-2xl border border-mad-blue/10">
                  <h3 className="text-mad-blue font-bold flex items-center gap-2 mb-4">
                    <Lightbulb size={20} />
                    Pro Tip
                  </h3>
                  <p className="text-slate-700">
                    Always double-check your mean! If the mean is wrong, every distance calculation will also be wrong.
                  </p>
                </div>
            </motion.div>
          )}

          {activeTab === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-display font-bold text-slate-800 mb-6">Interactive Practice</h2>
              <div className="grid gap-6">
                {PRACTICE_PROBLEMS.map((problem) => (
                  <PracticeCard key={problem.id} problem={problem} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <QuizSection />
            </motion.div>
          )}

          {activeTab === 'tutor' && (
            <motion.div
              key="tutor"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-[calc(100vh-200px)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-mad-purple rounded-full flex items-center justify-center text-white">
                    <MessageSquare size={16} />
                  </div>
                  <span className="font-bold text-slate-700">AI Math Tutor</span>
                </div>
                <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">Powered by Gemini 2.5 Flash Lite</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {tutorMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p>Ask me anything about Mean Absolute Deviation!</p>
                    <p className="text-sm">Example: "Why do we use absolute values?"</p>
                  </div>
                )}
                {tutorMessages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-2xl",
                      msg.role === 'user' ? "bg-mad-purple text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none"
                    )}>
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                ))}
                {isTutorLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-mad-purple" />
                      <span className="text-sm text-slate-500">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleTutorSubmit} className="p-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-mad-purple/20 focus:border-mad-purple transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={isTutorLoading || !tutorInput.trim()}
                    className="bg-mad-purple text-white p-2 rounded-xl hover:bg-mad-purple/90 transition-colors disabled:opacity-50"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2026 MAD Explorer • Built for Students</p>
        </div>
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
        active ? `${color} text-white shadow-sm` : "text-slate-600 hover:bg-slate-100"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MobileTabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center gap-1 py-3 min-w-[80px]",
        active ? "text-mad-blue border-b-2 border-mad-blue bg-mad-blue/5" : "text-slate-500"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function DataColumn({ 
  label, 
  data, 
  onComplete, 
  colorClass, 
  accentClass,
  bgClass
}: { 
  label: string, 
  data: number[], 
  onComplete: (mad: number) => void,
  colorClass: string,
  accentClass: string,
  bgClass: string
}) {
  const [step, setStep] = useState(1);
  const [meanInput, setMeanInput] = useState('');
  const [deviationsInputs, setDeviationsInputs] = useState<string[]>(new Array(data.length).fill(''));
  const [madInput, setMadInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const mean = Math.round((data.reduce((a, b) => a + b, 0) / data.length) * 100) / 100;
  const deviations = data.map(v => Math.round(Math.abs(v - mean) * 100) / 100);
  const mad = Math.round((deviations.reduce((a, b) => a + b, 0) / deviations.length) * 100) / 100;

  const checkStep1 = () => {
    if (Math.abs(parseFloat(meanInput) - mean) < 0.01) {
      setStatus('correct');
      setTimeout(() => { setStep(2); setStatus('idle'); }, 800);
    } else { setStatus('wrong'); }
  };

  const checkStep2 = () => {
    const allCorrect = deviationsInputs.every((val, i) => Math.abs(parseFloat(val) - deviations[i]) < 0.01);
    if (allCorrect) {
      setStatus('correct');
      setTimeout(() => { setStep(3); setStatus('idle'); }, 800);
    } else { setStatus('wrong'); }
  };

  const checkStep3 = () => {
    if (Math.abs(parseFloat(madInput) - mad) < 0.01) {
      setStatus('correct');
      onComplete(mad);
    } else { setStatus('wrong'); }
  };

  return (
    <div className="space-y-6">
      <div className={cn("p-3 rounded-xl border-b-4 text-center font-bold", colorClass, accentClass)}>
        {label}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {data.map((val, i) => (
          <div key={i} className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg font-mono font-bold text-slate-700 text-sm">
            {val}
          </div>
        ))}
      </div>

      {/* Step 1: Mean */}
      <div className={cn("p-4 rounded-xl border transition-all", step === 1 ? cn("border-mad-blue", bgClass) : "border-slate-100 opacity-50")}>
        <h4 className="font-bold text-xs mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-mad-blue text-white flex items-center justify-center text-[10px]">1</span>
          Mean
        </h4>
        {step === 1 ? (
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={meanInput}
              onChange={(e) => { setMeanInput(e.target.value); setStatus('idle'); }}
              placeholder="Mean?"
              className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 outline-none"
            />
            <button onClick={checkStep1} className="bg-mad-blue text-white px-3 py-1.5 rounded-lg text-sm font-bold">OK</button>
          </div>
        ) : (
          <p className="text-sm font-bold text-mad-blue">Mean = {mean}</p>
        )}
      </div>

      {/* Step 2: Deviations */}
      <div className={cn("p-4 rounded-xl border transition-all", step === 2 ? "border-mad-green bg-mad-green/5" : step < 2 ? "border-slate-100 opacity-30" : "border-slate-100 opacity-50")}>
        <h4 className="font-bold text-xs mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-mad-green text-white flex items-center justify-center text-[10px]">2</span>
          Distances
        </h4>
        {step === 2 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {data.map((val, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500">|{val} - {mean}|</span>
                  <input
                    type="number"
                    step="0.01"
                    value={deviationsInputs[i]}
                    onChange={(e) => {
                      const newInputs = [...deviationsInputs];
                      newInputs[i] = e.target.value;
                      setDeviationsInputs(newInputs);
                      setStatus('idle');
                    }}
                    className="px-2 py-1 rounded border border-slate-200 text-xs outline-none"
                  />
                </div>
              ))}
            </div>
            <button onClick={checkStep2} className="w-full bg-mad-green text-white py-1.5 rounded-lg text-sm font-bold">Check</button>
          </div>
        ) : step > 2 ? (
          <div className="flex flex-wrap gap-1">
            {deviations.map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-mad-green bg-mad-green/10 px-1.5 py-0.5 rounded">{d}</span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Step 3: M.A.D */}
      <div className={cn("p-4 rounded-xl border transition-all", step === 3 ? "border-mad-orange bg-mad-orange/5" : step < 3 ? "border-slate-100 opacity-30" : "border-slate-100 opacity-50")}>
        <h4 className="font-bold text-xs mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-mad-orange text-white flex items-center justify-center text-[10px]">3</span>
          M.A.D
        </h4>
        {step === 3 ? (
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={madInput}
              onChange={(e) => { setMadInput(e.target.value); setStatus('idle'); }}
              placeholder="M.A.D?"
              className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 outline-none"
            />
            <button onClick={checkStep3} className="bg-mad-orange text-white px-3 py-1.5 rounded-lg text-sm font-bold">OK</button>
          </div>
        ) : step > 3 ? (
          <p className="text-sm font-bold text-mad-orange">M.A.D = {mad}</p>
        ) : null}
      </div>

      {status === 'wrong' && (
        <p className="text-[10px] text-center text-red-500 font-bold">Try again!</p>
      )}
    </div>
  );
}

function PracticeCard({ problem }: { problem: Problem }) {
  const [madA, setMadA] = useState<number | null>(null);
  const [madB, setMadB] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (madA !== null && madB !== null) {
      setShowComparison(true);
    }
  }, [madA, madB]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-800">{problem.title}</h3>
          <span className="text-xs font-mono bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded-full">Problem #{problem.id}</span>
        </div>
        <p className="text-slate-600 text-sm">{problem.context}</p>
      </div>
      
      <div className="grid md:grid-cols-[1fr_2px_1fr] gap-0">
        <div className="p-6">
          <DataColumn 
            label={problem.labelA} 
            data={problem.dataA} 
            onComplete={setMadA}
            colorClass="text-mad-blue"
            accentClass="border-mad-blue/30"
            bgClass="bg-mad-blue/5"
          />
        </div>

        <div className="hidden md:block w-[2px] bg-slate-200 my-8"></div>
        <div className="md:hidden h-[2px] bg-slate-200 mx-8"></div>

        <div className="p-6">
          <DataColumn 
            label={problem.labelB} 
            data={problem.dataB} 
            onComplete={setMadB}
            colorClass="text-mad-purple"
            accentClass="border-mad-purple/30"
            bgClass="bg-mad-purple/5"
          />
        </div>
      </div>

      <AnimatePresence>
        {showComparison && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="p-6 bg-slate-900 text-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ClipboardCheck className="text-mad-green" size={24} />
              </div>
              <h4 className="text-lg font-bold">Variability Comparison</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">{problem.labelA}</p>
                <p className="text-2xl font-bold text-mad-blue">{madA}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">{problem.labelB}</p>
                <p className="text-2xl font-bold text-mad-purple">{madB}</p>
              </div>
            </div>

            <div className="bg-mad-green/20 border border-mad-green/30 p-4 rounded-2xl">
              <p className="text-sm leading-relaxed">
                <span className="font-bold text-mad-green">Conclusion:</span> {problem.comparisonExplanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuizSection() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizMode, setQuizMode] = useState<'online' | 'print'>('online');
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    generateQuiz();
  }, []);

  const generateQuiz = () => {
    const shuffled = [...QUIZ_QUESTIONS_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    setQuestions(selected);
    setUserAnswers(new Array(selected.length).fill(null));
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = selectedOption;
    setUserAnswers(newAnswers);

    if (selectedOption === questions[currentQuestion].correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizComplete(false);
    setShowReview(false);
    generateQuiz();
  };

  const printQuiz = () => {
    window.print();
  };

  if (questions.length === 0) return <div className="p-12 text-center">Loading Quiz...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-display font-bold text-slate-800">Knowledge Check</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => { setQuizMode('online'); setShowReview(false); }}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2",
              quizMode === 'online' ? "bg-mad-orange text-white shadow-md" : "text-slate-500 hover:bg-slate-200"
            )}
          >
            <ClipboardCheck size={18} /> Online Quiz
          </button>
          <button 
            onClick={() => { setQuizMode('print'); setShowReview(false); }}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2",
              quizMode === 'print' ? "bg-mad-blue text-white shadow-md" : "text-slate-500 hover:bg-slate-200"
            )}
          >
            <Printer size={18} /> Print Test
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {quizMode === 'online' ? (
          <motion.div
            key={showReview ? "review" : "quiz"}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {showReview ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button 
                    onClick={() => setShowReview(false)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors order-2 sm:order-1"
                  >
                    <ArrowLeft size={18} /> Back to Summary
                  </button>
                  <h3 className="text-xl font-bold text-slate-800 order-1 sm:order-2">Review Answers</h3>
                  <button 
                    onClick={resetQuiz}
                    className="px-6 py-2 bg-mad-orange text-white rounded-xl font-bold hover:bg-mad-orange/90 transition-colors flex items-center gap-2 shadow-sm order-3"
                  >
                    <RefreshCcw size={18} /> Retry Quiz
                  </button>
                </div>
                
                <div className="space-y-4">
                  {questions.map((q, i) => (
                    <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm",
                          userAnswers[i] === q.correctIndex ? "bg-mad-green/10 text-mad-green" : "bg-red-100 text-red-500"
                        )}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 mb-4">{q.question}</p>
                          <div className="grid gap-2 mb-4">
                            {q.options.map((opt, optIdx) => (
                              <div 
                                key={optIdx}
                                className={cn(
                                  "p-3 rounded-lg text-sm border flex justify-between items-center",
                                  optIdx === q.correctIndex ? "bg-mad-green/5 border-mad-green/30 text-mad-green font-bold" :
                                  optIdx === userAnswers[i] ? "bg-red-50 border-red-200 text-red-600" : "bg-slate-50 border-slate-100 text-slate-500"
                                )}
                              >
                                <span>{opt}</span>
                                {optIdx === q.correctIndex && <CheckCircle2 size={16} />}
                                {optIdx === userAnswers[i] && optIdx !== q.correctIndex && <XCircle size={16} />}
                              </div>
                            ))}
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-600">
                              <strong className="text-slate-800">Explanation:</strong> {q.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <button 
                    onClick={resetQuiz}
                    className="px-10 py-3 bg-mad-orange text-white rounded-xl font-bold hover:bg-mad-orange/90 transition-colors flex items-center gap-2"
                  >
                    <RefreshCcw size={20} /> Retry Quiz
                  </button>
                </div>
              </div>
            ) : quizComplete ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-20 h-20 bg-mad-orange/10 text-mad-orange rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClipboardCheck size={40} />
                </div>
                <h2 className="text-3xl font-display font-bold mb-2">Quiz Complete!</h2>
                <p className="text-slate-500 mb-8">You scored {score} out of {questions.length}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => setShowReview(true)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    <Eye size={18} /> Review Answers
                  </button>
                  <button onClick={resetQuiz} className="px-10 py-4 bg-mad-orange text-white rounded-2xl font-bold hover:bg-mad-orange/90 transition-all shadow-lg hover:shadow-mad-orange/20 flex items-center justify-center gap-2 scale-105">
                    <RefreshCcw size={20} /> Retry Quiz
                  </button>
                  <button onClick={printQuiz} className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                    <Printer size={18} /> Print Test
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-mad-orange bg-mad-orange/10 px-3 py-1 rounded-full">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <div className="flex gap-1">
                    {questions.map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          i === currentQuestion ? "w-6 bg-mad-orange" : i < currentQuestion ? "bg-mad-green" : "bg-slate-200"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-8">{questions[currentQuestion].question}</h3>
                
                <div className="grid gap-4 mb-8">
                  {questions[currentQuestion].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(i)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center",
                        isAnswered ? (
                          i === questions[currentQuestion].correctIndex ? "border-mad-green bg-mad-green/5" :
                          i === selectedOption ? "border-red-500 bg-red-50" : "border-slate-100 opacity-50"
                        ) : (
                          selectedOption === i ? "border-mad-orange bg-mad-orange/5" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                        )
                      )}
                    >
                      <span className="font-medium">{option}</span>
                      {isAnswered && i === questions[currentQuestion].correctIndex && <CheckCircle2 className="text-mad-green" size={20} />}
                      {isAnswered && i === selectedOption && i !== questions[currentQuestion].correctIndex && <XCircle className="text-red-500" size={20} />}
                    </button>
                  ))}
                </div>

                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-50 rounded-xl mb-8 border border-slate-100"
                  >
                    <p className="text-sm text-slate-600">
                      <strong className="text-slate-800">Explanation:</strong> {questions[currentQuestion].explanation}
                    </p>
                  </motion.div>
                )}

                <div className="flex justify-end">
                  {!isAnswered ? (
                    <button 
                      onClick={handleSubmit}
                      disabled={selectedOption === null}
                      className="px-10 py-3 bg-mad-orange text-white rounded-xl font-bold hover:bg-mad-orange/90 transition-colors disabled:opacity-50"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button 
                      onClick={handleNext}
                      className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"} <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="print-test"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Printable Test Preview</h3>
                  <p className="text-sm text-slate-500">This test contains 10 randomized questions.</p>
                </div>
                <button 
                  onClick={printQuiz}
                  className="bg-mad-blue text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-mad-blue/90 transition-colors"
                >
                  <Printer size={18} /> Print Now
                </button>
              </div>

              <div className="border border-slate-100 rounded-xl p-8 bg-slate-50 max-h-[600px] overflow-y-auto">
                <div className="bg-white p-8 shadow-sm rounded-sm mx-auto max-w-[800px] text-slate-900 font-serif">
                  <div className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end">
                    <div>
                      <h1 className="text-2xl font-bold uppercase tracking-tighter">M.A.D Assessment</h1>
                      <p className="text-sm italic">Mean Absolute Deviation Mastery</p>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <p>Name: _______________________</p>
                      <p>Date: _______________________</p>
                      <p>Score: ________ / 10</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {questions.map((q, i) => (
                      <div key={q.id} className="space-y-3">
                        <p className="font-bold text-lg">{i + 1}. {q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 pl-4">
                          {q.options.map((opt, j) => (
                            <div key={j} className="flex items-center gap-3">
                              <div className="w-4 h-4 border-2 border-slate-400 rounded-full flex-shrink-0"></div>
                              <span className="text-sm">{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
                    End of Test • MAD Explorer Learning System
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-mad-blue/5 border border-mad-blue/20 p-6 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-mad-blue text-white flex items-center justify-center flex-shrink-0">
                <Download size={20} />
              </div>
              <div>
                <h4 className="font-bold text-mad-blue">Teacher Tip</h4>
                <p className="text-sm text-slate-600">You can print this page to get a clean PDF version of the test. Each time you reset the quiz, a new set of questions will be generated for the print preview!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Printable Content (for actual browser print) */}
      <div className="hidden print:block p-8 text-slate-900 font-serif">
        <div className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tighter">M.A.D Assessment</h1>
            <p className="text-lg italic">Mean Absolute Deviation Mastery</p>
          </div>
          <div className="text-right text-lg space-y-2">
            <p>Name: _______________________</p>
            <p>Date: _______________________</p>
            <p>Score: ________ / 10</p>
          </div>
        </div>

        <div className="space-y-10">
          {questions.map((q, i) => (
            <div key={q.id} className="space-y-4 break-inside-avoid">
              <p className="font-bold text-xl">{i + 1}. {q.question}</p>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 pl-6">
                {q.options.map((opt, j) => (
                  <div key={j} className="flex items-center gap-4">
                    <div className="w-6 h-6 border-2 border-slate-400 rounded-full flex-shrink-0"></div>
                    <span className="text-lg">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-8 border-t border-slate-300 text-center text-sm text-slate-500">
          End of Test • MAD Explorer Learning System
        </div>
      </div>
    </div>
  );
}
