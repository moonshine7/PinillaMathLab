
import React, { useState } from 'react';
import { Problem } from '../types';

const TEST_QUESTIONS: Problem[] = [
  { id: 't1', type: 'toScientific', question: '250,000', answer: '2.5x10^5', hint: '', difficulty: 'easy' },
  { id: 't2', type: 'toScientific', question: '0.000003', answer: '3.0x10^-6', hint: '', difficulty: 'easy' },
  { id: 't3', type: 'toStandard', question: '7.149 x 10^7', answer: '71,490,000', hint: '', difficulty: 'medium' },
  { id: 't4', type: 'toStandard', question: '1.25 x 10^-10', answer: '0.000000000125', hint: '', difficulty: 'hard' },
  { id: 't5', type: 'toScientific', question: '41,200', answer: '4.12x10^4', hint: '', difficulty: 'medium' }
];

interface AnswerState {
  mantissa: string;
  exponent: string;
  standard: string;
}

const TestTab: React.FC = () => {
  const [answers, setAnswers] = useState<AnswerState[]>(
    new Array(TEST_QUESTIONS.length).fill(null).map(() => ({ mantissa: '', exponent: '', standard: '' }))
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let correctCount = 0;
    TEST_QUESTIONS.forEach((q, idx) => {
      let combinedUser = '';
      if (q.type === 'toScientific') {
        combinedUser = `${answers[idx].mantissa}x10^${answers[idx].exponent}`;
      } else {
        combinedUser = answers[idx].standard;
      }

      const normalizedUser = combinedUser.replace(/\s/g, '').toLowerCase().replace('x', '*');
      const normalizedAnswer = q.answer.replace(/\s/g, '').toLowerCase().replace('x', '*').replace(/,/g, '');
      const normalizedStandardAnswer = q.answer.replace(/,/g, '');
      
      if (normalizedUser === normalizedAnswer || normalizedUser === normalizedStandardAnswer.replace(/\s/g, '')) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  const resetTest = () => {
    setAnswers(new Array(TEST_QUESTIONS.length).fill(null).map(() => ({ mantissa: '', exponent: '', standard: '' })));
    setSubmitted(false);
    setScore(0);
  };

  if (submitted) {
    const percentage = (score / TEST_QUESTIONS.length) * 100;
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-200">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
          percentage >= 80 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
        }`}>
          <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 12L2.1 12.3"/><path d="M12 12l9.8 3.6"/><path d="M12 12l-5.2 8.5"/></svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Test Complete!</h2>
        <p className="text-slate-500 mb-8">You scored {score} out of {TEST_QUESTIONS.length}</p>
        
        <div className="text-6xl font-black text-indigo-600 mb-10">{percentage}%</div>
        
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-4">
          <h3 className="font-bold text-slate-700 border-b border-slate-200 pb-2">Results Breakdown:</h3>
          {TEST_QUESTIONS.map((q, i) => {
            let combinedUser = q.type === 'toScientific' ? `${answers[i].mantissa}x10^${answers[i].exponent}` : answers[i].standard;
            const isCorrect = combinedUser.replace(/\s/g, '').toLowerCase().replace('x', '*') === q.answer.replace(/\s/g, '').toLowerCase().replace('x', '*').replace(/,/g, '');
            return (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Q{i+1}: {q.question}</span>
                <span className={`font-mono font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                  {isCorrect ? '✓ Correct' : `✗ Expected: ${q.answer}`}
                </span>
              </div>
            );
          })}
        </div>

        <button 
          onClick={resetTest}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Knowledge Check</h2>
          <p className="text-slate-500">Show what you've learned about scientific notation.</p>
        </div>
        <div className="text-slate-400 font-mono text-sm">
          Timer: 05:00
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {TEST_QUESTIONS.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:border-indigo-300">
            <div className="flex items-start gap-4">
              <div className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">
                {idx + 1}
              </div>
              <div className="flex-grow">
                <p className="text-slate-700 mb-6 font-medium">
                  Convert <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{q.question}</span> to {q.type === 'toScientific' ? 'scientific notation' : 'standard notation'}.
                </p>
                
                {q.type === 'toScientific' ? (
                  <div className="flex items-center gap-2 bg-green-50 p-4 rounded-xl border border-green-100 w-fit">
                    <input 
                      type="text" 
                      value={answers[idx].mantissa}
                      onChange={(e) => {
                        const newAns = [...answers];
                        newAns[idx].mantissa = e.target.value;
                        setAnswers(newAns);
                      }}
                      required
                      placeholder="Coeff"
                      className="w-20 p-2 text-xl font-mono text-center rounded-lg border border-green-300 bg-white text-green-900 focus:ring-2 focus:ring-green-100 outline-none"
                    />
                    <span className="text-xl font-bold text-green-700">× 10</span>
                    <div className="relative -top-3">
                      <input 
                        type="text" 
                        value={answers[idx].exponent}
                        onChange={(e) => {
                          const newAns = [...answers];
                          newAns[idx].exponent = e.target.value;
                          setAnswers(newAns);
                        }}
                        required
                        placeholder="n"
                        className="w-10 p-1 text-sm font-mono text-center rounded border border-green-300 bg-white text-green-900 focus:ring-2 focus:ring-green-100 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <input 
                    type="text" 
                    value={answers[idx].standard}
                    onChange={(e) => {
                      const newAns = [...answers];
                      newAns[idx].standard = e.target.value;
                      setAnswers(newAns);
                    }}
                    required
                    placeholder="Type standard number..."
                    className="w-full p-4 rounded-xl border border-green-300 bg-green-50 text-green-900 focus:ring-2 focus:ring-green-100 outline-none transition-all font-mono"
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="pt-8">
          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 group"
          >
            Submit My Answers
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestTab;
