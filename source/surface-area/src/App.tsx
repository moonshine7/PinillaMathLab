/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, 
  Triangle, 
  Circle, 
  Layers, 
  GraduationCap, 
  ChevronRight, 
  Info, 
  Sparkles, 
  Search, 
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Grid,
  Calculator,
  Pencil
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';
import { getFastResponse, getSearchResponse, generateShapeImage } from './services/geminiService';
import { ALL_QUESTIONS, REAL_WORLD_EXAMPLES, Question } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'rectangular' | 'triangular' | 'cylinder' | 'lateral' | 'net' | 'real-world' | 'practice' | 'quiz';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('rectangular');
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiAsk = async (type: 'fast' | 'search') => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    try {
      let res = '';
      if (type === 'fast') {
        const context = `The student is currently looking at the ${activeTab} surface area section.`;
        res = await getFastResponse(aiInput, context);
      } else {
        res = await getSearchResponse(aiInput);
      }
      setAiResponse(res);
    } catch (error) {
      setAiResponse("Sorry, I couldn't process that request right now.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">Surface Area Master</h1>
            </div>
            <nav className="hidden md:flex space-x-1">
              <TabButton 
                active={activeTab === 'rectangular'} 
                onClick={() => setActiveTab('rectangular')} 
                icon={<Box size={18} />} 
                label="Rectangular" 
                activeClass="bg-amber-500 text-white shadow-md"
                inactiveClass="bg-amber-100 text-amber-800 hover:bg-amber-200"
              />
              <TabButton 
                active={activeTab === 'triangular'} 
                onClick={() => setActiveTab('triangular')} 
                icon={<Triangle size={18} />} 
                label="Triangular" 
                activeClass="bg-blue-500 text-white shadow-md"
                inactiveClass="bg-blue-100 text-blue-800 hover:bg-blue-200"
              />
              <TabButton 
                active={activeTab === 'cylinder'} 
                onClick={() => setActiveTab('cylinder')} 
                icon={<Circle size={18} />} 
                label="Cylinder" 
                activeClass="bg-violet-500 text-white shadow-md"
                inactiveClass="bg-violet-100 text-violet-800 hover:bg-violet-200"
              />
              <TabButton 
                active={activeTab === 'lateral'} 
                onClick={() => setActiveTab('lateral')} 
                icon={<Layers size={18} />} 
                label="Lateral vs Total" 
                activeClass="bg-emerald-500 text-white shadow-md"
                inactiveClass="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              />
              <TabButton 
                active={activeTab === 'net'} 
                onClick={() => setActiveTab('net')} 
                icon={<Grid size={18} />} 
                label="NET" 
                activeClass="bg-cyan-500 text-white shadow-md"
                inactiveClass="bg-cyan-100 text-cyan-800 hover:bg-cyan-200"
              />
              <TabButton 
                active={activeTab === 'real-world'} 
                onClick={() => setActiveTab('real-world')} 
                icon={<Sparkles size={18} />} 
                label="Real World" 
                activeClass="bg-red-500 text-white shadow-md"
                inactiveClass="bg-red-100 text-red-800 hover:bg-red-200"
              />
              <TabButton 
                active={activeTab === 'practice'} 
                onClick={() => setActiveTab('practice')} 
                icon={<Calculator size={18} />} 
                label="Practice" 
                activeClass="bg-orange-500 text-white shadow-md"
                inactiveClass="bg-orange-100 text-orange-800 hover:bg-orange-200"
              />
              <TabButton 
                active={activeTab === 'quiz'} 
                onClick={() => setActiveTab('quiz')} 
                icon={<ChevronRight size={18} />} 
                label="Quiz" 
                activeClass="bg-indigo-500 text-white shadow-md"
                inactiveClass="bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
              />
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'rectangular' && <RectangularExplorer />}
              {activeTab === 'triangular' && <TriangularExplorer />}
              {activeTab === 'cylinder' && <CylinderExplorer />}
              {activeTab === 'lateral' && <LateralExplorer />}
              {activeTab === 'net' && <NetExplorer />}
              {activeTab === 'real-world' && <RealWorldExplorer />}
              {activeTab === 'practice' && <PracticeExplorer />}
              {activeTab === 'quiz' && <QuizComponent />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar / AI Tools */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-indigo-600 w-5 h-5" />
              <h2 className="font-semibold">AI Math Tutor</h2>
            </div>
            <div className="space-y-4">
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask a question about surface area..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-24 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleAiAsk('fast')}
                  disabled={isAiLoading}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAiLoading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Send size={16} />}
                  Quick Help
                </button>
                <button
                  onClick={() => handleAiAsk('search')}
                  disabled={isAiLoading}
                  className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Search size={16} />
                  Deep Search
                </button>
              </div>
              {aiResponse && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-xl text-sm prose prose-indigo max-w-none">
                  <Markdown>{aiResponse}</Markdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DifficultyCard({ level, title, description, color, onClick }: { level: string, title: string, description: string, color: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-6 rounded-2xl border transition-all hover:scale-105 hover:shadow-md text-left flex flex-col h-full",
        color
      )}
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-xs opacity-80 leading-relaxed flex-grow">{description}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
        Start <ChevronRight size={14} />
      </div>
    </button>
  );
}

