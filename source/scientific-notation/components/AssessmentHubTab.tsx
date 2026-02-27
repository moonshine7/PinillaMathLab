
import React, { useState } from 'react';
import { TestAssessment, Problem } from '../types';
import { generateFullAssessment } from '../services/geminiService';

const AssessmentHubTab: React.FC = () => {
  const [assessment, setAssessment] = useState<TestAssessment | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState<'hub' | 'digital' | 'print'>('hub');
  
  // Digital Taking State
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<{ score: number; total: number } | null>(null);

  const createTest = async () => {
    setIsGenerating(true);
    const newTest = await generateFullAssessment();
    if (newTest) {
      setAssessment(newTest);
      setUserAnswers({});
      setTestResult(null);
    }
    setIsGenerating(false);
  };

  const handleDigitalSubmit = () => {
    if (!assessment) return;
    let correct = 0;
    assessment.problems.forEach(p => {
      const userRaw = userAnswers[p.id] || '';
      const normUser = userRaw.replace(/\s/g, '').toLowerCase().replace('x', '*');
      const normAns = p.answer.replace(/\s/g, '').toLowerCase().replace('x', '*').replace(/,/g, '');
      const normStandard = p.answer.replace(/,/g, '').replace(/\s/g, '');
      
      if (normUser === normAns || normUser === normStandard) {
        correct++;
      }
    });
    setTestResult({ score: correct, total: assessment.problems.length });
  };

  const handlePrint = () => {
    window.print();
  };

  if (view === 'print' && assessment) {
    return (
      <div className="bg-white min-h-screen p-12 text-black font-serif print:p-0">
        <div className="max-w-4xl mx-auto border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tighter">{assessment.title}</h1>
            <p className="mt-1">Scientific Notation Assessment • Date: _______________</p>
          </div>
          <div className="text-right">
            <p>Name: _________________________</p>
            <p className="mt-1">Class: _________________________</p>
          </div>
        </div>

        <div className="space-y-12 mb-20">
          {assessment.problems.map((p, idx) => (
            <div key={p.id} className="break-inside-avoid">
              <p className="text-lg font-bold mb-3">{idx + 1}. {p.scenario ? p.scenario + ' ' : ''}Convert {p.question} to {p.type === 'toScientific' ? 'Scientific' : 'Standard'} notation.</p>
              <div className="mt-4 border-b border-dotted border-black h-10 w-full max-w-md"></div>
              <p className="text-xs text-slate-400 mt-1 italic">Score: ____ / 1</p>
            </div>
          ))}
        </div>

        <div className="print:hidden fixed bottom-8 right-8 flex gap-4">
          <button onClick={() => setView('hub')} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg">Back to Hub</button>
          <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Now
          </button>
        </div>
      </div>
    );
  }

  if (view === 'digital' && assessment) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{assessment.title}</h2>
            <p className="text-slate-500">Digital Interactive Assessment</p>
          </div>
          <button onClick={() => setView('hub')} className="text-slate-500 hover:text-slate-800 font-medium">Cancel Test</button>
        </div>

        {!testResult ? (
          <div className="space-y-6">
            {assessment.problems.map((p, idx) => (
              <div key={p.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex gap-4 items-start">
                  <span className="bg-indigo-100 text-indigo-700 font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0">{idx + 1}</span>
                  <div className="flex-grow">
                    <p className="text-lg text-slate-700 font-medium mb-6">
                      {p.scenario && <span className="block italic text-slate-500 text-sm mb-2">{p.scenario}</span>}
                      Express <span className="font-mono bg-slate-100 px-2 py-1 rounded text-indigo-600">{p.question}</span> in {p.type === 'toScientific' ? 'Scientific Notation' : 'Standard Notation'}.
                    </p>
                    <input 
                      type="text" 
                      placeholder="Type answer here..."
                      className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 outline-none font-mono"
                      value={userAnswers[p.id] || ''}
                      onChange={(e) => setUserAnswers({ ...userAnswers, [p.id]: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={handleDigitalSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all"
            >
              Grade My Assessment
            </button>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl text-center shadow-xl border border-slate-200">
             <div className="text-6xl font-black text-indigo-600 mb-4">{Math.round((testResult.score / testResult.total) * 100)}%</div>
             <p className="text-xl text-slate-600 mb-8 font-medium">You scored {testResult.score} out of {testResult.total}!</p>
             <button onClick={() => setView('hub')} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg">Back to Hub</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-4">Assessment Creator</h2>
          <p className="text-indigo-100 text-lg max-w-xl mb-8 leading-relaxed">
            Generate customized, AI-powered tests on Scientific Notation. 
            Choose between a focused digital experience or a formatted printable sheet for your classroom.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={createTest}
              disabled={isGenerating}
              className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                  Generating Unique Exam...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Generate New Assessment
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Background blobs for aesthetic */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
      </div>

      {assessment ? (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8">
          {/* Printable Option */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm group hover:border-indigo-400 transition-colors">
            <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
              <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Printable Handout</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Formatted for standard A4/Letter printing with clean lines, scoring sections, and professional layout. Perfect for physical classroom use.
            </p>
            <button 
              onClick={() => setView('print')}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-md hover:bg-slate-800 transition-colors"
            >
              Generate Printable PDF
            </button>
          </div>

          {/* Digital Option */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm group hover:border-emerald-400 transition-colors">
            <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
              <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Digital Assessment</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Take the test interactively on this device. Instant grading, focused environment, and paper-free learning.
            </p>
            <button 
              onClick={() => setView('digital')}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-md hover:bg-emerald-500 transition-colors"
            >
              Start Digital Exam
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M8 15h8"/></svg>
          <h3 className="text-xl font-bold text-slate-400">No Assessment Loaded</h3>
          <p className="text-slate-400">Click the button above to generate your first custom test!</p>
        </div>
      )}
    </div>
  );
};

export default AssessmentHubTab;
