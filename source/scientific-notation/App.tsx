
import React, { useState } from 'react';
import { TabType } from './types';
import ReviewTab from './components/ReviewTab';
import PracticeTab from './components/PracticeTab';
import WordProblemsTab from './components/WordProblemsTab';
import AssessmentHubTab from './components/AssessmentHubTab';
import TestTab from './components/TestTab';
import { PRACTICE_POSITIVE_PROBLEMS, PRACTICE_NEGATIVE_PROBLEMS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('review');

  const renderTab = () => {
    switch (activeTab) {
      case 'review': return <ReviewTab />;
      case 'practice-positive': return (
        <PracticeTab 
          problems={PRACTICE_POSITIVE_PROBLEMS} 
          title="Large Number Lab" 
          theme="blue" 
        />
      );
      case 'practice-negative': return (
        <PracticeTab 
          problems={PRACTICE_NEGATIVE_PROBLEMS} 
          title="Micro Number Lab" 
          theme="rose" 
        />
      );
      case 'word-problems': return <WordProblemsTab />;
      case 'assessment-hub': return <AssessmentHubTab />;
      case 'test': return <TestTab />;
      default: return <ReviewTab />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-lg p-4 md:p-6 sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">SciNotation Master</h1>
              <p className="text-indigo-100 text-xs font-medium opacity-90">8th Grade Mathematics • Lesson 2.1 & 2.2</p>
            </div>
          </div>
          
          <nav className="flex bg-indigo-700/50 p-1 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-hide">
            <TabButton 
              active={activeTab === 'review'} 
              onClick={() => setActiveTab('review')}
              label="Review"
              icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
            />
            <TabButton 
              active={activeTab === 'practice-positive'} 
              onClick={() => setActiveTab('practice-positive')}
              label="Large (+)"
              icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>}
            />
            <TabButton 
              active={activeTab === 'practice-negative'} 
              onClick={() => setActiveTab('practice-negative')}
              label="Small (-)"
              icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>}
            />
            <TabButton 
              active={activeTab === 'word-problems'} 
              onClick={() => setActiveTab('word-problems')}
              label="Apps"
              icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
            />
            <TabButton 
              active={activeTab === 'assessment-hub'} 
              onClick={() => setActiveTab('assessment-hub')}
              label="Assessment"
              icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>}
            />
            <TabButton 
              active={activeTab === 'test'} 
              onClick={() => setActiveTab('test')}
              label="Level Check"
              icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 7-5-5-5 5"/><path d="m17 17-5 5-5-5"/></svg>}
            />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto w-full p-4 md:p-8 print:p-0">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderTab()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6 px-4 text-center text-slate-500 text-sm print:hidden">
        <p>© 2024 MathEdu Learning Systems. Based on Texas TEKS 8.2.C standards.</p>
      </footer>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl transition-all whitespace-nowrap text-sm md:text-base ${
      active 
        ? 'bg-white text-indigo-700 shadow-md font-bold scale-105' 
        : 'text-indigo-100 hover:bg-white/10 font-medium'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;
