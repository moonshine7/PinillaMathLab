/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Layers, 
  ArrowRightLeft, 
  PenTool, 
  Search, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---

type TabType = 'sets' | 'rational-irrational' | 'ordering' | 'practice';

interface Question {
  id: number;
  text: string;
  options?: string[];
  correctAnswer: string;
  type: 'multiple-choice' | 'text';
  explanation: string;
}

// --- Components ---

const Header = () => (
  <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <BookOpen size={20} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Real Numbers Masterclass</h1>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-500">
        <span className="text-indigo-600">Lesson 1.1 - 1.3</span>
        <span>8th Grade Math</span>
      </div>
    </div>
  </header>
);

const VennDiagram = () => (
  <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] bg-zinc-50 rounded-2xl border border-zinc-200 p-8 overflow-hidden shadow-inner">
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Real Numbers Container */}
      <div className="w-[90%] h-[85%] border-2 border-zinc-400 rounded-3xl flex flex-col p-4 bg-white/50">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Real Numbers</span>
        
        <div className="flex h-full gap-4">
          {/* Rational Numbers */}
          <div className="flex-1 border-2 border-indigo-200 rounded-2xl p-4 bg-indigo-50/30 relative">
            <span className="text-sm font-bold text-indigo-600">Rational Numbers</span>
            <div className="mt-4 space-y-4">
              {/* Integers */}
              <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/30">
                <span className="text-xs font-bold text-blue-600 uppercase">Integers</span>
                <div className="mt-4">
                  {/* Whole Numbers */}
                  <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50/30">
                    <span className="text-xs font-bold text-emerald-600 uppercase">Whole Numbers</span>
                    <div className="mt-2 text-[10px] text-zinc-500 font-mono">0, 1, 2, 3...</div>
                  </div>
                  <div className="mt-2 text-[10px] text-zinc-500 font-mono">-1, -2, -3...</div>
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">1/2, 0.75, -2/3</div>
            </div>
          </div>

          {/* Irrational Numbers */}
          <div className="w-1/3 border-2 border-rose-200 rounded-2xl p-4 bg-rose-50/30">
            <span className="text-sm font-bold text-rose-600">Irrational</span>
            <div className="mt-8 space-y-4 text-[10px] text-zinc-500 font-mono">
              <div className="flex items-center gap-1">π <span className="opacity-50">(3.1415...)</span></div>
              <div className="flex items-center gap-1">√2 <span className="opacity-50">(1.4142...)</span></div>
              <div className="flex items-center gap-1">√17 <span className="opacity-50">(4.1231...)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LessonSets = () => (
  <div className="space-y-8">
    <section className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Classifying Real Numbers</h2>
      <p className="text-zinc-600 leading-relaxed max-w-3xl">
        Just as biologists classify animals based on shared characteristics, mathematicians classify numbers into sets. 
        The set of <strong>Real Numbers</strong> consists of two main groups: Rational and Irrational numbers.
      </p>
    </section>

    <VennDiagram />

    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-3">
        <h3 className="font-bold text-indigo-600 flex items-center gap-2">
          <CheckCircle2 size={18} /> Rational Numbers
        </h3>
        <p className="text-sm text-zinc-600">
          Any number that can be written as a ratio <span className="font-mono italic">a/b</span> where <span className="font-mono italic">a</span> and <span className="font-mono italic">b</span> are integers and <span className="font-mono italic">b ≠ 0</span>.
        </p>
        <ul className="text-xs space-y-1 text-zinc-500 list-disc pl-4">
          <li>Terminating decimals (e.g., 0.5)</li>
          <li>Repeating decimals (e.g., 0.333...)</li>
          <li>Fractions and Integers</li>
        </ul>
      </div>
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-3">
        <h3 className="font-bold text-rose-600 flex items-center gap-2">
          <XCircle size={18} /> Irrational Numbers
        </h3>
        <p className="text-sm text-zinc-600">
          Numbers that <strong>cannot</strong> be written as a ratio of two integers. Their decimal forms are non-terminating and non-repeating.
        </p>
        <ul className="text-xs space-y-1 text-zinc-500 list-disc pl-4">
          <li>π (Pi)</li>
          <li>Square roots of non-perfect squares (e.g., √2, √17)</li>
        </ul>
      </div>
    </div>
  </div>
);

