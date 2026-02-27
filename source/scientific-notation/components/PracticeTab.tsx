
import React, { useState, useEffect } from 'react';
import { Problem } from '../types';
import { getTutorExplanation } from '../services/geminiService';

interface PracticeTabProps {
  problems: Problem[];
  title: string;
  theme: 'blue' | 'rose';
}

const PracticeTab: React.FC<PracticeTabProps> = ({ problems, title, theme }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mantissa, setMantissa] = useState('');
  const [exponent, setExponent] = useState('');
  const [standardInput, setStandardInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'none', msg: string }>({ type: 'none', msg: '' });
  const [showHint, setShowHint] = useState(false);
  const [isAskingTutor, setIsAskingTutor] = useState(false);
  const [tutorReply, setTutorReply] = useState<string | null>(null);

  const problem = problems[currentIndex];

  useEffect(() => {
    resetInputs();
  }, [currentIndex, problems]);

  const resetInputs = () => {
    setMantissa('');
    setExponent('');
    setStandardInput('');
    setFeedback({ type: 'none', msg: '' });
    setShowHint(false);
    setTutorReply(null);
  };

  const checkAnswer = () => {
    let combinedInput = '';
    if (problem.type === 'toScientific') {
      if (!mantissa || !exponent) {
        setFeedback({ type: 'error', msg: 'Please fill in both the coefficient and the power.' });
        return;
      }
      combinedInput = `${mantissa}x10^${exponent}`;
    } else {
      combinedInput = standardInput;
    }

    const normalizedUser = combinedInput.replace(/\s/g, '').toLowerCase().replace('x', '*');
    const normalizedAnswer = problem.answer.replace(/\s/g, '').toLowerCase().replace('x', '*');
    
    if (normalizedUser === normalizedAnswer) {
      setFeedback({ type: 'success', msg: 'Great job! That is correct.' });
    } else {
      setFeedback({ type: 'error', msg: 'Not quite. Try checking your decimal placement or the power.' });
    }
  };

  const nextProblem = () => {
    setCurrentIndex((prev) => (prev + 1) % problems.length);
  };

  const askTutor = async () => {
    setIsAskingTutor(true);
    const userDisplay = problem.type === 'toScientific' ? `${mantissa} × 10^${exponent}` : standardInput;
    const explanation = await getTutorExplanation(
      `Can you explain how to convert ${problem.question} to ${problem.type === 'toScientific' ? 'scientific' : 'standard'} notation? My current attempt is ${userDisplay}.`,
      `The user is working on converting ${problem.question}. The hint given is: ${problem.hint}`
    );
    setTutorReply(explanation || "I'm not sure how to explain that right now.");
    setIsAskingTutor(false);
  };

  const themeClasses = {
    blue: {
      header: 'bg-indigo-600',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      accent: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    rose: {
      header: 'bg-rose-600',
      button: 'bg-rose-600 hover:bg-rose-700',
      accent: 'text-rose-600',
      bg: 'bg-rose-50',
    }
  }[theme];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className={`${themeClasses.header} px-8 py-4 text-white flex justify-between items-center transition-colors`}>
          <span className="font-bold uppercase tracking-wider text-xs opacity-80">{title} • {currentIndex + 1} of {problems.length}</span>
          <div className="flex gap-1">
            {problems.map((_, i) => (
              <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${i === currentIndex ? 'bg-white w-8' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>
        
        <div className="p-8 md:p-12 text-center">
          <h3 className="text-slate-500 font-medium mb-4">
            Convert the following to {problem.type === 'toScientific' ? 'Scientific Notation' : 'Standard Notation'}:
          </h3>
          <div className="text-4xl md:text-5xl font-bold text-slate-800 mb-8 font-mono">
            {problem.question}
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-10">
            {problem.type === 'toScientific' ? (
              <div className="flex items-center gap-2 bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                <input 
                  type="text" 
                  value={mantissa}
                  onChange={(e) => setMantissa(e.target.value)}
                  placeholder="1.23"
                  className="w-24 md:w-32 p-3 text-2xl font-mono text-center rounded-xl border border-green-300 bg-white text-green-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all placeholder:text-green-200"
                />
                <span className="text-3xl font-bold text-green-700 mx-1">×</span>
                <div className="flex items-start">
                   <span className="text-3xl font-bold text-green-700">10</span>
                   <div className="relative -top-4 -right-1">
                      <input 
                        type="text" 
                        value={exponent}
                        onChange={(e) => setExponent(e.target.value)}
                        placeholder="n"
                        className="w-12 p-2 text-lg font-mono text-center rounded-lg border border-green-300 bg-white text-green-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all placeholder:text-green-200"
                      />
                   </div>
                </div>
              </div>
            ) : (
              <input 
                type="text" 
                value={standardInput}
                onChange={(e) => setStandardInput(e.target.value)}
                placeholder="e.g. 12300"
                className="w-full md:w-64 p-4 text-2xl font-mono text-center rounded-xl border-2 border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all placeholder:text-green-700/40"
              />
            )}
            
            <button 
              onClick={checkAnswer}
              className={`${themeClasses.button} text-white font-bold px-10 py-5 rounded-xl shadow-lg transition-all active:scale-95 w-full md:w-auto`}
            >
              Check Answer
            </button>
          </div>

          {feedback.type !== 'none' && (
            <div className={`p-4 rounded-xl mb-6 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2 ${
              feedback.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {feedback.type === 'success' ? (
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              ) : (
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              )}
              <span className="font-semibold">{feedback.msg}</span>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={() => setShowHint(!showHint)}
              className={`text-slate-500 hover:${themeClasses.accent} flex items-center gap-2 font-medium transition-colors`}
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              {showHint ? "Hide Hint" : "Need a Hint?"}
            </button>
            <button 
              onClick={askTutor}
              disabled={isAskingTutor}
              className="text-amber-600 hover:text-amber-700 flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 12L2.1 12.3"/><path d="M12 12l9.8 3.6"/><path d="M12 12l-5.2 8.5"/></svg>
              {isAskingTutor ? "Tutor is thinking..." : "Ask AI Tutor"}
            </button>
            {feedback.type === 'success' && (
              <button 
                onClick={nextProblem}
                className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-md active:scale-95"
              >
                Next Problem
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            )}
          </div>

          {showHint && (
            <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 text-sm italic animate-in fade-in slide-in-from-bottom-2">
              💡 Hint: {problem.hint}
            </div>
          )}
        </div>
      </div>

      {tutorReply && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 shadow-sm animate-in slide-in-from-right-4">
          <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold">
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            AI Math Tutor
          </div>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{tutorReply}</p>
        </div>
      )}
    </div>
  );
};

export default PracticeTab;
