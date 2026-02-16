import React, { useState } from 'react';
import { ViewState } from './types';
import InteractiveDiagram from './components/InteractiveDiagram';
import LessonContent from './components/LessonContent';
import QuizPractice from './components/QuizPractice';
import ParallelPractice from './components/ParallelPractice';
import ParallelAlgebraPractice from './components/ParallelAlgebraPractice';
import TrianglePractice from './components/TrianglePractice';
import TriangleAlgebraPractice from './components/TriangleAlgebraPractice';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LESSON_PARALLEL);

  const renderMainContent = () => {
    switch (view) {
      case ViewState.LESSON_PARALLEL:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <LessonContent view={view} />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                <InteractiveDiagram mode='transversal' />
              </div>
            </div>
          </div>
        );
      case ViewState.PARALLEL_PRACTICE:
        return (
           <div className="max-w-5xl mx-auto space-y-8">
               <ParallelPractice />
          </div>
        );
      case ViewState.PARALLEL_ALGEBRA:
        return (
           <div className="max-w-6xl mx-auto space-y-8">
               <ParallelAlgebraPractice />
          </div>
        );
      case ViewState.LESSON_TRIANGLES:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <LessonContent view={view} />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                <InteractiveDiagram mode='triangle' />
              </div>
            </div>
          </div>
        );
      case ViewState.TRIANGLE_PRACTICE:
        return (
            <div className="max-w-5xl mx-auto space-y-8">
                <TrianglePractice />
            </div>
        );
      case ViewState.TRIANGLE_ALGEBRA:
        return (
            <div className="max-w-6xl mx-auto space-y-8">
                <TriangleAlgebraPractice />
            </div>
        );
      case ViewState.PRACTICE:
        return (
          <div className="max-w-3xl mx-auto">
             <QuizPractice />
          </div>
        );
      default:
        return <div>Select a lesson</div>;
    }
  };

  const isParallelSection = view === ViewState.LESSON_PARALLEL || view === ViewState.PARALLEL_PRACTICE || view === ViewState.PARALLEL_ALGEBRA;
  const isTriangleSection = view === ViewState.LESSON_TRIANGLES || view === ViewState.TRIANGLE_PRACTICE || view === ViewState.TRIANGLE_ALGEBRA;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.LESSON_PARALLEL)}>
                <div className="bg-indigo-600 text-white p-2 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">GeoTutor</span>
              </div>
              
              <div className="hidden md:ml-8 md:flex md:space-x-4 items-center">
                
                {/* Parallel Group */}
                <div className={`flex rounded-lg p-1 space-x-1 ${isParallelSection ? 'bg-slate-100' : ''}`}>
                     <button 
                        onClick={() => setView(ViewState.LESSON_PARALLEL)}
                        className={`${view === ViewState.LESSON_PARALLEL ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'} px-3 py-1.5 rounded-md text-sm font-medium transition-all`}
                    >
                      Parallel Lesson
                    </button>
                    {isParallelSection && (
                        <>
                            <button 
                                onClick={() => setView(ViewState.PARALLEL_PRACTICE)}
                                className={`${view === ViewState.PARALLEL_PRACTICE ? 'bg-rose-500 shadow text-white' : 'text-slate-500 hover:text-rose-600'} px-3 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-1`}
                            >
                            Identify
                            </button>
                            <button 
                                onClick={() => setView(ViewState.PARALLEL_ALGEBRA)}
                                className={`${view === ViewState.PARALLEL_ALGEBRA ? 'bg-emerald-500 shadow text-white' : 'text-slate-500 hover:text-emerald-600'} px-3 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-1`}
                            >
                            Solve (Algebra)
                            </button>
                        </>
                    )}
                </div>

                <div className="h-6 w-px bg-slate-300 mx-2"></div>

                {/* Triangle Group */}
                <div className={`flex rounded-lg p-1 space-x-1 ${isTriangleSection ? 'bg-slate-100' : ''}`}>
                    <button 
                        onClick={() => setView(ViewState.LESSON_TRIANGLES)}
                        className={`${view === ViewState.LESSON_TRIANGLES ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'} px-3 py-1.5 rounded-md text-sm font-medium transition-colors`}
                    >
                    Triangles Lesson
                    </button>
                    {isTriangleSection && (
                        <>
                             <button 
                                onClick={() => setView(ViewState.TRIANGLE_PRACTICE)}
                                className={`${view === ViewState.TRIANGLE_PRACTICE ? 'bg-rose-500 shadow text-white' : 'text-slate-500 hover:text-rose-600'} px-3 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-1`}
                            >
                            Identify
                            </button>
                            <button 
                                onClick={() => setView(ViewState.TRIANGLE_ALGEBRA)}
                                className={`${view === ViewState.TRIANGLE_ALGEBRA ? 'bg-emerald-500 shadow text-white' : 'text-slate-500 hover:text-emerald-600'} px-3 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-1`}
                            >
                            Solve (Algebra)
                            </button>
                        </>
                    )}
                </div>

                <div className="h-6 w-px bg-slate-300 mx-2"></div>

                <button 
                    onClick={() => setView(ViewState.PRACTICE)}
                    className={`${view === ViewState.PRACTICE ? 'text-indigo-700 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  General Quiz
                </button>
              </div>
            </div>
            <div className="flex items-center">
                {/* Mobile menu button placeholder */}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderMainContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-slate-400">Powered by React • Tailwind</p>
        </div>
      </footer>
    </div>
  );
};

export default App;