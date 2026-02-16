
import React, { useState } from 'react';
import { Question, LessonType } from '../types';
import PythagoreanVisualizer from './PythagoreanVisualizer';

interface QuizProps {
  questions: Question[];
  onFinish: (score: number, userAnswers: number[]) => void;
  accentColor: string;
}

const Quiz: React.FC<QuizProps> = ({ questions, onFinish, accentColor }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [allAnswers, setAllAnswers] = useState<number[]>([]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = () => {
    if (selectedOption === null) return;
    
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const updatedAnswers = [...allAnswers, selectedOption];
    setAllAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      const finalScore = score + (selectedOption === currentQuestion.correctAnswer ? 1 : 0);
      onFinish(finalScore, updatedAnswers);
    }
  };

  if (!currentQuestion) return <div>Loading questions...</div>;

  const getVisualType = () => {
    if (currentQuestion.data?.visualType) return currentQuestion.data.visualType;
    if (currentQuestion.type === LessonType.DISTANCE || currentQuestion.type === LessonType.COORDINATE_GEOMETRY) return 'plane';
    return 'triangle';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest font-black text-gray-400 mb-1">Progress</span>
          <span className="text-sm font-bold text-gray-700">{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="h-3 w-64 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div 
            className="h-full transition-all duration-700 ease-out"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, backgroundColor: accentColor }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-2 md:p-6 border-0">
        <div className="mb-6 flex items-center">
            <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                Question {currentIndex + 1}
            </span>
            {currentQuestion.data && (
                <span className="ml-3 px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center">
                    <span className="mr-1 inline-block w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                    Visual aid active
                </span>
            )}
        </div>
        <h3 className="text-2xl font-black text-gray-900 leading-tight mb-8">{currentQuestion.text}</h3>

        {currentQuestion.data && (
          <div className="mb-10 transition-all duration-500 ease-in-out transform hover:scale-[1.01]">
            <PythagoreanVisualizer 
              type={getVisualType()} 
              data={getVisualType() === 'plane' ? {
                points: [
                  { x: currentQuestion.data.x1 || 0, y: currentQuestion.data.y1 || 0 },
                  { x: currentQuestion.data.x2 || 3, y: currentQuestion.data.y2 || 4 }
                ]
              } : {
                a: currentQuestion.data.a || 3,
                b: currentQuestion.data.b || 4
              }}
            />
          </div>
        )}

        <div className="grid gap-4">
          {currentQuestion.options.map((option, idx) => {
            let buttonClass = "group relative p-5 text-left border-2 rounded-2xl transition-all duration-300 overflow-hidden ";
            let labelClass = "mr-5 w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-colors ";
            
            if (isAnswered) {
              if (idx === currentQuestion.correctAnswer) {
                buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold translate-x-1";
                labelClass += "bg-emerald-500 text-white";
              } else if (idx === selectedOption) {
                buttonClass += "border-rose-500 bg-rose-50 text-rose-900";
                labelClass += "bg-rose-500 text-white";
              } else {
                buttonClass += "border-gray-100 text-gray-400 opacity-50";
                labelClass += "bg-gray-100 text-gray-400";
              }
            } else {
              if (idx === selectedOption) {
                buttonClass += "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-lg -translate-y-1";
                labelClass += "bg-indigo-600 text-white";
              } else {
                buttonClass += "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md text-gray-700";
                labelClass += "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => setSelectedOption(idx)}
                className={buttonClass}
              >
                <div className="flex items-center relative z-10">
                  <span className={labelClass}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-lg">{option}</span>
                </div>
                {isAnswered && idx === currentQuestion.correctAnswer && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <div className="mt-8 p-8 bg-indigo-50 border-2 border-indigo-100 rounded-[2rem] text-indigo-900 animate-in fade-in zoom-in duration-500">
          <div className="flex items-center mb-3">
            <span className="bg-indigo-600 text-white p-1 rounded-lg mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <p className="font-black uppercase tracking-widest text-xs">Step-by-Step Logic</p>
          </div>
          <p className="text-lg font-medium leading-relaxed">{currentQuestion.explanation}</p>
        </div>
      )}

      <div className="flex justify-end pt-8">
        {!isAnswered ? (
          <button
            onClick={handleAnswer}
            disabled={selectedOption === null}
            className={`px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 ${
              selectedOption === null ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-gray-900 text-white hover:bg-black hover:shadow-gray-200'
            }`}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className={`px-12 py-4 rounded-2xl font-black text-lg text-white transition-all shadow-xl active:scale-95 hover:opacity-90`}
            style={{ backgroundColor: accentColor }}
          >
            {currentIndex === questions.length - 1 ? 'Finish Assessment' : 'Continue Journey'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
