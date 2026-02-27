
import React, { useState } from 'react';
import { LESSON_DATA } from '../constants';
import { getRealWorldFact } from '../services/geminiService';
import { GroundingSource } from '../types';

const ReviewTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ text: string; sources: GroundingSource[] } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const res = await getRealWorldFact(searchQuery);
    setSearchResult(res);
    setIsSearching(false);
  };

  return (
    <div className="space-y-8">
      {/* Introduction Card */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Essential Question</h2>
            <p className="text-slate-600 text-lg italic">"How can you use scientific notation to express very large or very small quantities?"</p>
          </div>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed">
            Scientific notation is a method of expressing numbers as a product of a number 
            <span className="font-bold text-indigo-600 mx-1">greater than or equal to 1 and less than 10</span>, 
            and a <span className="font-bold text-indigo-600">power of 10</span>.
          </p>
          <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 my-6 rounded-r-lg">
            <p className="font-mono text-xl text-center">a &times; 10&sup2;</p>
            <p className="text-xs text-center text-slate-500 mt-2">where 1 &le; |a| &lt; 10 and n is an integer</p>
          </div>
        </div>
      </section>

      {/* Examples Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 p-4 text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              Positive Powers (Large Numbers)
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600 mb-4">Move the decimal point to the <span className="font-bold">LEFT</span>. The exponent is <span className="font-bold">POSITIVE</span>.</p>
            {LESSON_DATA.positivePowers.examples.map((ex, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">{ex.name}</span>
                <div className="text-right">
                  <div className="text-xs text-slate-500">{ex.standard}</div>
                  <div className="font-mono font-bold text-indigo-700">{ex.scientific}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-teal-600 p-4 text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              Negative Powers (Small Numbers)
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600 mb-4">Move the decimal point to the <span className="font-bold">RIGHT</span>. The exponent is <span className="font-bold">NEGATIVE</span>.</p>
            {LESSON_DATA.negativePowers.examples.map((ex, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">{ex.name}</span>
                <div className="text-right">
                  <div className="text-xs text-slate-500">{ex.standard}</div>
                  <div className="font-mono font-bold text-teal-700">{ex.scientific}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-indigo-900 rounded-3xl p-8 text-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Explore Real-World Data</h3>
            <p className="text-indigo-200">Search for any scientific or geographic fact and see it in scientific notation.</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. 'Distance to Saturn' or 'Size of a virus'"
              className="flex-grow p-4 rounded-xl text-green-900 bg-green-100 border-2 border-green-300 outline-none focus:ring-4 focus:ring-green-400 placeholder:text-green-700/60 font-medium"
            />
            <button 
              type="submit"
              disabled={isSearching}
              className="bg-indigo-500 hover:bg-indigo-400 px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Analyzing...' : 'Search'}
            </button>
          </form>

          {searchResult && (
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
              <div className="max-w-none">
                <p className="text-lg leading-relaxed mb-4 text-emerald-400 font-medium">
                  {searchResult.text}
                </p>
              </div>
              {searchResult.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-xs font-semibold uppercase text-indigo-300 mb-2">Sources:</p>
                  <div className="flex flex-wrap gap-3">
                    {searchResult.sources.map((src, i) => (
                      <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors flex items-center gap-1">
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        {src.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ReviewTab;
