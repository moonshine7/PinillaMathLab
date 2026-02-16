
import React, { useState, useEffect } from 'react';
import { LessonType, Question, Difficulty } from './types';
import { generateQuestions } from './services/geminiService';
import Quiz from './components/Quiz';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LessonType>(LessonType.THEOREM);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  useEffect(() => {
    loadQuestions();
  }, [activeTab, difficulty]);

  const loadQuestions = async () => {
    setLoading(true);
    setScore(null);
    setUserAnswers([]);
    const count = activeTab === LessonType.FINAL_EXAM ? 20 : 5;
    const q = await generateQuestions(activeTab, difficulty, count);
    setQuestions(q);
    setLoading(false);
  };

  const getThemeColor = (type: LessonType) => {
    switch (type) {
      case LessonType.THEOREM: return { primary: '#4f46e5', secondary: '#818cf8', bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50' };
      case LessonType.CONVERSE: return { primary: '#10b981', secondary: '#34d399', bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50' };
      case LessonType.COORDINATE_GEOMETRY: return { primary: '#9333ea', secondary: '#a855f7', bg: 'bg-purple-600', text: 'text-purple-600', light: 'bg-purple-50' };
      case LessonType.DISTANCE: return { primary: '#0891b2', secondary: '#22d3ee', bg: 'bg-cyan-600', text: 'text-cyan-600', light: 'bg-cyan-50' };
      case LessonType.FINAL_EXAM: return { primary: '#f59e0b', secondary: '#fbbf24', bg: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-50' };
    }
  };

  const handleFinish = (finalScore: number, answers: number[]) => {
    setScore(finalScore);
    setUserAnswers(answers);
  };

  const theme = getThemeColor(activeTab);
  const wrongAnswers = questions.filter((q, idx) => userAnswers[idx] !== q.correctAnswer);

  const isGridTab = activeTab === LessonType.COORDINATE_GEOMETRY;

  return (
    <div className={`min-h-screen pb-20 transition-all duration-500 ${isGridTab ? 'bg-slate-50' : 'bg-[#fafafa]'}`}>
      <style>{`
        .math-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(226, 232, 240, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(226, 232, 240, 0.5) 1px, transparent 1px);
        }
      `}</style>

      {/* Header */}
      <header className={`${theme.bg} text-white py-14 px-6 shadow-2xl transition-colors duration-500 relative overflow-hidden`}>
        {isGridTab && <div className="absolute inset-0 opacity-10 math-grid" />}
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center space-x-4 mb-3">
            <span className="bg-white text-gray-900 rounded-2xl w-14 h-14 flex items-center justify-center text-3xl font-black shadow-lg">Δ</span>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Pythagoras Master</h1>
              <p className="text-white/80 font-medium">Visual geometry and coordinate mastery.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4">
        <div className="max-w-4xl mx-auto flex overflow-x-auto no-scrollbar py-3 gap-3">
          {[
            { id: LessonType.THEOREM, label: '8.1 Pythagorean Theorem' },
            { id: LessonType.CONVERSE, label: '8.2 The Converse' },
            { id: LessonType.COORDINATE_GEOMETRY, label: '8.3 Coordinate Plane' },
            { id: LessonType.DISTANCE, label: '8.4 Distance Formula' },
            { id: LessonType.FINAL_EXAM, label: 'Final Test' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 ${
                activeTab === tab.id 
                  ? `${getThemeColor(tab.id).bg} text-white shadow-lg translate-y-[-2px]` 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto mt-8 px-6">
        {/* Difficulty Selector */}
        {!score && (
          <div className="mb-6 flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-gray-100 max-w-sm mx-auto md:mx-0">
            {[
              { id: Difficulty.EASY, label: 'Easy' },
              { id: Difficulty.MEDIUM, label: 'Medium' },
              { id: Difficulty.HARD, label: 'Hard' }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                  difficulty === d.id 
                    ? `${theme.bg} text-white shadow-md` 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}

        <div className={`bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100 transition-all ${isGridTab ? 'math-grid' : ''}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className={`w-14 h-14 border-4 ${theme.text} border-t-transparent rounded-full animate-spin mb-6`} />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">Generating {difficulty} worksheet...</p>
            </div>
          ) : score !== null ? (
            <div className="py-12">
              <div className="text-center mb-12">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-[2rem] ${theme.light} ${theme.text} text-5xl font-black mb-8 border-4 border-current transform rotate-3`}>
                  {Math.round((score / questions.length) * 100)}%
                </div>
                <h2 className="text-4xl font-black mb-4 text-gray-900">Module Complete!</h2>
                <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto">
                  Excellent work on <span className="capitalize">{difficulty}</span> mode! You got <span className={`font-bold ${theme.text}`}>{score}</span> correct out of <span className="font-bold text-gray-900">{questions.length}</span>.
                </p>
                <button
                  onClick={loadQuestions}
                  className={`px-10 py-4 rounded-2xl font-black text-lg ${theme.bg} text-white hover:opacity-90 transition-all shadow-xl shadow-indigo-100 active:scale-95`}
                >
                  Retake Lesson
                </button>
              </div>

              {/* Review Section */}
              {wrongAnswers.length > 0 && (
                <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center mb-8">
                    <div className="h-1 w-12 bg-rose-500 rounded-full mr-4"></div>
                    <h3 className="text-2xl font-black text-gray-900">Review Missed Concepts</h3>
                  </div>
                  
                  <div className="space-y-12">
                    {questions.map((q, idx) => {
                      const isWrong = userAnswers[idx] !== q.correctAnswer;
                      if (!isWrong) return null;

                      return (
                        <div key={q.id} className="bg-rose-50/30 rounded-3xl p-8 border border-rose-100">
                          <div className="flex items-start justify-between mb-4">
                             <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                Question {idx + 1}
                             </span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-6">{q.text}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-white rounded-2xl border border-rose-200">
                              <p className="text-xs font-black uppercase tracking-widest text-rose-400 mb-1">Your Answer</p>
                              <p className="text-rose-700 font-bold">{q.options[userAnswers[idx]]}</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-emerald-200">
                              <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-1">Correct Answer</p>
                              <p className="text-emerald-700 font-bold">{q.options[q.correctAnswer]}</p>
                            </div>
                          </div>

                          <div className="p-6 bg-white/50 rounded-2xl border border-indigo-100">
                            <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Explanation</p>
                            <p className="text-gray-700 leading-relaxed font-medium">{q.explanation}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="mb-12 border-l-4 border-current pl-6" style={{ borderColor: theme.primary }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-3xl font-black ${theme.text}`}>
                    {activeTab === LessonType.FINAL_EXAM ? 'Comprehensive Final' : 'Lesson Exploration'}
                  </h2>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${theme.text}`} style={{ borderColor: theme.primary }}>
                    Level: {difficulty}
                  </span>
                </div>
                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                  {activeTab === LessonType.THEOREM && "Discover how to calculate the longest side (hypotenuse) using the square of the legs."}
                  {activeTab === LessonType.CONVERSE && "Use logic to determine if three given lengths can actually form a right triangle."}
                  {activeTab === LessonType.COORDINATE_GEOMETRY && "Solve Pythagorean problems directly on the coordinate grid. Use (x,y) points to form right triangles."}
                  {activeTab === LessonType.DISTANCE && "Master the standard distance formula derived directly from Pythagoras."}
                  {activeTab === LessonType.FINAL_EXAM && "20 questions covering every concept in the module. Good luck!"}
                </p>
              </div>

              <Quiz questions={questions} onFinish={handleFinish} accentColor={theme.primary} />
            </div>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-4xl mx-auto mt-16 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black mb-4">A²</div>
          <h4 className="font-black text-gray-900 mb-2 uppercase text-xs tracking-widest">Theorem</h4>
          <p className="text-gray-500 text-sm">The sum of the squares of the legs is equal to the square of the hypotenuse.</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-black mb-4">(x,y)</div>
          <h4 className="font-black text-gray-900 mb-2 uppercase text-xs tracking-widest">Cartesian</h4>
          <p className="text-gray-500 text-sm">Visualize vertical and horizontal distances as legs of a hidden right triangle.</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-black mb-4">3:4:5</div>
          <h4 className="font-black text-gray-900 mb-2 uppercase text-xs tracking-widest">Triples</h4>
          <p className="text-gray-500 text-sm">Sets of three integers that perfectly satisfy the Pythagorean theorem.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