const LessonRationalIrrational = () => (
  <div className="space-y-8">
    <section className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Rational vs. Irrational</h2>
      <p className="text-zinc-600 leading-relaxed max-w-3xl">
        Every rational number can be written as a terminating or repeating decimal. Irrational numbers, however, go on forever without a pattern.
      </p>
    </section>

    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
          <h4 className="font-bold text-indigo-900 mb-4">Example: Writing Fractions as Decimals</h4>
          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-indigo-200">
              <span>1/4</span>
              <ChevronRight size={14} className="text-indigo-300" />
              <span className="font-bold">0.25</span>
              <span className="text-[10px] bg-indigo-100 px-2 py-0.5 rounded text-indigo-600 uppercase">Terminating</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-indigo-200">
              <span>1/3</span>
              <ChevronRight size={14} className="text-indigo-300" />
              <span className="font-bold">0.333...</span>
              <span className="text-[10px] bg-indigo-100 px-2 py-0.5 rounded text-indigo-600 uppercase">Repeating</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 text-white p-6 rounded-xl shadow-xl">
          <h4 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <Sparkles size={18} /> Pro Tip: Perfect Squares
          </h4>
          <p className="text-sm text-zinc-400 mb-4">
            If a number is a perfect square, its square root is <strong>Rational</strong>.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
            <div className="p-2 bg-zinc-800 rounded">√1 = 1</div>
            <div className="p-2 bg-zinc-800 rounded">√4 = 2</div>
            <div className="p-2 bg-zinc-800 rounded">√9 = 3</div>
            <div className="p-2 bg-zinc-800 rounded">√16 = 4</div>
            <div className="p-2 bg-zinc-800 rounded">√25 = 5</div>
            <div className="p-2 bg-zinc-800 rounded">√36 = 6</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <h4 className="font-bold text-zinc-900 mb-4">Finding Square Roots</h4>
        <p className="text-sm text-zinc-600 mb-6">
          Every positive number has two square roots: one positive and one negative.
        </p>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-900 shrink-0">A</div>
            <div>
              <p className="font-bold text-zinc-900">√169 = 13</p>
              <p className="text-xs text-zinc-500 mt-1">Because 13 × 13 = 169</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-900 shrink-0">B</div>
            <div>
              <p className="font-bold text-zinc-900">-√169 = -13</p>
              <p className="text-xs text-zinc-500 mt-1">The negative square root</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LessonOrdering = () => (
  <div className="space-y-8">
    <section className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Ordering Real Numbers</h2>
      <p className="text-zinc-600 leading-relaxed max-w-3xl">
        To compare and order real numbers, we often approximate irrational numbers as decimals.
      </p>
    </section>

    <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-8">
      <div className="space-y-4">
        <h4 className="font-bold text-zinc-900">Step-by-Step: Comparing √3 + 5 and 3 + √5</h4>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600">1</span>
              Approximate
            </div>
            <div className="space-y-2 text-sm">
              <p>√3 is between 1 and 2, so <span className="font-bold">√3 ≈ 1.7</span></p>
              <p>√5 is between 2 and 3, so <span className="font-bold">√5 ≈ 2.2</span></p>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600">2</span>
              Simplify
            </div>
            <div className="space-y-2 text-sm">
              <p>√3 + 5 ≈ 1.7 + 5 = <span className="font-bold text-indigo-600">6.7</span></p>
              <p>3 + √5 ≈ 3 + 2.2 = <span className="font-bold text-rose-600">5.2</span></p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-indigo-600 text-white rounded-xl text-center font-bold">
          Conclusion: √3 + 5 &gt; 3 + √5
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-100">
        <h4 className="font-bold text-zinc-900 mb-6">Number Line Visualization</h4>
        <div className="relative h-20 flex items-center">
          <div className="absolute w-full h-0.5 bg-zinc-300"></div>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
            <div key={n} className="absolute flex flex-col items-center" style={{ left: `${(n / 7) * 100}%` }}>
              <div className="w-0.5 h-3 bg-zinc-400 mb-2"></div>
              <span className="text-xs font-mono text-zinc-500">{n}</span>
            </div>
          ))}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 flex flex-col items-center" 
            style={{ left: `${(3.14 / 7) * 100}%` }}
          >
            <div className="w-2 h-2 bg-rose-500 rounded-full mb-1"></div>
            <span className="text-[10px] font-bold text-rose-600">π</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-0 flex flex-col items-center" 
            style={{ left: `${(1.41 / 7) * 100}%` }}
          >
            <div className="w-2 h-2 bg-indigo-500 rounded-full mb-1"></div>
            <span className="text-[10px] font-bold text-indigo-600">√2</span>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
);

