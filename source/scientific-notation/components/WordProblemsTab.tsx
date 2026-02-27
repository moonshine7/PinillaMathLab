
import React, { useState, useEffect } from 'react';
import { Problem } from '../types';
import { getTutorExplanation, generateScenarioImage, generateDynamicWordProblem } from '../services/geminiService';

const WordProblemsTab: React.FC = () => {
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [mantissa, setMantissa] = useState('');
  const [exponent, setExponent] = useState('');
  const [standardInput, setStandardInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'none', msg: string }>({ type: 'none', msg: '' });
  const [showHint, setShowHint] = useState(false);
  const [isAskingTutor, setIsAskingTutor] = useState(false);
  const [tutorReply, setTutorReply] = useState<string | null>(null);
  const [scenarioImage, setScenarioImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    fetchNewProblem();
  }, []);

  const fetchNewProblem = async () => {
    setIsGenerating(true);
    setScenarioImage(null);
    setFeedback({ type: 'none', msg: '' });
    setTutorReply(null);
    setShowHint(false);
    setMantissa('');
    setExponent('');
    setStandardInput('');

    const problem = await generateDynamicWordProblem(history);
    
    if (problem) {
      setCurrentProblem(problem);
      setHistory(prev => [...prev, problem.scenario || ''].slice(-10));
      
      const imageUrl = await generateScenarioImage(problem.imagePrompt || problem.context || 'scientific concept');
      setScenarioImage(imageUrl);
    }
    setIsGenerating(false);
  };

  const checkAnswer = () => {
    if (!currentProblem) return;

    let combinedInput = '';
    if (currentProblem.type === 'toScientific') {
      if (!mantissa || !exponent) {
        setFeedback({ type: 'error', msg: 'Please fill in both fields.' });
        return;
      }
      combinedInput = `${mantissa}x10^${exponent}`;
    } else {
      combinedInput = standardInput;
    }

    const normalizedUser = combinedInput.replace(/\s/g, '').toLowerCase().replace('x', '*');
    const normalizedAnswer = currentProblem.answer.replace(/\s/g, '').toLowerCase().replace('x', '*').replace(/,/g, '');
    
    // Check for standard format as well
    const normalizedStandard = currentProblem.answer.replace(/,/g, '');

    if (normalizedUser === normalizedAnswer || normalizedUser === normalizedStandard.replace(/\s/g, '')) {
      setFeedback({ type: 'success', msg: 'Perfect! You successfully applied scientific notation to this scenario.' });
    } else {
      setFeedback({ type: 'error', msg: 'Almost there! Check the scenario again and your decimal jumps.' });
    }
  };

  const askTutor = async () => {
    if (!currentProblem) return;
    setIsAskingTutor(true);
    const userDisplay = currentProblem.type === 'toScientific' ? `${mantissa} × 10^${exponent}` : standardInput;
    const explanation = await getTutorExplanation(
      `Scenario: ${currentProblem.scenario}. How do I convert "${currentProblem.question}"? My current attempt is ${userDisplay}.`,
      `The student is working on a real-world application in ${currentProblem.context}.`
    );
    setTutorReply(explanation || "I'm having a hard time with that scenario. Let's try to focus on the decimal jumps!");
    setIsAskingTutor(false);
  };

  if (isGenerating && !currentProblem) {
    return (
      <div className="max-w-4xl mx-auto h-[600px] bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Generating Fresh Scenario...</h3>
        <p className="text-slate-500">Our AI Math Lab is crafting a unique real-world problem just for you.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-emerald-600 px-8 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span className="font-bold uppercase tracking-wider text-xs">AI-Generated Application</span>
          </div>
          {currentProblem && (
            <span className="bg-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
              {currentProblem.context}
            </span>
          )}
        </div>
        
        <div className="p-0 border-b border-slate-100">
          <div className="relative aspect-video bg-slate-100 w-full overflow-hidden">
            {!scenarioImage ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <span className="text-sm font-medium animate-pulse">Visualizing scenario...</span>
              </div>
            ) : (
              <img 
                src={scenarioImage} 
                alt={currentProblem?.context} 
                className="w-full h-full object-cover animate-in fade-in duration-700"
              />
            )}
            <div className="absolute bottom-4 left-4">
              <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold py-1 px-3 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                AI Visual Context
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {currentProblem ? (
            <>
              <div className="text-center mb-8">
                <p className="text-xl md:text-2xl text-slate-700 leading-relaxed font-medium">
                  "{currentProblem.scenario}"
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-center border border-slate-100">
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-tight mb-2">
                  Question: Express the value in {currentProblem.type === 'toScientific' ? 'Scientific Notation' : 'Standard Notation'}
                </h3>
                <div className="text-3xl font-bold text-slate-800 font-mono">
                  {currentProblem.question}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-10">
                {currentProblem.type === 'toScientific' ? (
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
                    placeholder="Standard number..."
                    className="w-full md:w-72 p-4 text-2xl font-mono text-center rounded-xl border-2 border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all placeholder:text-green-700/40"
                  />
                )}
                
                <button 
                  onClick={checkAnswer}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-10 py-5 rounded-xl shadow-lg transition-transform active:scale-95 w-full md:w-auto"
                >
                  Verify Application
                </button>
              </div>

              {feedback.type !== 'none' && (
                <div className={`p-4 rounded-xl mb-6 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                  feedback.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  <span className="font-semibold">{feedback.msg}</span>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-6">
                <button 
                  onClick={() => setShowHint(!showHint)}
                  className="text-slate-500 hover:text-emerald-600 flex items-center gap-2 font-medium transition-colors"
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  {showHint ? "Hide Hint" : "Get a Hint"}
                </button>
                <button 
                  onClick={askTutor}
                  disabled={isAskingTutor}
                  className="text-amber-600 hover:text-amber-700 flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  {isAskingTutor ? "Consulting expert..." : "Ask AI Tutor"}
                </button>
                <button 
                  onClick={fetchNewProblem}
                  disabled={isGenerating}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? "Generating..." : "Next Random Scenario"}
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                </button>
              </div>

              {showHint && (
                <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 text-sm italic animate-in fade-in slide-in-from-bottom-2 text-center">
                  💡 {currentProblem.hint}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {tutorReply && (
        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-sm animate-in slide-in-from-right-4">
          <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold">
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 12L2.1 12.3"/><path d="M12 12l9.8 3.6"/><path d="M12 12l-5.2 8.5"/></svg>
            Context Explanation
          </div>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{tutorReply}</p>
        </div>
      )}
    </div>
  );
};

export default WordProblemsTab;
