import React, { useState, useEffect, useCallback } from 'react';
import { generateMathScenario, generateInequalityScenario, generateMathQuiz } from './services/geminiService';
import { MathScenario, GraphDataPoint, QuizData } from './types';
import CartesianPlane from './components/CartesianPlane';
import MathTable from './components/MathTable';
import EquationCard from './components/EquationCard';
import InequalityDisplay from './components/InequalityDisplay';
import QuizComponent from './components/QuizComponent';
import { ArrowRight, RefreshCw, BrainCircuit, Calculator, PencilRuler, Eye, EyeOff, Save, FolderOpen, Check, ShieldAlert, LayoutDashboard, GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'quiz'>('visualizer');
  
  // Visualizer State
  const [mode, setMode] = useState<'gemini' | 'manual'>('gemini');
  const [scenario, setScenario] = useState<MathScenario | null>(null);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showImplication, setShowImplication] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [hoveredX, setHoveredX] = useState<number | null>(null);

  // Quiz State
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);

  // Manual Mode State
  const [manualConfig, setManualConfig] = useState({
    eq1Slope: '2',
    eq1Intercept: '0',
    eq1Name: 'Line A',
    eq2Slope: '-1',
    eq2Intercept: '6',
    eq2Name: 'Line B'
  });

  // Helper to show temporary notifications
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const generateDataPoints = useCallback((scen: MathScenario): GraphDataPoint[] => {
    const { equation1, equation2, intersectionPoint } = scen;
    const intersectX = intersectionPoint.x;
    
    // Calculate a view range centered on the intersection
    const padding = Math.max(15, Math.abs(intersectX) * 0.8);
    let startX = Math.floor(intersectX - padding);
    let endX = Math.ceil(intersectX + padding);

    // Ensure the X-axis origin (0) is included in the view with a small buffer
    // This ensures the Y-axis is visible
    if (startX > -5) startX = -5;
    if (endX < 5) endX = 5;
    
    const points: GraphDataPoint[] = [];
    // Determine step size to avoid rendering too many points if range is large
    const range = endX - startX;
    const step = range > 200 ? Math.ceil(range / 100) : 1;
    
    for (let x = startX; x <= endX; x += step) {
      points.push({
        x,
        y1: equation1.slope * x + equation1.intercept,
        y2: equation2.slope * x + equation2.intercept,
      });
    }
    return points;
  }, []);

  const handleSave = () => {
    if (!scenario) return;
    try {
      localStorage.setItem('geminiMathSolver_savedScenario', JSON.stringify(scenario));
      showNotification("Scenario saved successfully!");
    } catch (err) {
      console.error(err);
      showNotification("Failed to save scenario.");
    }
  };

  const handleLoad = () => {
    try {
      const saved = localStorage.getItem('geminiMathSolver_savedScenario');
      if (saved) {
        const parsedScenario = JSON.parse(saved) as MathScenario;
        setScenario(parsedScenario);
        setGraphData(generateDataPoints(parsedScenario));
        setShowImplication(true);
        showNotification("Loaded last saved scenario!");
        setActiveTab('visualizer');
      } else {
        showNotification("No saved scenario found.");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to load scenario.");
    }
  };

  const handleGenerate = async (type: 'equation' | 'inequality' = 'equation') => {
    setLoading(true);
    setError(null);
    setShowImplication(true);
    setHoveredX(null);
    try {
      let newScenario: MathScenario;
      if (type === 'inequality') {
        newScenario = await generateInequalityScenario();
      } else {
        newScenario = await generateMathScenario();
      }
      setScenario(newScenario);
      setGraphData(generateDataPoints(newScenario));
    } catch (err) {
      setError("Failed to generate a scenario. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    setError(null);
    try {
      const data = await generateMathQuiz();
      setQuizData(data);
    } catch (err) {
      setError("Failed to generate quiz. Please try again.");
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleManualCalculate = () => {
    setError(null);
    setHoveredX(null);
    
    if (
      manualConfig.eq1Slope.trim() === '' ||
      manualConfig.eq1Intercept.trim() === '' ||
      manualConfig.eq2Slope.trim() === '' ||
      manualConfig.eq2Intercept.trim() === ''
    ) {
      setError("All fields are required. Please fill in slope and intercept for both lines.");
      return;
    }

    const m1 = Number(manualConfig.eq1Slope);
    const b1 = Number(manualConfig.eq1Intercept);
    const m2 = Number(manualConfig.eq2Slope);
    const b2 = Number(manualConfig.eq2Intercept);

    if (isNaN(m1) || isNaN(b1) || isNaN(m2) || isNaN(b2)) {
      setError("Please enter valid numeric values. Ensure there are no non-numeric characters.");
      return;
    }

    if (Math.abs(m1 - m2) < 0.000001) {
      setError("Slopes are identical (parallel lines). They do not intersect at a single point.");
      return;
    }

    // Calculate intersection
    const x = (b2 - b1) / (m1 - m2);
    const y = m1 * x + b1;

    const cleanX = Math.round(x * 1000) / 1000;
    const cleanY = Math.round(y * 1000) / 1000;

    const manualScenario: MathScenario = {
      title: "Manual Calculation",
      description: `Custom linear system solved: y = ${m1}x + ${b1} and y = ${m2}x + ${b2}.`,
      equation1: {
        slope: m1,
        intercept: b1,
        name: manualConfig.eq1Name || 'Equation 1',
        isProportional: b1 === 0,
        inequality: '='
      },
      equation2: {
        slope: m2,
        intercept: b2,
        name: manualConfig.eq2Name || 'Equation 2',
        isProportional: b2 === 0,
        inequality: '='
      },
      intersectionPoint: { x: cleanX, y: cleanY },
      realWorldImplication: "The mathematical point where both equations share the same X and Y coordinates."
    };

    setScenario(manualScenario);
    setGraphData(generateDataPoints(manualScenario));
    setShowImplication(true);
  };

  // Initial load
  useEffect(() => {
    handleGenerate('equation');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load quiz on tab switch if empty
  useEffect(() => {
    if (activeTab === 'quiz' && !quizData && !quizLoading) {
      handleGenerateQuiz();
    }
  }, [activeTab, quizData, quizLoading]);

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setManualConfig({
      ...manualConfig,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="bg-green-500 rounded-full p-1">
             <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      <header className="max-w-7xl mx-auto mb-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
                  <BrainCircuit className="text-white w-6 h-6" />
              </div>
              <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Gemini Math Solver</h1>
                  <p className="text-slate-500 text-sm">Powered by Gemini 3.0 Pro Thinking Mode</p>
              </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Tab Navigation */}
            <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm h-[48px]">
                <button 
                   onClick={() => setActiveTab('visualizer')}
                   className={`flex items-center gap-2 px-6 rounded-md text-sm font-bold transition-all ${
                     activeTab === 'visualizer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                   }`}
                >
                   <LayoutDashboard className="w-4 h-4" />
                   Visualizer
                </button>
                <button 
                   onClick={() => setActiveTab('quiz')}
                   className={`flex items-center gap-2 px-6 rounded-md text-sm font-bold transition-all ${
                     activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                   }`}
                >
                   <GraduationCap className="w-4 h-4" />
                   QUIZ ME
                </button>
            </div>

            {/* Storage Controls (Only visible in Visualizer) */}
            {activeTab === 'visualizer' && (
              <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm h-[42px]">
                  <button 
                     onClick={handleSave}
                     disabled={!scenario}
                     className="px-3 py-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors relative group border-r border-slate-100"
                     title="Save Current Scenario"
                  >
                     <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        <span className="text-xs font-medium hidden sm:inline">Save</span>
                     </div>
                  </button>
                  <button 
                     onClick={handleLoad}
                     className="px-3 py-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                     title="Load Last Saved Scenario"
                  >
                     <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        <span className="text-xs font-medium hidden sm:inline">Load</span>
                     </div>
                  </button>
              </div>
            )}
          </div>
        </div>

        {/* Visualizer Controls */}
        {activeTab === 'visualizer' && (
          <div className="w-full animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              {/* Mode Toggle */}
              <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm h-[42px]">
                  <button 
                  onClick={() => setMode('gemini')}
                  className={`flex items-center gap-2 px-4 py-1 rounded-md text-sm font-medium transition-all ${
                      mode === 'gemini' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  >
                  <BrainCircuit className="w-4 h-4" />
                  AI Generator
                  </button>
                  <button 
                  onClick={() => setMode('manual')}
                  className={`flex items-center gap-2 px-4 py-1 rounded-md text-sm font-medium transition-all ${
                      mode === 'manual' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  >
                  <PencilRuler className="w-4 h-4" />
                  Manual Solver
                  </button>
              </div>

              {mode === 'gemini' && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleGenerate('equation')}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-full shadow-md transition-all transform hover:scale-105 font-medium text-sm"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        New Equation
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleGenerate('inequality')}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-fuchsia-400 text-white rounded-full shadow-md transition-all transform hover:scale-105 font-medium text-sm"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4" />
                        New Inequality
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {mode === 'manual' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-600"/>
                  Input Equations (y = mx + b)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  {/* Equation 1 Inputs */}
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-800">Line 1</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs text-blue-600 mb-1 font-bold">Slope (m)</label>
                         <input 
                          type="number" 
                          step="any"
                          name="eq1Slope"
                          value={manualConfig.eq1Slope}
                          onChange={handleManualInputChange}
                          className="w-full px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                          placeholder="2"
                         />
                      </div>
                      <div>
                         <label className="block text-xs text-blue-600 mb-1 font-bold">Y-Intercept (b)</label>
                         <input 
                          type="number" 
                          step="any"
                          name="eq1Intercept"
                          value={manualConfig.eq1Intercept}
                          onChange={handleManualInputChange}
                          className="w-full px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                          placeholder="0"
                         />
                      </div>
                    </div>
                    <div>
                         <label className="block text-xs text-blue-600 mb-1 font-bold">Label</label>
                         <input 
                          type="text"
                          name="eq1Name"
                          value={manualConfig.eq1Name}
                          onChange={handleManualInputChange}
                          className="w-full px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                          placeholder="e.g. Runner A"
                         />
                    </div>
                  </div>

                  {/* Equation 2 Inputs */}
                  <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-100">
                    <h3 className="font-medium text-red-800">Line 2</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs text-red-600 mb-1 font-bold">Slope (m)</label>
                         <input 
                          type="number" 
                          step="any"
                          name="eq2Slope"
                          value={manualConfig.eq2Slope}
                          onChange={handleManualInputChange}
                          className="w-full px-3 py-2 border border-red-200 rounded focus:ring-2 focus:ring-red-400 outline-none"
                          placeholder="-1"
                         />
                      </div>
                      <div>
                         <label className="block text-xs text-red-600 mb-1 font-bold">Y-Intercept (b)</label>
                         <input 
                          type="number" 
                          step="any"
                          name="eq2Intercept"
                          value={manualConfig.eq2Intercept}
                          onChange={handleManualInputChange}
                          className="w-full px-3 py-2 border border-red-200 rounded focus:ring-2 focus:ring-red-400 outline-none"
                          placeholder="6"
                         />
                      </div>
                    </div>
                    <div>
                         <label className="block text-xs text-red-600 mb-1 font-bold">Label</label>
                         <input 
                          type="text"
                          name="eq2Name"
                          value={manualConfig.eq2Name}
                          onChange={handleManualInputChange}
                          className="w-full px-3 py-2 border border-red-200 rounded focus:ring-2 focus:ring-red-400 outline-none"
                          placeholder="e.g. Runner B"
                         />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                   <button 
                     onClick={handleManualCalculate}
                     className="px-8 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors font-semibold flex items-center gap-2"
                   >
                      <Calculator className="w-5 h-5" />
                      Calculate Intersection
                   </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r text-red-700 flex items-center gap-3 shadow-sm">
            <div className="p-2 bg-red-100 rounded-full">
              <Calculator className="w-4 h-4 text-red-600" />
            </div>
            <p>{error}</p>
          </div>
        )}

        {/* VISUALIZER TAB CONTENT */}
        {activeTab === 'visualizer' && (
          <>
            {loading && !scenario && mode === 'gemini' && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                 <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                 <p className="text-slate-500 animate-pulse">Gemini is reasoning through a complex scenario...</p>
              </div>
            )}

            {scenario && (!loading || mode === 'manual') && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
                {/* Left Column: Scenario & Equations */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-indigo-900 mb-2">{scenario.title}</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      {scenario.description}
                    </p>
                    
                    <div className="border-t border-slate-100 pt-2 mt-4">
                      <button
                        onClick={() => setShowImplication(!showImplication)}
                        className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors mb-3 focus:outline-none"
                      >
                        {showImplication ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Hide Explanation
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Show Explanation
                          </>
                        )}
                      </button>

                      {showImplication && (
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 animate-in fade-in slide-in-from-top-1 duration-200">
                            <h3 className="font-semibold text-indigo-800 mb-1 flex items-center gap-2">
                                Real World Implication <ArrowRight className="w-4 h-4"/>
                            </h3>
                            <p className="text-indigo-700 text-sm italic">
                                "{scenario.realWorldImplication}"
                            </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {scenario.comparisonOperator ? (
                      <InequalityDisplay 
                        equation1={scenario.equation1}
                        equation2={scenario.equation2}
                        operator={scenario.comparisonOperator}
                        hoveredX={hoveredX}
                      />
                    ) : (
                      <>
                        <EquationCard 
                            equation={scenario.equation1} 
                            variable="y1" 
                            colorClass="border-blue-500"
                            hoveredX={hoveredX}
                        />
                        <EquationCard 
                            equation={scenario.equation2} 
                            variable="y2" 
                            colorClass="border-red-500"
                            hoveredX={hoveredX}
                        />
                      </>
                    )}
                  </div>
                  
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-2">Calculated Intersection</h3>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-100">
                        <span className="text-green-700 font-medium">Coordinate</span>
                        <span className="font-mono font-bold text-green-800 text-lg">
                            ({scenario.intersectionPoint.x}, {scenario.intersectionPoint.y})
                        </span>
                    </div>
                   </div>
                </div>

                {/* Right Column: Visualization & Data */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <CartesianPlane 
                     data={graphData} 
                     scenario={scenario} 
                     onChartHover={setHoveredX}
                  />
                  
                  <div className="flex-grow">
                      <MathTable 
                        data={graphData} 
                        equation1={scenario.equation1} 
                        equation2={scenario.equation2}
                        intersectionX={scenario.intersectionPoint.x}
                        hoveredX={hoveredX}
                      />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* QUIZ TAB CONTENT */}
        {activeTab === 'quiz' && (
          <div className="animate-in fade-in duration-500">
             {quizLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                   <div className="w-20 h-20 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin"></div>
                   <div className="text-center">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Generating Your Quiz</h3>
                      <p className="text-slate-500">Gemini is crafting 20 challenging questions for you...</p>
                   </div>
                </div>
             ) : quizData ? (
               <QuizComponent quizData={quizData} onRegenerate={handleGenerateQuiz} />
             ) : (
               <div className="text-center py-20">
                 <p className="text-slate-500">Failed to load quiz. Please try again.</p>
                 <button onClick={handleGenerateQuiz} className="mt-4 text-indigo-600 hover:underline">Retry</button>
               </div>
             )}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;