function TabButton({ active, onClick, icon, label, activeClass, inactiveClass }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; activeClass: string; inactiveClass: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
        active 
          ? activeClass 
          : cn("text-slate-600 hover:text-slate-900", inactiveClass)
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function RectangularExplorer() {
  const [l, setL] = useState(12);
  const [w, setW] = useState(8);
  const [h, setH] = useState(6);

  const lateralArea = 2 * (l + w) * h;
  const baseArea = l * w;
  const totalArea = 2 * baseArea + lateralArea;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Box className="text-indigo-600" size={24} />
          <h2 className="text-2xl font-bold">Rectangular Prism</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          {/* 3D Shape & Net Visualization */}
          <div className="aspect-[2/1] bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center p-6 shadow-inner overflow-hidden">
            <svg viewBox="0 0 300 150" className="w-full h-full">
              {/* 3D Perspective (Left) */}
              <g transform="translate(20, 30) scale(0.7)">
                {/* Back edges (dashed) */}
                <path d="M40 110 L40 50 M40 50 L140 50 M40 110 L140 110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" fill="none" />
                {/* Bottom Base (Shaded) */}
                <path d="M40 110 L80 130 L180 130 L140 110 Z" fill="#4f46e5" className="fill-indigo-600" opacity="0.8" />
                {/* Top Base (Shaded) */}
                <path d="M80 70 L40 50 L140 50 L180 70 Z" fill="#4f46e5" className="fill-indigo-600" opacity="0.8" />
                {/* Lateral Faces (Outline only) */}
                <rect x="80" y="70" width="100" height="60" stroke="#64748b" strokeWidth="1.5" fill="none" />
                <path d="M180 70 L140 50 L140 110 L180 130 Z" stroke="#64748b" strokeWidth="1.5" fill="none" />
                <path d="M80 70 L40 50 M140 50 L180 70 M180 130 L140 110" stroke="#64748b" strokeWidth="1.5" fill="none" />
                
                {/* Dimension Labels */}
                <text x="130" y="145" className="text-[14px] fill-indigo-700 font-bold italic">{l}</text>
                <text x="185" y="105" className="text-[14px] fill-indigo-700 font-bold italic">{w}</text>
                <text x="65" y="105" className="text-[14px] fill-indigo-700 font-bold italic">{h}</text>
                
                <text x="110" y="165" className="text-[12px] fill-slate-400 font-medium">3D Shape</text>
              </g>

              {/* Net (Right) */}
              <g transform="translate(180, 20) scale(0.6)">
                {/* Lateral Faces */}
                <rect x="40" y="40" width="40" height="60" stroke="#64748b" strokeWidth="1.5" fill="none" />
                <rect x="80" y="40" width="40" height="60" stroke="#64748b" strokeWidth="1.5" fill="none" />
                <rect x="120" y="40" width="40" height="60" stroke="#64748b" strokeWidth="1.5" fill="none" />
                <rect x="160" y="40" width="40" height="60" stroke="#64748b" strokeWidth="1.5" fill="none" />
                {/* Bases (Shaded) */}
                <rect x="80" y="0" width="40" height="40" fill="#4f46e5" className="fill-indigo-600" opacity="0.8" stroke="#64748b" strokeWidth="1.5" />
                <rect x="80" y="100" width="40" height="40" fill="#4f46e5" className="fill-indigo-600" opacity="0.8" stroke="#64748b" strokeWidth="1.5" />
                <text x="100" y="160" className="text-[14px] fill-slate-400 font-medium">Unfolded Net</text>
              </g>
            </svg>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Adjust Dimensions</h3>
            <div className="space-y-6">
              <Slider label="Length (l)" value={l} onChange={setL} max={20} />
              <Slider label="Width (w)" value={w} onChange={setW} max={20} />
              <Slider label="Height (h)" value={h} onChange={setH} max={20} />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-start space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Base Area (B)" value={baseArea} unit="sq units" tooltip="The area of one rectangular base (length × width)." />
            <StatCard label="Perimeter (P)" value={2 * (l + w)} unit="units" tooltip="The distance around the rectangular base (2 × (length + width))." />
            <StatCard label="Lateral Area (L)" value={lateralArea} unit="sq units" color="indigo" tooltip="The area of the 4 side faces (Perimeter × height)." />
            <StatCard label="Total Area (S)" value={totalArea} unit="sq units" color="emerald" tooltip="The sum of all 6 faces (2 × Base Area + Lateral Area)." />
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Formulas</h3>
            <div className="p-4 bg-indigo-50 rounded-xl text-sm font-mono border border-indigo-100">
              <span className="text-indigo-600 font-bold">Lateral Area (L)</span> = Ph = 2(l + w)h
              <FormulaTooltip explanation="The perimeter of the base (P) multiplied by the height (h). It covers all four side faces." />
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl text-sm font-mono border border-emerald-100">
              <span className="text-emerald-600 font-bold">Total Area (S)</span> = 2B + L = 2lw + 2(l+w)h
              <FormulaTooltip explanation="The area of the two bases (2B) plus the lateral area (L). It covers all six faces of the prism." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TriangularExplorer() {
  const [b, setB] = useState(8);
  const [h, setH] = useState(3);
  const [s1, setS1] = useState(5);
  const [s2, setS2] = useState(5);
  const [ph, setPh] = useState(6);

  const baseArea = 0.5 * b * h;
  const perimeter = b + s1 + s2;
  const lateralArea = perimeter * ph;
  const totalArea = 2 * baseArea + lateralArea;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Triangle className="text-indigo-600" size={24} />
          <h2 className="text-2xl font-bold">Triangular Prism</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          {/* 3D Shape & Net Visualization */}
          <div className="aspect-[2/1] bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center p-6 shadow-inner overflow-hidden">
            <svg viewBox="0 0 300 150" className="w-full h-full">
              {/* 3D Perspective (Left) */}
              <g transform="translate(30, 30) scale(0.7)">
                {/* Back Triangle (dashed) */}
                <path d="M40 100 L70 40 L100 100 Z" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" fill="none" />
                {/* Connecting lines (dashed) */}
                <path d="M40 100 L100 120 M70 40 L130 60 M100 100 L160 120" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" fill="none" />
                {/* Bases (Shaded) */}
                <path d="M40 100 L70 40 L100 100 Z" fill="#10b981" className="fill-emerald-500" opacity="0.8" />
                <path d="M100 120 L130 60 L160 120 Z" fill="#10b981" className="fill-emerald-500" opacity="0.8" />
                {/* Lateral Faces (Outline only) */}
                <path d="M100 120 L130 60 L70 40 L40 100 Z" stroke="#64748b" strokeWidth="1.5" fill="none" />
                <path d="M130 60 L160 120 L100 100 L70 40" stroke="#64748b" strokeWidth="1.5" fill="none" />
                <path d="M100 120 L40 100 M160 120 L100 100" stroke="#64748b" strokeWidth="1.5" fill="none" />
                
                {/* Dimension Labels */}
                <text x="130" y="135" className="text-[14px] fill-emerald-700 font-bold italic">{b}</text>
                <text x="165" y="90" className="text-[14px] fill-emerald-700 font-bold italic">{s1}</text>
                <text x="115" y="50" className="text-[14px] fill-emerald-700 font-bold italic">{ph}</text>

                <text x="70" y="165" className="text-[12px] fill-slate-400 font-medium">3D Shape</text>
              </g>

              {/* Net (Right) */}
              <g transform="translate(180, 20) scale(0.6)">
                {/* Lateral Faces */}
                <rect x="40" y="40" width="40" height="80" stroke="#64748b" strokeWidth="1.5" fill="none" />
                <rect x="80" y="40" width="40" height="80" stroke="#64748b" strokeWidth="1.5" fill="none" />
                <rect x="120" y="40" width="40" height="80" stroke="#64748b" strokeWidth="1.5" fill="none" />
                {/* Bases (Shaded) */}
                <path d="M80 40 L100 0 L120 40 Z" fill="#10b981" className="fill-emerald-500" opacity="0.8" stroke="#64748b" strokeWidth="1.5" />
                <path d="M80 120 L100 160 L120 120 Z" fill="#10b981" className="fill-emerald-500" opacity="0.8" stroke="#64748b" strokeWidth="1.5" />
                <text x="70" y="185" className="text-[14px] fill-slate-400 font-medium">Unfolded Net</text>
              </g>
            </svg>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Base Triangle</h3>
            <div className="space-y-6">
              <Slider label="Base (b)" value={b} onChange={setB} max={20} />
              <Slider label="Height (h)" value={h} onChange={setH} max={20} />
              <Slider label="Side 1" value={s1} onChange={setS1} max={20} />
              <Slider label="Side 2" value={s2} onChange={setS2} max={20} />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-6">Prism Height</h3>
            <Slider label="Height (H)" value={ph} onChange={setPh} max={20} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Base Area (B)" value={baseArea} unit="sq units" tooltip="The area of the triangular base (0.5 × base × height)." />
            <StatCard label="Perimeter (P)" value={perimeter} unit="units" tooltip="The sum of the three sides of the triangular base." />
            <StatCard label="Lateral Area (L)" value={lateralArea} unit="sq units" color="indigo" tooltip="The area of the 3 rectangular side faces (Perimeter × Prism Height)." />
            <StatCard label="Total Area (S)" value={totalArea} unit="sq units" color="emerald" tooltip="The sum of all 5 faces (2 × Base Area + Lateral Area)." />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Formulas</h3>
            <div className="p-4 bg-indigo-50 rounded-xl text-sm font-mono border border-indigo-100">
              <span className="text-indigo-600 font-bold">Lateral Area (L)</span> = Ph
              <FormulaTooltip explanation="Perimeter of the triangular base (P) multiplied by the height of the prism (h)." />
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl text-sm font-mono border border-emerald-100">
              <span className="text-emerald-600 font-bold">Total Area (S)</span> = 2B + L
              <FormulaTooltip explanation="Twice the area of the triangular base (2B) plus the lateral area (L)." />
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-4">
            <Info className="text-amber-600 shrink-0" size={24} />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Important Tip:</strong> Don't confuse the height of the triangular base with the height of the prism! They are measured in different directions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CylinderExplorer() {
  const [r, setR] = useState(4);
  const [h, setH] = useState(7);

  const baseArea = Math.PI * r * r;
  const circumference = 2 * Math.PI * r;
  const lateralArea = circumference * h;
  const totalArea = 2 * baseArea + lateralArea;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Circle className="text-indigo-600" size={24} />
          <h2 className="text-2xl font-bold">Cylinder</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          {/* 3D Shape & Net Visualization */}
          <div className="aspect-[2/1] bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center p-6 shadow-inner overflow-hidden">
            <svg viewBox="0 0 300 150" className="w-full h-full">
              {/* 3D Perspective (Left) */}
              <g transform="translate(30, 30) scale(0.7)">
                {/* Bottom Ellipse (Back half dashed) */}
                <path d="M50 110 A50 20 0 0 0 150 110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" fill="none" />
                {/* Bottom Base (Shaded) */}
                <ellipse cx="100" cy="110" rx="50" ry="20" fill="#8b5cf6" className="fill-violet-500" opacity="0.8" />
                {/* Lateral Surface (Outline only) */}
                <rect x="50" y="40" width="100" height="70" stroke="#64748b" strokeWidth="1.5" fill="none" />
                {/* Top Base (Shaded) */}
                <ellipse cx="100" cy="40" rx="50" ry="20" fill="#8b5cf6" className="fill-violet-500" opacity="0.8" stroke="#64748b" strokeWidth="1.5" />
                {/* Side Vertical Lines */}
                <line x1="50" y1="40" x2="50" y2="110" stroke="#64748b" strokeWidth="1.5" />
                <line x1="150" y1="40" x2="150" y2="110" stroke="#64748b" strokeWidth="1.5" />
                
                {/* Dimension Labels */}
                <text x="100" y="35" className="text-[14px] fill-violet-700 font-bold italic">r={r}</text>
                <text x="155" y="80" className="text-[14px] fill-violet-700 font-bold italic">h={h}</text>

                <text x="70" y="165" className="text-[12px] fill-slate-400 font-medium">3D Shape</text>
              </g>

              {/* Net (Right) */}
              <g transform="translate(180, 20) scale(0.6)">
                {/* Lateral Surface (Rectangle) */}
                <rect x="40" y="40" width="120" height="80" stroke="#64748b" strokeWidth="1.5" fill="none" />
                {/* Bases (Shaded) */}
                <circle cx="100" cy="15" r="25" fill="#8b5cf6" className="fill-violet-500" opacity="0.8" stroke="#64748b" strokeWidth="1.5" />
                <circle cx="100" cy="145" r="25" fill="#8b5cf6" className="fill-violet-500" opacity="0.8" stroke="#64748b" strokeWidth="1.5" />
                <text x="60" y="185" className="text-[14px] fill-slate-400 font-medium">Unfolded Net</text>
              </g>
            </svg>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Dimensions</h3>
            <div className="space-y-6">
              <Slider label="Radius (r)" value={r} onChange={setR} max={20} />
              <Slider label="Height (h)" value={h} onChange={setH} max={20} />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Base Area (B)" value={Number(baseArea.toFixed(2))} unit="sq units" tooltip="The area of one circular base (π × r²)." />
            <StatCard label="Circumference (C)" value={Number(circumference.toFixed(2))} unit="units" tooltip="The distance around the circular base (2 × π × r)." />
            <StatCard label="Lateral Area (L)" value={Number(lateralArea.toFixed(2))} unit="sq units" color="indigo" tooltip="The area of the curved surface (Circumference × height)." />
            <StatCard label="Total Area (S)" value={Number(totalArea.toFixed(2))} unit="sq units" color="emerald" tooltip="The sum of all surfaces (2 × Base Area + Lateral Area)." />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Formulas</h3>
            <div className="p-4 bg-indigo-50 rounded-xl text-sm font-mono border border-indigo-100">
              <span className="text-indigo-600 font-bold">Lateral Area</span> = 2πrh
              <FormulaTooltip explanation="The circumference of the circle (2πr) multiplied by the height (h). It's the area of the curved surface." />
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl text-sm font-mono border border-emerald-100">
              <span className="text-emerald-600 font-bold">Total Area</span> = 2πr² + 2πrh
              <FormulaTooltip explanation="The area of the two circular bases (2πr²) plus the lateral area (2πrh)." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LateralExplorer() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="text-indigo-600" size={24} />
        <h2 className="text-2xl font-bold">Lateral vs. Total Area</h2>
      </div>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600">
          Understanding the difference between lateral and total surface area is key to solving real-world problems.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h3 className="text-indigo-900 mt-0">Lateral Area (L)</h3>
            <p className="text-sm">
              The sum of the areas of all the <strong>side faces</strong> of a three-dimensional figure. It does NOT include the area of the bases.
            </p>
            <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-200 text-xs italic">
              Example: The label on a soup can.
            </div>
          </div>
          
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <h3 className="text-emerald-900 mt-0">Total Surface Area (S)</h3>
            <p className="text-sm">
              The sum of the areas of <strong>all</strong> surfaces of a three-dimensional figure, including the bases.
            </p>
            <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200 text-xs italic">
              Example: The metal needed to make the entire soup can (sides, top, and bottom).
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="mt-0">The Relationship</h3>
          <p className="text-sm font-medium text-slate-700">
            Total Surface Area = Area of Bases + Lateral Area
          </p>
          <div className="p-4 bg-white rounded-xl border border-slate-200 font-mono text-center">
            S = 2B + L
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Visual Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rectangular Example */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="aspect-video bg-slate-50 rounded-lg mb-4 flex items-center justify-center">
                <svg viewBox="0 0 100 60" className="w-24 h-16">
                  <path d="M20 40 L30 45 L70 45 L60 40 Z" fill="#4f46e5" opacity="0.8" />
                  <path d="M30 20 L20 15 L60 15 L70 20 Z" fill="#4f46e5" opacity="0.8" />
                  <rect x="30" y="20" width="40" height="25" stroke="#64748b" fill="none" strokeWidth="1" />
                  <path d="M70 20 L60 15 L60 40 L70 45 Z" stroke="#64748b" fill="none" strokeWidth="1" />
                  <path d="M30 20 L20 15 M60 15 L70 20 M70 45 L60 40" stroke="#64748b" fill="none" strokeWidth="1" />
                </svg>
              </div>
              <h4 className="font-bold text-amber-700 text-sm mb-2">Rectangular Prism</h4>
              <p className="text-[11px] text-slate-500 leading-tight">
                <span className="text-indigo-600 font-bold">L:</span> 4 side rectangles<br/>
                <span className="text-emerald-600 font-bold">S:</span> L + 2 base rectangles
              </p>
            </div>

            {/* Triangular Example */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="aspect-video bg-slate-50 rounded-lg mb-4 flex items-center justify-center">
                <svg viewBox="0 0 100 60" className="w-24 h-16">
                  <path d="M30 40 L45 15 L60 40 Z" fill="#10b981" opacity="0.8" />
                  <path d="M50 50 L65 25 L80 50 Z" fill="#10b981" opacity="0.8" />
                  <path d="M45 15 L65 25 L80 50 L60 40 Z" stroke="#64748b" fill="none" strokeWidth="1" />
                  <path d="M30 40 L50 50 L80 50 L60 40 Z" stroke="#64748b" fill="none" strokeWidth="1" />
                </svg>
              </div>
              <h4 className="font-bold text-blue-700 text-sm mb-2">Triangular Prism</h4>
              <p className="text-[11px] text-slate-500 leading-tight">
                <span className="text-indigo-600 font-bold">L:</span> 3 side rectangles<br/>
                <span className="text-emerald-600 font-bold">S:</span> L + 2 base triangles
              </p>
            </div>

            {/* Cylinder Example */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="aspect-video bg-slate-50 rounded-lg mb-4 flex items-center justify-center">
                <svg viewBox="0 0 100 60" className="w-24 h-16">
                  <ellipse cx="50" cy="45" rx="20" ry="8" fill="#8b5cf6" opacity="0.8" />
                  <ellipse cx="50" cy="15" rx="20" ry="8" fill="#8b5cf6" opacity="0.8" stroke="#64748b" strokeWidth="1" />
                  <rect x="30" y="15" width="40" height="30" stroke="#64748b" fill="none" strokeWidth="1" />
                </svg>
              </div>
              <h4 className="font-bold text-violet-700 text-sm mb-2">Cylinder</h4>
              <p className="text-[11px] text-slate-500 leading-tight">
                <span className="text-indigo-600 font-bold">L:</span> 1 curved surface<br/>
                <span className="text-emerald-600 font-bold">S:</span> L + 2 circular bases
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NetExplorer() {
  const [selectedShape, setSelectedShape] = useState<'cube' | 'rectangular' | 'triangular' | 'cylinder'>('cube');
  const [isFolding, setIsFolding] = useState(false);
  const [dimensions, setDimensions] = useState({
    cube: { side: 80 },
    rectangular: { length: 100, width: 60, height: 50 },
    triangular: { base: 100, triangleHeight: 70, prismHeight: 100 },
    cylinder: { radius: 40, height: 120 }
  });

  const updateDimension = (shape: keyof typeof dimensions, field: string, value: number) => {
    setDimensions(prev => ({
      ...prev,
      [shape]: {
        ...prev[shape],
        [field]: value
      }
    }));
  };

  const shapes = {
    cube: {
      name: 'Cube',
      description: 'A cube has 6 identical square faces.',
      color: 'bg-cyan-500',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-700'
    },
    rectangular: {
      name: 'Rectangular Prism',
      description: 'A rectangular prism has 6 rectangular faces.',
      color: 'bg-amber-500',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700'
    },
    triangular: {
      name: 'Triangular Prism',
      description: 'A triangular prism has 2 triangular bases and 3 rectangular sides.',
      color: 'bg-emerald-500',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700'
    },
    cylinder: {
      name: 'Cylinder',
      description: 'A cylinder has 2 circular bases and 1 rectangular lateral surface.',
      color: 'bg-violet-500',
      borderColor: 'border-violet-200',
      textColor: 'text-violet-700'
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Grid className="text-cyan-600" size={24} />
          <h2 className="text-2xl font-bold">Nets & Folding</h2>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button 
            onClick={() => setIsFolding(false)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              !isFolding ? "bg-white text-cyan-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Net
          </button>
          <button 
            onClick={() => setIsFolding(true)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              isFolding ? "bg-white text-cyan-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Folding
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow mr-4">
          {(Object.keys(shapes) as Array<keyof typeof shapes>).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedShape(key)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all",
                selectedShape === key 
                  ? "border-cyan-500 bg-cyan-50 shadow-sm" 
                  : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
              )}
            >
              <p className={cn("text-xs font-bold uppercase tracking-widest", selectedShape === key ? "text-cyan-600" : "text-slate-400")}>
                {shapes[key].name}
              </p>
            </button>
          ))}
        </div>
        <button 
          onClick={() => {
            const keys = Object.keys(shapes) as Array<keyof typeof shapes>;
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            setSelectedShape(randomKey);
          }}
          className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600"
          title="Random Shape"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-center">
            {/* Folding Animation */}
            <div className="flex flex-col items-center justify-center relative">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">Folding Animation</p>
              
              {/* Particle/Sparkle Effect */}
              {isFolding && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-indigo-400 rounded-full"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                        x: [0, (Math.random() - 0.5) * 300],
                        y: [0, (Math.random() - 0.5) * 300],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: Math.random() * 2,
                        ease: "easeOut"
                      }}
                      style={{ left: '50%', top: '50%' }}
                    />
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedShape}-${isFolding}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="relative"
                >
                  <motion.div
                    animate={{ 
                      rotateY: isFolding ? [0, 25, 25, 0] : 0,
                      rotateX: isFolding ? [0, 15, 15, 0] : 0
                    }}
                    transition={{ 
                      duration: 8, 
                      ease: "easeInOut", 
                      repeat: isFolding ? Infinity : 0,
                      times: [0, 0.5, 0.5, 1]
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {selectedShape === 'cube' && (
                      <CubeNet isFolding={isFolding} side={dimensions.cube.side} />
                    )}
                    {selectedShape === 'rectangular' && (
                      <RectangularNet isFolding={isFolding} length={dimensions.rectangular.length} width={dimensions.rectangular.width} height={dimensions.rectangular.height} />
                    )}
                    {selectedShape === 'triangular' && (
                      <TriangularNet isFolding={isFolding} base={dimensions.triangular.base} triangleHeight={dimensions.triangular.triangleHeight} prismHeight={dimensions.triangular.prismHeight} />
                    )}
                    {selectedShape === 'cylinder' && (
                      <CylinderNet isFolding={isFolding} radius={dimensions.cylinder.radius} height={dimensions.cylinder.height} />
                    )}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Resulting 3D Shape (SVG Style) */}
            {isFolding && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center justify-center bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-6">Resulting 3D Shape</p>
                <div className="w-full aspect-square max-w-[200px]">
                  <Resulting3DShape shape={selectedShape} dimensions={dimensions[selectedShape]} />
                </div>
              </motion.div>
            )}
          </div>

          {isFolding && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-cyan-600 font-medium text-[10px] bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-cyan-100"
            >
              <RefreshCw className="animate-spin-slow" size={12} />
              <span>Folding in Slow Motion...</span>
            </motion.div>
          )}
        </div>

        {/* Dimension Controls */}
        <div className="w-full lg:w-64 flex flex-col gap-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Dimension Controls</p>
          {selectedShape === 'cube' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Side Length</span>
                  <span className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded text-[10px]">{dimensions.cube.side}</span>
                </div>
                <input 
                  type="range" min="40" max="120" value={dimensions.cube.side} 
                  onChange={(e) => updateDimension('cube', 'side', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-cyan-100 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>
            </div>
          )}
          {selectedShape === 'rectangular' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Length</span>
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px]">{dimensions.rectangular.length}</span>
                </div>
                <input 
                  type="range" min="40" max="140" value={dimensions.rectangular.length} 
                  onChange={(e) => updateDimension('rectangular', 'length', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Width</span>
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px]">{dimensions.rectangular.width}</span>
                </div>
                <input 
                  type="range" min="30" max="100" value={dimensions.rectangular.width} 
                  onChange={(e) => updateDimension('rectangular', 'width', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Height</span>
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px]">{dimensions.rectangular.height}</span>
                </div>
                <input 
                  type="range" min="30" max="100" value={dimensions.rectangular.height} 
                  onChange={(e) => updateDimension('rectangular', 'height', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>
            </div>
          )}
          {selectedShape === 'triangular' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Base</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px]">{dimensions.triangular.base}</span>
                </div>
                <input 
                  type="range" min="40" max="140" value={dimensions.triangular.base} 
                  onChange={(e) => updateDimension('triangular', 'base', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Triangle Height</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px]">{dimensions.triangular.triangleHeight}</span>
                </div>
                <input 
                  type="range" min="40" max="120" value={dimensions.triangular.triangleHeight} 
                  onChange={(e) => updateDimension('triangular', 'triangleHeight', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Prism Height</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px]">{dimensions.triangular.prismHeight}</span>
                </div>
                <input 
                  type="range" min="40" max="140" value={dimensions.triangular.prismHeight} 
                  onChange={(e) => updateDimension('triangular', 'prismHeight', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          )}
          {selectedShape === 'cylinder' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Radius</span>
                  <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-[10px]">{dimensions.cylinder.radius}</span>
                </div>
                <input 
                  type="range" min="20" max="60" value={dimensions.cylinder.radius} 
                  onChange={(e) => updateDimension('cylinder', 'radius', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-violet-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Height</span>
                  <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-[10px]">{dimensions.cylinder.height}</span>
                </div>
                <input 
                  type="range" min="40" max="160" value={dimensions.cylinder.height} 
                  onChange={(e) => updateDimension('cylinder', 'height', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-violet-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
        <h3 className="text-cyan-900 font-bold mb-2 flex items-center gap-2">
          <Info size={18} />
          What is a Net?
        </h3>
        <p className="text-sm text-cyan-800 leading-relaxed">
          A <strong>net</strong> is a two-dimensional pattern that can be folded to make a three-dimensional shape. 
          Think of it like unfolding a cardboard box until it lies completely flat on the floor.
        </p>
      </div>
    </div>
  );
}

function Resulting3DShape({ shape, dimensions }: { shape: 'cube' | 'rectangular' | 'triangular' | 'cylinder', dimensions: any }) {
  if (shape === 'cube') {
    const s = dimensions.side;
    const scale = 80 / s;
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <g transform={`translate(20, 20) scale(${0.8 * scale})`}>
          <path d={`M40 ${30+s} L40 30 M40 30 L${40+s} 30 M40 ${30+s} L${40+s} ${30+s}`} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" fill="none" />
          <path d={`M40 ${30+s} L80 ${30+s+30} L${80+s} ${30+s+30} L${40+s} ${30+s} Z`} fill="#0891b2" opacity="0.8" />
          <path d={`M80 ${30+30} L40 30 L${40+s} 30 L${80+s} ${30+30} Z`} fill="#0891b2" opacity="0.8" />
          <rect x="80" y="60" width={s} height={s} stroke="#0f172a" strokeWidth="2" fill="none" />
          <path d={`M${80+s} 60 L${40+s} 30 L${40+s} ${30+s} L${80+s} ${30+s+30} Z`} stroke="#0f172a" strokeWidth="2" fill="none" />
          <path d={`M80 60 L40 30 M${40+s} 30 L${80+s} 60 M${80+s} ${60+s} L${40+s} ${30+s}`} stroke="#0f172a" strokeWidth="2" fill="none" />
        </g>
      </svg>
    );
  }
  if (shape === 'rectangular') {
    const { length: l, width: w, height: h } = dimensions;
    const scale = 100 / l;
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <g transform={`translate(10, 20) scale(${0.8 * scale})`}>
          <path d={`M40 ${50+h} L40 50 M40 50 L${40+l} 50 M40 ${50+h} L${40+l} ${50+h}`} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" fill="none" />
          <path d={`M40 ${50+h} L${40+w/2} ${50+h+w/2} L${40+l+w/2} ${50+h+w/2} L${40+l} ${50+h} Z`} fill="#d97706" opacity="0.8" />
          <path d={`M${40+w/2} ${50+w/2} L40 50 L${40+l} 50 L${40+l+w/2} ${50+w/2} Z`} fill="#d97706" opacity="0.8" />
          <rect x={40+w/2} y={50+w/2} width={l} height={h} stroke="#0f172a" strokeWidth="2" fill="none" />
          <path d={`M${40+l+w/2} ${50+w/2} L${40+l} 50 L${40+l} ${50+h} L${40+l+w/2} ${50+h+w/2} Z`} stroke="#0f172a" strokeWidth="2" fill="none" />
          <path d={`M${40+w/2} ${50+w/2} L40 50 M${40+l} 50 L${40+l+w/2} ${50+w/2} M${40+l+w/2} ${50+h+w/2} L${40+l} ${50+h}`} stroke="#0f172a" strokeWidth="2" fill="none" />
        </g>
      </svg>
    );
  }
  if (shape === 'triangular') {
    const { base: b, triangleHeight: th, prismHeight: ph } = dimensions;
    const scale = 100 / ph;
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <g transform={`translate(20, 20) scale(${0.8 * scale})`}>
          <path d={`M40 ${40+th} L${40+b/2} 40 L${40+b} ${40+th} Z`} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" fill="none" />
          <path d={`M40 ${40+th} L${40+ph/2} ${40+th+ph/2} M${40+b/2} 40 L${40+b/2+ph/2} ${40+ph/2} M${40+b} ${40+th} L${40+b+ph/2} ${40+th+ph/2}`} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" fill="none" />
          <path d={`M40 ${40+th} L${40+b/2} 40 L${40+b} ${40+th} Z`} fill="#059669" opacity="0.8" />
          <path d={`M${40+ph/2} ${40+th+ph/2} L${40+b/2+ph/2} ${40+ph/2} L${40+b+ph/2} ${40+th+ph/2} Z`} fill="#059669" opacity="0.8" />
          <path d={`M${40+ph/2} ${40+th+ph/2} L${40+b/2+ph/2} ${40+ph/2} L${40+b/2} 40 L40 ${40+th} Z`} stroke="#0f172a" strokeWidth="2" fill="none" />
          <path d={`M${40+b/2+ph/2} ${40+ph/2} L${40+b+ph/2} ${40+th+ph/2} L${40+b} ${40+th} L${40+b/2} 40`} stroke="#0f172a" strokeWidth="2" fill="none" />
          <path d={`M${40+ph/2} ${40+th+ph/2} L40 ${40+th} M${40+b+ph/2} ${40+th+ph/2} L${40+b} ${40+th}`} stroke="#0f172a" strokeWidth="2" fill="none" />
        </g>
      </svg>
    );
  }
  if (shape === 'cylinder') {
    const { radius: r, height: h } = dimensions;
    const scale = 120 / h;
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <g transform={`translate(25, 20) scale(${0.8 * scale})`}>
          <path d={`M${100-r} ${40+h} A${r} ${r/2.5} 0 0 0 ${100+r} ${40+h}`} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" fill="none" />
          <ellipse cx="100" cy={40+h} rx={r} ry={r/2.5} fill="#7c3aed" opacity="0.8" />
          <rect x={100-r} y="40" width={2*r} height={h} stroke="#0f172a" strokeWidth="2" fill="none" />
          <ellipse cx="100" cy="40" rx={r} ry={r/2.5} fill="#7c3aed" opacity="0.8" stroke="#0f172a" strokeWidth="2" />
          <line x1={100-r} y1="40" x2={100-r} y2={40+h} stroke="#0f172a" strokeWidth="2" />
          <line x1={100+r} y1="40" x2={100+r} y2={40+h} stroke="#0f172a" strokeWidth="2" />
        </g>
      </svg>
    );
  }
  return null;
}

function CubeNet({ isFolding, side }: { isFolding: boolean, side: number }) {
  const duration = 4; // Slow motion

  return (
    <div className="relative flex items-center justify-center" style={{ perspective: '1200px', width: side * 3, height: side * 3 }}>
      {/* Ground Shadow */}
      <motion.div
        className="absolute bg-slate-900/10 blur-xl rounded-full"
        animate={{ 
          scale: isFolding ? [1, 0.6, 1] : 1,
          opacity: isFolding ? [0.2, 0.4, 0.2] : 0.2
        }}
        transition={{ duration: duration * 2, ease: "easeInOut", repeat: Infinity }}
        style={{ width: side * 1.5, height: side * 1.5, bottom: -side/2 }}
      />

      {/* Base Face */}
      <motion.div 
        className="absolute bg-cyan-600 border-2 border-slate-900/40 shadow-lg"
        style={{ width: side, height: side, transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <motion.div 
          className="absolute w-full h-full bg-cyan-500 border-2 border-slate-900/40 origin-bottom overflow-hidden"
          animate={{ rotateX: isFolding ? -90 : 0 }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ bottom: '100%', backfaceVisibility: 'visible' }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
        </motion.div>
        {/* Back */}
        <motion.div 
          className="absolute w-full h-full bg-cyan-500 border-2 border-slate-900/40 origin-top overflow-hidden"
          animate={{ rotateX: isFolding ? 90 : 0 }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ top: '100%', backfaceVisibility: 'visible' }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
        </motion.div>
        {/* Left */}
        <motion.div 
          className="absolute w-full h-full bg-cyan-400 border-2 border-slate-900/40 origin-right overflow-hidden"
          animate={{ rotateY: isFolding ? 90 : 0 }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ right: '100%', backfaceVisibility: 'visible' }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
        </motion.div>
        {/* Right */}
        <motion.div 
          className="absolute w-full h-full bg-cyan-400 border-2 border-slate-900/40 origin-left overflow-hidden"
          animate={{ rotateY: isFolding ? -90 : 0 }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ left: '100%', transformStyle: 'preserve-3d', backfaceVisibility: 'visible' }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
          {/* Top (attached to right) */}
          <motion.div 
            className="absolute w-full h-full bg-cyan-700 border-2 border-slate-900/40 origin-left overflow-hidden"
            animate={{ rotateY: isFolding ? -90 : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
            style={{ left: '100%', backfaceVisibility: 'visible' }}
          >
            <motion.div 
              className="absolute inset-0 bg-black"
              animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
              transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function RectangularNet({ isFolding, length, width, height }: { isFolding: boolean, length: number, width: number, height: number }) {
  const duration = 4;
  return (
    <div className="relative flex items-center justify-center" style={{ perspective: '1200px', width: length + 2 * width, height: width + 2 * height }}>
      {/* Ground Shadow */}
      <motion.div
        className="absolute bg-slate-900/10 blur-xl rounded-full"
        animate={{ 
          scale: isFolding ? [1, 0.7, 1] : 1,
          opacity: isFolding ? [0.2, 0.4, 0.2] : 0.2
        }}
        transition={{ duration: duration * 2, ease: "easeInOut", repeat: Infinity }}
        style={{ width: length * 1.5, height: width * 1.5, bottom: -width/2 }}
      />

      {/* Base Face (Bottom) */}
      <motion.div 
        className="absolute bg-amber-600 border-2 border-slate-900/40 shadow-lg"
        style={{ width: length, height: width, transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <motion.div 
          className="absolute w-full bg-amber-500 border-2 border-slate-900/40 origin-bottom overflow-hidden"
          animate={{ rotateX: isFolding ? -90 : 0 }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ height: height, bottom: '100%', backfaceVisibility: 'visible' }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
        </motion.div>
        {/* Back */}
        <motion.div 
          className="absolute w-full bg-amber-500 border-2 border-slate-900/40 origin-top overflow-hidden"
          animate={{ rotateX: isFolding ? 90 : 0 }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ height: height, top: '100%', backfaceVisibility: 'visible' }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
        </motion.div>
        {/* Left */}
        <motion.div 
          className="absolute h-full bg-amber-400 border-2 border-slate-900/40 origin-right overflow-hidden"
          animate={{ rotateY: isFolding ? 90 : 0 }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ width: height, right: '100%', backfaceVisibility: 'visible' }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
        </motion.div>
        {/* Right */}
        <motion.div 
          className="absolute h-full bg-amber-400 border-2 border-slate-900/40 origin-left overflow-hidden"
          animate={{ rotateY: isFolding ? -90 : 0 }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ width: height, left: '100%', transformStyle: 'preserve-3d', backfaceVisibility: 'visible' }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
          {/* Top (attached to right) */}
          <motion.div 
            className="absolute h-full bg-amber-700 border-2 border-slate-900/40 origin-left overflow-hidden"
            animate={{ rotateY: isFolding ? -90 : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
            style={{ width: length, left: '100%', backfaceVisibility: 'visible' }}
          >
            <motion.div 
              className="absolute inset-0 bg-black"
              animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
              transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function TriangularNet({ isFolding, base, triangleHeight, prismHeight }: { isFolding: boolean, base: number, triangleHeight: number, prismHeight: number }) {
  const duration = 4;
  // Calculate side of triangle (assuming isosceles)
  const side = Math.sqrt((base / 2) ** 2 + triangleHeight ** 2);
  
  return (
    <div className="relative flex items-center justify-center" style={{ perspective: '1200px', width: prismHeight + 2 * side, height: base + 2 * triangleHeight }}>
      {/* Ground Shadow */}
      <motion.div
        className="absolute bg-slate-900/10 blur-xl rounded-full"
        animate={{ 
          scale: isFolding ? [1, 0.7, 1] : 1,
          opacity: isFolding ? [0.2, 0.4, 0.2] : 0.2
        }}
        transition={{ duration: duration * 2, ease: "easeInOut", repeat: Infinity }}
        style={{ width: prismHeight * 1.5, height: base * 1.5 }}
      />

      {/* Middle Rectangular Face (Base of the prism) */}
      <motion.div 
        className="absolute bg-emerald-600 border-2 border-slate-900/40 shadow-lg"
        style={{ width: prismHeight, height: base, transformStyle: 'preserve-3d' }}
      >
        {/* Top Rectangular Face (Side 1) */}
        <motion.div 
          className="absolute w-full bg-emerald-500 border-2 border-slate-900/40 origin-bottom overflow-hidden"
          animate={{ rotateX: isFolding ? -60 : 0 }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ height: side, bottom: '100%', backfaceVisibility: 'visible' }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
        </motion.div>
        {/* Bottom Rectangular Face (Side 2) */}
        <motion.div 
          className="absolute w-full bg-emerald-500 border-2 border-slate-900/40 origin-top overflow-hidden"
          animate={{ rotateX: isFolding ? 60 : 0 }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ height: side, top: '100%', backfaceVisibility: 'visible' }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
        </motion.div>
        {/* Left Triangle (Base 1) */}
        <motion.div 
          className="absolute h-full origin-right overflow-hidden"
          animate={{ rotateY: isFolding ? 90 : 0 }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ 
            width: triangleHeight,
            right: '100%', 
            clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)', 
            background: '#059669', 
            border: '2px solid rgba(15, 23, 42, 0.4)',
            backfaceVisibility: 'visible'
          }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
        </motion.div>
        {/* Right Triangle (Base 2) */}
        <motion.div 
          className="absolute h-full origin-left overflow-hidden"
          animate={{ rotateY: isFolding ? -90 : 0 }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ 
            width: triangleHeight,
            left: '100%', 
            clipPath: 'polygon(100% 50%, 0% 0%, 0% 100%)', 
            background: '#059669', 
            border: '2px solid rgba(15, 23, 42, 0.4)',
            backfaceVisibility: 'visible'
          }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.4, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function CylinderNet({ isFolding, radius, height }: { isFolding: boolean, radius: number, height: number }) {
  const duration = 4;
  const circumference = 2 * Math.PI * radius;
  
  return (
    <div className="relative flex items-center justify-center" style={{ perspective: '1200px', width: circumference, height: height + 2 * radius * 2 }}>
      {/* Ground Shadow */}
      <motion.div
        className="absolute bg-slate-900/10 blur-xl rounded-full"
        animate={{ 
          scale: isFolding ? [1, 0.8, 1] : 1,
          opacity: isFolding ? [0.2, 0.4, 0.2] : 0.2
        }}
        transition={{ duration: duration * 2, ease: "easeInOut", repeat: Infinity }}
        style={{ width: circumference * 0.8, height: radius * 3, bottom: -radius }}
      />

      <div className="relative flex flex-col items-center" style={{ transformStyle: 'preserve-3d' }}>
        {/* Top Base */}
        <motion.div 
          className="bg-violet-700 rounded-full border-2 border-slate-900/40 origin-bottom mb-[-1px] overflow-hidden"
          animate={{ 
            rotateX: isFolding ? -90 : 0,
            y: isFolding ? radius : 0
          }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ width: radius * 2, height: radius * 2, backfaceVisibility: 'visible' }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.3, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
        </motion.div>
        
        {/* Lateral Surface (Rectangle) */}
        <motion.div 
          className="bg-violet-500 border-2 border-slate-900/40 relative overflow-hidden"
          animate={{ 
            borderRadius: isFolding ? `${radius * 2}px` : '0px',
            scaleX: isFolding ? (radius * 2) / circumference : 1,
          }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ width: circumference, height: height, backfaceVisibility: 'visible' }}
        >
          {/* Shading to simulate curve */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40"
            animate={{ opacity: isFolding ? [0, 1, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
        </motion.div>
        
        {/* Bottom Base */}
        <motion.div 
          className="bg-violet-700 rounded-full border-2 border-slate-900/40 origin-top mt-[-1px] overflow-hidden"
          animate={{ 
            rotateX: isFolding ? 90 : 0,
            y: isFolding ? -radius : 0
          }}
          transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          style={{ width: radius * 2, height: radius * 2, backfaceVisibility: 'visible' }}
        >
          <motion.div 
            className="absolute inset-0 bg-black"
            animate={{ opacity: isFolding ? [0, 0.3, 0] : 0 }}
            transition={{ duration, ease: "easeInOut", repeat: isFolding ? Infinity : 0, repeatType: "reverse" }}
          />
        </motion.div>
      </div>
    </div>
  );
}

function RealWorldExplorer() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="text-red-600" size={24} />
        <h2 className="text-2xl font-bold text-red-900">Real-World Applications</h2>
      </div>
      
      <div className="space-y-6">
        <p className="text-slate-600 leading-relaxed">
          Surface area isn't just a math problem—it's a critical calculation in engineering, manufacturing, and design. 
          Here are some ways we use these formulas every day:
        </p>
        
        <div className="grid grid-cols-1 gap-6">
          {REAL_WORLD_EXAMPLES.map((item: any, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 aspect-video md:aspect-auto relative overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur rounded-xl shadow-sm border border-slate-200">
                    {item.shape === 'Cylinder' ? <Circle className="text-violet-500" size={18} /> : 
                     item.shape === 'Triangular Prism' ? <Triangle className="text-emerald-500" size={18} /> :
                     <Box className="text-indigo-500" size={18} />}
                  </div>
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-slate-900">{item.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
                      {item.application}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{item.shape}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PracticeExplorer() {
  const [shape, setShape] = useState<'rectangular' | 'triangular' | 'cylinder'>('rectangular');
  const [dimensions, setDimensions] = useState<any>({});
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const generateProblem = () => {
    const shapes: ('rectangular' | 'triangular' | 'cylinder')[] = ['rectangular', 'triangular', 'cylinder'];
    const newShape = shapes[Math.floor(Math.random() * shapes.length)];
    setShape(newShape);
    setUserAnswer('');
    setFeedback(null);
    setShowSolution(false);

    if (newShape === 'rectangular') {
      setDimensions({
        l: Math.floor(Math.random() * 10) + 2,
        w: Math.floor(Math.random() * 10) + 2,
        h: Math.floor(Math.random() * 10) + 2,
      });
    } else if (newShape === 'triangular') {
      setDimensions({
        b: Math.floor(Math.random() * 10) + 4,
        h: Math.floor(Math.random() * 5) + 3,
        ph: Math.floor(Math.random() * 10) + 5,
      });
    } else {
      setDimensions({
        r: Math.floor(Math.random() * 5) + 2,
        h: Math.floor(Math.random() * 10) + 5,
      });
    }
  };

  useEffect(() => {
    generateProblem();
  }, []);

  const calculateCorrectAnswer = () => {
    if (shape === 'rectangular') {
      const { l, w, h } = dimensions;
      return 2 * (l * w + l * h + w * h);
    } else if (shape === 'triangular') {
      const { b, h, ph } = dimensions;
      // Assume isosceles for simplicity in practice
      const side = Math.sqrt((b / 2) ** 2 + h ** 2);
      const baseArea = 0.5 * b * h;
      const perimeter = b + 2 * side;
      return 2 * baseArea + perimeter * ph;
    } else {
      const { r, h } = dimensions;
      // Using 3.14 for consistency with common school math
      return Number((2 * 3.14 * r * r + 2 * 3.14 * r * h).toFixed(2));
    }
  };

  const checkAnswer = () => {
    const correct = calculateCorrectAnswer();
    const userNum = parseFloat(userAnswer);
    
    if (isNaN(userNum)) {
      setFeedback({ isCorrect: false, message: "Please enter a valid number." });
      return;
    }

    // Allow for small rounding differences
    const diff = Math.abs(userNum - correct);
    const isCorrect = diff < 0.5;

    if (isCorrect) {
      setFeedback({ isCorrect: true, message: "Correct! Well done." });
    } else {
      setFeedback({ isCorrect: false, message: `Incorrect. Try again or view the solution.` });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Calculator className="text-indigo-600" size={24} />
          <h2 className="text-2xl font-bold">Practice Problems</h2>
        </div>
        <button 
          onClick={generateProblem}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors"
        >
          <RefreshCw size={18} />
          New Problem
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-lg font-semibold mb-4">Problem:</h3>
            <p className="text-slate-700 mb-4">
              Find the <strong>total surface area</strong> of the following {shape === 'rectangular' ? 'rectangular prism' : shape === 'triangular' ? 'triangular prism' : 'cylinder'}:
            </p>
            
            <div className="space-y-2 font-mono text-sm bg-white p-4 rounded-xl border border-slate-200">
              {shape === 'rectangular' && (
                <>
                  <div>Length (l) = {dimensions.l} units</div>
                  <div>Width (w) = {dimensions.w} units</div>
                  <div>Height (h) = {dimensions.h} units</div>
                </>
              )}
              {shape === 'triangular' && (
                <>
                  <div>Base of triangle (b) = {dimensions.b} units</div>
                  <div>Height of triangle (h) = {dimensions.h} units</div>
                  <div>Height of prism (H) = {dimensions.ph} units</div>
                  <div className="text-[10px] text-slate-400 mt-2 italic">* Assume an isosceles triangular base</div>
                </>
              )}
              {shape === 'cylinder' && (
                <>
                  <div>Radius (r) = {dimensions.r} units</div>
                  <div>Height (h) = {dimensions.h} units</div>
                  <div className="text-[10px] text-slate-400 mt-2 italic">* Use π ≈ 3.14 for calculations</div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Your Answer (sq units):</label>
            <div className="flex gap-3">
              <input 
                type="number" 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter value..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button 
                onClick={checkAnswer}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Check Answer
              </button>
            </div>

            {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-xl border flex items-center gap-3",
                  feedback.isCorrect ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
                )}
              >
                {feedback.isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                <span className="font-medium">{feedback.message}</span>
                {!feedback.isCorrect && (
                  <button 
                    onClick={() => setShowSolution(true)}
                    className="ml-auto text-xs font-bold underline"
                  >
                    Show Solution
                  </button>
                )}
              </motion.div>
            )}

            {showSolution && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-sm"
              >
                <h4 className="font-bold text-indigo-900 mb-2">Step-by-step Solution:</h4>
                <div className="space-y-2 text-indigo-800 font-mono">
                  {shape === 'rectangular' && (
                    <>
                      <div>S = 2(lw + lh + wh)</div>
                      <div>S = 2({dimensions.l}×{dimensions.w} + {dimensions.l}×{dimensions.h} + {dimensions.w}×{dimensions.h})</div>
                      <div>S = 2({dimensions.l * dimensions.w} + {dimensions.l * dimensions.h} + {dimensions.w * dimensions.h})</div>
                      <div>S = 2({dimensions.l * dimensions.w + dimensions.l * dimensions.h + dimensions.w * dimensions.h})</div>
                      <div className="font-bold">S = {calculateCorrectAnswer()} sq units</div>
                    </>
                  )}
                  {shape === 'triangular' && (
                    <>
                      <div>Base Area (B) = 0.5 × {dimensions.b} × {dimensions.h} = {0.5 * dimensions.b * dimensions.h}</div>
                      <div>Side length (s) ≈ {Math.sqrt((dimensions.b / 2) ** 2 + dimensions.h ** 2).toFixed(2)}</div>
                      <div>Perimeter (P) = {dimensions.b} + 2×{Math.sqrt((dimensions.b / 2) ** 2 + dimensions.h ** 2).toFixed(2)} ≈ {(dimensions.b + 2 * Math.sqrt((dimensions.b / 2) ** 2 + dimensions.h ** 2)).toFixed(2)}</div>
                      <div>Lateral Area (L) = P × H = {(dimensions.b + 2 * Math.sqrt((dimensions.b / 2) ** 2 + dimensions.h ** 2)).toFixed(2)} × {dimensions.ph}</div>
                      <div>Total Area (S) = 2B + L</div>
                      <div className="font-bold">S ≈ {calculateCorrectAnswer().toFixed(2)} sq units</div>
                    </>
                  )}
                  {shape === 'cylinder' && (
                    <>
                      <div>S = 2πr² + 2πrh</div>
                      <div>S = 2(3.14)({dimensions.r}²) + 2(3.14)({dimensions.r})({dimensions.h})</div>
                      <div>S = 6.28({dimensions.r * dimensions.r}) + 6.28({dimensions.r * dimensions.h})</div>
                      <div>S = {(6.28 * dimensions.r * dimensions.r).toFixed(2)} + {(6.28 * dimensions.r * dimensions.h).toFixed(2)}</div>
                      <div className="font-bold">S ≈ {calculateCorrectAnswer().toFixed(2)} sq units</div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-100 p-8">
           <Resulting3DShape 
             shape={shape} 
             dimensions={
               shape === 'rectangular' ? { length: dimensions.l, width: dimensions.w, height: dimensions.h } :
               shape === 'triangular' ? { base: dimensions.b, triangleHeight: dimensions.h, prismHeight: dimensions.ph } :
               shape === 'cylinder' ? { radius: dimensions.r, height: dimensions.h } :
               {}
             } 
           />
        </div>
      </div>
    </div>
  );
}

function QuizComponent() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);

  const startQuiz = (level: 'easy' | 'medium' | 'hard') => {
    const filtered = ALL_QUESTIONS.filter(q => q.difficulty === level);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, 10));
    setDifficulty(level);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setShowResults(false);
  };

  const resetQuiz = () => {
    setDifficulty(null);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setShowResults(false);
  };

  const handleOptionSelect = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    if (selectedOption === quizQuestions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setShowResults(true);
    }
  };

  if (!difficulty) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
          <GraduationCap className="text-indigo-600 w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Start Assessment</h2>
        <p className="text-slate-600 mb-10 max-w-md mx-auto">
          Test your knowledge of surface area! Select a difficulty level to begin your 10-question assessment.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <DifficultyCard 
            level="easy" 
            title="Easy" 
            description="Identifying shapes and basic formulas." 
            color="bg-emerald-50 text-emerald-700 border-emerald-100"
            onClick={() => startQuiz('easy')}
          />
          <DifficultyCard 
            level="medium" 
            title="Medium" 
            description="Calculations and problem solving." 
            color="bg-amber-50 text-amber-700 border-amber-100"
            onClick={() => startQuiz('medium')}
          />
          <DifficultyCard 
            level="hard" 
            title="Hard" 
            description="Real-world scenarios and complex problems." 
            color="bg-rose-50 text-rose-700 border-rose-100"
            onClick={() => startQuiz('hard')}
          />
        </div>
      </div>
    );
  }

  const QuizModeTabs = () => (
    <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl w-fit print:hidden">
      <button
        onClick={() => setIsPrintMode(false)}
        className={cn(
          "px-6 py-2 rounded-lg text-sm font-bold transition-all",
          !isPrintMode 
            ? "bg-emerald-600 text-white shadow-md" 
            : "text-slate-500 hover:bg-slate-200"
        )}
      >
        Digital Quiz
      </button>
      <button
        onClick={() => setIsPrintMode(true)}
        className={cn(
          "px-6 py-2 rounded-lg text-sm font-bold transition-all",
          isPrintMode 
            ? "bg-amber-500 text-white shadow-md" 
            : "text-slate-500 hover:bg-slate-200"
        )}
      >
        Printable Version
      </button>
    </div>
  );

  if (isPrintMode) {
    return (
      <div className="space-y-4">
        <QuizModeTabs />
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-2">Surface Area Assessment</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">{difficulty} Level</p>
            <p className="text-slate-500 italic">Name: ____________________________________ Date: _______________</p>
          </div>

          <div className="space-y-10">
            {quizQuestions.map((q, i) => (
              <div key={q.id} className="break-inside-avoid">
                <p className="font-bold mb-4">{i + 1}. {q.text}</p>
                <div className="grid grid-cols-2 gap-4 ml-4">
                  {q.options.map((opt, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-slate-400 rounded-full" />
                      <span className="text-sm">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 print:hidden">
            <button 
              onClick={() => window.print()}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              Print Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="space-y-4">
        <QuizModeTabs />
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
            <GraduationCap className="text-indigo-600 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Assessment Complete!</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">{difficulty} Mode</p>
          <p className="text-slate-600 mb-2">You scored {score} out of {quizQuestions.length}</p>
          <p className="text-sm text-slate-400 mb-8">({Math.round((score / quizQuestions.length) * 100)}%)</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => startQuiz(difficulty!)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              Try New Set
            </button>
            <button
              onClick={resetQuiz}
              className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Change Difficulty
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  return (
    <div className="space-y-4">
      <QuizModeTabs />
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
                difficulty === 'easy' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                difficulty === 'medium' ? "bg-amber-50 text-amber-700 border-amber-100" :
                "bg-rose-50 text-rose-700 border-rose-100"
              )}>
                {difficulty}
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Digital Assessment Mode</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300" 
                style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-8">{currentQuestion.text}</h3>

        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionSelect(option)}
              className={cn(
                "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between",
                selectedOption === option 
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900" 
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                isSubmitted && option === currentQuestion.correctAnswer && "border-emerald-600 bg-emerald-50 text-emerald-900",
                isSubmitted && selectedOption === option && option !== currentQuestion.correctAnswer && "border-rose-600 bg-rose-50 text-rose-900"
              )}
            >
              <span>{option}</span>
              {isSubmitted && option === currentQuestion.correctAnswer && <CheckCircle2 className="text-emerald-600" size={20} />}
              {isSubmitted && selectedOption === option && option !== currentQuestion.correctAnswer && <XCircle className="text-rose-600" size={20} />}
            </button>
          ))}
        </div>

        {isSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-8 text-sm"
          >
            <p className="font-semibold text-slate-900 mb-1">Explanation:</p>
            <p className="text-slate-600">{currentQuestion.explanation}</p>
          </motion.div>
        )}

        <div className="flex justify-end">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Assessment' : 'Next Question'}
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, max }: { label: string; value: number; onChange: (v: number) => void; max: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium text-slate-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
    </div>
  );
}

function StatCard({ label, value, unit, color = "slate", tooltip }: { label: string; value: number; unit: string; color?: "slate" | "indigo" | "emerald"; tooltip?: string }) {
  const colors = {
    slate: "bg-slate-50 border-slate-200 text-slate-900",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900"
  };

  return (
    <div className={cn("p-4 rounded-2xl border transition-all", colors[color])}>
      <div className="flex items-center gap-1 mb-1">
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</p>
        {tooltip && <FormulaTooltip explanation={tooltip} />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        <span className="text-[10px] font-medium opacity-60">{unit}</span>
      </div>
    </div>
  );
}

function FormulaTooltip({ explanation }: { explanation: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block ml-1 align-middle">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
      >
        <Info size={14} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl pointer-events-none leading-relaxed"
          >
            <div className="relative">
              {explanation}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
