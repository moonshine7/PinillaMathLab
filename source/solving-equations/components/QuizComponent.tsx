import React, { useState } from 'react';
import { QuizData, QuizQuestion } from '../types';
import { CheckCircle, XCircle, Trophy, RefreshCw, AlertCircle, X } from 'lucide-react';

interface QuizComponentProps {
  quizData: QuizData;
  onRegenerate: () => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quizData, onRegenerate }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: number, optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateScore = () => {
    let score = 0;
    quizData.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });
    return score;
  };

  const score = calculateScore();
  const percentage = Math.round((score / quizData.questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{quizData.title}</h2>
        <p className="text-slate-500">Test your knowledge on Equations and Inequalities!</p>
        
        {submitted && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col items-center gap-2">
               <div className="p-3 bg-indigo-100 rounded-full">
                 <Trophy className="w-8 h-8 text-indigo-600" />
               </div>
               <h3 className="text-xl font-bold text-indigo-900">You scored {percentage}%</h3>
               <p className="text-indigo-700">
                 {score} out of {quizData.questions.length} correct
               </p>
            </div>
            <div className="mt-4">
               <button 
                 onClick={onRegenerate}
                 className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
               >
                 <RefreshCw className="w-4 h-4" />
                 Generate New Quiz
               </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {quizData.questions.map((q, index) => {
          const isSelected = selectedAnswers[q.id] !== undefined;
          const userSelected = selectedAnswers[q.id];
          const isCorrect = userSelected === q.correctAnswerIndex;

          return (
            <div key={q.id} className={`bg-white p-6 rounded-xl shadow-sm border transition-colors duration-500 relative overflow-hidden ${submitted ? (isCorrect ? 'border-green-200' : 'border-red-200') : 'border-slate-200'}`}>
              {/* Question Header */}
              <div className="flex justify-between items-start mb-4">
                 <h3 className="text-lg font-semibold text-slate-800 pr-8">
                   <span className="text-slate-400 mr-2 text-sm">#{index + 1}</span>
                   {q.question}
                 </h3>
                 <span className={`text-xs px-2 py-1 rounded-full border ${q.topic === 'Inequality' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                   {q.topic}
                 </span>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((option, optIdx) => {
                  let btnClass = "w-full text-left p-3 rounded-lg border transition-all ";
                  
                  if (submitted) {
                     if (optIdx === q.correctAnswerIndex) {
                        btnClass += "bg-green-50 border-green-500 text-green-800 font-medium ring-1 ring-green-500";
                     } else if (userSelected === optIdx && userSelected !== q.correctAnswerIndex) {
                        btnClass += "bg-red-50 border-red-500 text-red-800";
                     } else {
                        btnClass += "bg-white border-slate-200 opacity-60";
                     }
                  } else {
                     if (userSelected === optIdx) {
                        btnClass += "bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500";
                     } else {
                        btnClass += "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300";
                     }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(q.id, optIdx)}
                      disabled={submitted}
                      className={btnClass}
                    >
                      <div className="flex items-center justify-between">
                         <span>{option}</span>
                         {submitted && optIdx === q.correctAnswerIndex && <CheckCircle className="w-5 h-5 text-green-600" />}
                         {submitted && userSelected === optIdx && userSelected !== q.correctAnswerIndex && <XCircle className="w-5 h-5 text-red-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Feedback */}
              {submitted && (
                <div className={`mt-4 p-4 rounded-lg border text-sm flex gap-3 items-start animate-in fade-in slide-in-from-top-2 ${
                    isCorrect 
                        ? 'bg-green-50 border-green-100 text-green-900' 
                        : 'bg-red-50 border-red-100 text-red-900'
                }`}>
                  {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold mb-1 text-base">
                        {isCorrect ? "Correct Answer!" : "Incorrect"}
                    </p>
                    <p className={isCorrect ? 'text-green-800' : 'text-red-800'}>
                        {q.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(selectedAnswers).length < quizData.questions.length}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full shadow-lg text-lg font-bold transition-transform hover:scale-105"
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;