const PracticeSession = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const questions: Question[] = [
    {
      id: 1,
      text: "Which set of numbers does √49 belong to?",
      options: ["Irrational", "Integers, Rational, Real", "Whole, Integers, Rational, Real", "Rational only"],
      correctAnswer: "Whole, Integers, Rational, Real",
      type: "multiple-choice",
      explanation: "√49 = 7. Since 7 is a counting number, it is Whole, an Integer, Rational (7/1), and Real."
    },
    {
      id: 2,
      text: "Is 0.333... (repeating) a rational or irrational number?",
      options: ["Rational", "Irrational"],
      correctAnswer: "Rational",
      type: "multiple-choice",
      explanation: "Repeating decimals are rational because they can be written as a fraction (1/3)."
    },
    {
      id: 3,
      text: "Estimate √10 to the nearest tenth.",
      options: ["3.1", "3.2", "3.5", "4.0"],
      correctAnswer: "3.2",
      type: "multiple-choice",
      explanation: "3² = 9 and 4² = 16. 10 is very close to 9, so √10 is slightly more than 3. 3.2² = 10.24."
    }
  ];

  const handleAnswer = () => {
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold text-zinc-900">Practice Complete!</h2>
        <p className="text-zinc-600">You scored {score} out of {questions.length}</p>
        <button 
          onClick={() => {
            setCurrentQuestion(0);
            setScore(0);
            setIsFinished(false);
            setSelectedOption(null);
            setShowFeedback(false);
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between items-center text-sm font-bold text-zinc-400 uppercase tracking-widest">
        <span>Question {currentQuestion + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-zinc-900">{questions[currentQuestion].text}</h3>
        
        <div className="space-y-3">
          {questions[currentQuestion].options?.map((option) => (
            <button
              key={option}
              disabled={showFeedback}
              onClick={() => setSelectedOption(option)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                selectedOption === option 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-zinc-100 hover:border-zinc-200 text-zinc-600'
              } ${showFeedback && option === questions[currentQuestion].correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}
                ${showFeedback && selectedOption === option && option !== questions[currentQuestion].correctAnswer ? 'border-rose-500 bg-rose-50 text-rose-700' : ''}
              `}
            >
              {option}
            </button>
          ))}
        </div>

        {!showFeedback ? (
          <button
            disabled={!selectedOption}
            onClick={handleAnswer}
            className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold disabled:opacity-50"
          >
            Check Answer
          </button>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className={`p-4 rounded-xl ${selectedOption === questions[currentQuestion].correctAnswer ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              <p className="font-bold flex items-center gap-2">
                {selectedOption === questions[currentQuestion].correctAnswer ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {selectedOption === questions[currentQuestion].correctAnswer ? 'Correct!' : 'Incorrect'}
              </p>
              <p className="text-sm mt-1">{questions[currentQuestion].explanation}</p>
            </div>
            <button
              onClick={nextQuestion}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold"
            >
              Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const GeminiAssistant = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);

  const askGemini = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: query,
        config: {
          systemInstruction: "You are a helpful math tutor specializing in Real Numbers for 8th grade students. Use simple language and clear examples. Always use Google Search to verify facts about recent mathematical discoveries or specific real-world data if requested.",
          tools: [{ googleSearch: {} }]
        }
      });

      setResponse(result.text || "I'm sorry, I couldn't generate a response.");
      setSources(result.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
    } catch (error) {
      console.error(error);
      setResponse("An error occurred while connecting to the AI assistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 text-white shadow-2xl border border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Sparkles size={18} />
        </div>
        <div>
          <h3 className="font-bold">AI Math Tutor</h3>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Powered by Gemini</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askGemini()}
            placeholder="Ask a question about real numbers..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button 
            onClick={askGemini}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </button>
        </div>

        <AnimatePresence>
          {response && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-xl p-4 text-sm leading-relaxed border border-white/5"
            >
              <div className="whitespace-pre-wrap text-zinc-300">{response}</div>
              
              {sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((chunk, i) => chunk.web && (
                      <a 
                        key={i} 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-colors truncate max-w-[150px]"
                      >
                        {chunk.web.title || 'Source'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setImageUrl('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: `A clean, educational mathematical illustration of: ${prompt}. Minimalist style, high contrast, suitable for a textbook.` }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: size
          }
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
          <ImageIcon size={18} />
        </div>
        <div>
          <h3 className="font-bold text-zinc-900">Visual Aid Generator</h3>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Generate diagrams with AI</p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a math concept to visualize (e.g., 'A number line showing square roots')..."
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[100px]"
        />
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {(["1K", "2K", "4K"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                  size === s ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button 
            onClick={generateImage}
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Generate
          </button>
        </div>

        <AnimatePresence>
          {imageUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-xl overflow-hidden border border-zinc-200 shadow-lg"
            >
              <img src={imageUrl} alt="Generated visual aid" className="w-full h-auto" referrerPolicy="no-referrer" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('sets');

  const tabs = [
    { id: 'sets', label: 'Sets & Hierarchy', icon: Layers },
    { id: 'rational-irrational', label: 'Rational vs Irrational', icon: HelpCircle },
    { id: 'ordering', label: 'Estimating & Ordering', icon: ArrowRightLeft },
    { id: 'practice', label: 'Interactive Practice', icon: PenTool },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-8">
            {/* Tabs Navigation */}
            <nav className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-zinc-200 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-[600px]"
            >
              {activeTab === 'sets' && <LessonSets />}
              {activeTab === 'rational-irrational' && <LessonRationalIrrational />}
              {activeTab === 'ordering' && <LessonOrdering />}
              {activeTab === 'practice' && <PracticeSession />}
            </motion.div>
          </div>

          {/* Sidebar Tools */}
          <aside className="space-y-6">
            <GeminiAssistant />
            <ImageGenerator />
            
            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-2">Lesson Progress</h4>
              <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                <div className="w-1/4 h-full bg-indigo-600"></div>
              </div>
              <p className="text-[10px] text-indigo-500 mt-2 font-bold uppercase tracking-widest">25% Complete</p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <BookOpen size={20} />
            <span className="font-bold tracking-tight">Real Numbers Masterclass</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-zinc-400 uppercase tracking-widest">
            <a href="#" className="hover:text-zinc-900 transition-colors">Curriculum</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Resources</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
