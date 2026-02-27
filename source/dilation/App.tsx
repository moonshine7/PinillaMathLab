import React, { useState, useEffect, useRef } from 'react';
import CartesianPlane from './components/CartesianPlane';
import { generateShapeData, transformShapeData } from './services/geminiService';
import type { ShapeData } from './types';

const LoadingSpinner = ({ text = 'Gemini is thinking...' }: { text?: string }) => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-green-400"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-green-400 delay-200"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-green-400 delay-400"></div>
        <span className="ml-2 text-gray-400">{text}</span>
    </div>
);

const ShapeDetailsCard = ({ title, shapeData }: { title: string, shapeData: ShapeData }) => (
    <div className="animate-fade-in">
        <h3 className="text-xl font-semibold mb-3 border-b border-gray-600 pb-2">{title}</h3>
        <div className="space-y-4">
            <div>
                <span className="text-gray-400 text-sm">Shape Type</span>
                <p className="text-xl font-medium text-green-400 capitalize">{shapeData.shapeType}</p>
            </div>
            <div>
                <span className="text-gray-400 text-sm">Quadrant</span>
                <p className="text-xl font-medium">{shapeData.quadrant}</p>
            </div>
            <div>
                <span className="text-gray-400 text-sm">Vertices</span>
                <ul className="mt-2 space-y-2">
                    {shapeData.vertices.map(v => (
                        <li key={v.label} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
                            <span className="font-bold text-yellow-400 text-lg">{v.label}</span>
                            <span className="font-mono text-gray-300 text-lg">({v.x}, {v.y})</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

const CombinedShapeDetails = ({ originalShape, enlargedShape, scaleFactor }: { originalShape: ShapeData, enlargedShape: ShapeData, scaleFactor: number | null }) => {
    // Create a map for efficient lookup of enlarged vertices based on the original label.
    // e.g., key "A" will map to the vertex object with label "A'".
    const enlargedVerticesMap = new Map(
        enlargedShape.vertices.map(v => [v.label.replace("'", ""), v])
    );
    
    const transformationType = scaleFactor === null ? "Transformed" : scaleFactor > 1 ? "Enlarged" : "Reduced";

    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-3 border-b border-gray-600 pb-2">Comparison Details</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
                 <div>
                    <span className="text-gray-400 text-sm">Original Shape</span>
                    <p className="text-lg font-medium text-green-400 capitalize">{originalShape.shapeType}</p>
                </div>
                 <div>
                    <span className="text-gray-400 text-sm">{transformationType} Shape</span>
                    <p className="text-lg font-medium text-purple-400 capitalize">{enlargedShape.shapeType}</p>
                </div>
             </div>
            <div>
                <span className="text-gray-400 text-sm">Vertex Comparison</span>
                 {/* Headers for the vertex list */}
                <div className="grid grid-cols-10 text-xs font-semibold text-gray-400 mt-3 mb-2">
                    <div className="col-span-3 border-r border-gray-600 pl-3 pr-2 py-1">Original</div>
                    <div className="col-span-3 border-r border-gray-600 px-3 py-1">Enlarged</div>
                    <div className="text-center col-span-4 pr-3 pl-2 py-1">SF Calc</div>
                </div>
                <ul className="space-y-2">
                    {originalShape.vertices.map(originalVertex => {
                        const enlargedVertex = enlargedVerticesMap.get(originalVertex.label);

                        return (
                            <li key={originalVertex.label} className="grid grid-cols-10 items-center bg-gray-700/50 rounded-md text-sm">
                                {/* Original Vertex */}
                                <div className="col-span-3 flex items-center justify-between border-r border-gray-600 p-3">
                                    <span className="font-bold text-yellow-400">{originalVertex.label}</span>
                                    <span className="font-mono text-gray-300 whitespace-nowrap">({originalVertex.x}, {originalVertex.y})</span>
                                </div>

                                {/* Enlarged Vertex, SF Calc */}
                                {enlargedVertex ? (
                                    <>
                                        <div className="col-span-3 flex items-center justify-between border-r border-gray-600 p-3">
                                            <span className="font-bold text-fuchsia-400">{enlargedVertex.label}</span>
                                            <span className="font-mono text-gray-300 whitespace-nowrap">({enlargedVertex.x}, {enlargedVertex.y})</span>
                                        </div>
                                        <div className="col-span-4 text-center font-mono text-cyan-400 p-3 text-xs flex flex-col items-center justify-center leading-tight">
                                            <span>
                                                {originalVertex.x !== 0
                                                    ? `SFx=${enlargedVertex.x}/${originalVertex.x}=${(enlargedVertex.x / originalVertex.x).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                                                    : "SFx=Undef."
                                                }
                                            </span>
                                            <span>
                                                {originalVertex.y !== 0
                                                    ? `SFy=${enlargedVertex.y}/${originalVertex.y}=${(enlargedVertex.y / originalVertex.y).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                                                    : "SFy=Undef."
                                                }
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="col-span-7" /> // Empty div for alignment if no match is found
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};


const ShapeSelector = ({ onSelect, disabled, hasShape }: { onSelect: (shape: string, generationType: 'enlarge' | 'reduce') => void; disabled: boolean; hasShape: boolean; }) => {
    const [isOpen, setIsOpen] = useState(false);
    const shapes = ['triangle', 'square', 'rectangle', 'trapezoid'];
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);


    const handleSelect = (shape: string, generationType: 'enlarge' | 'reduce') => {
        setIsOpen(false);
        onSelect(shape, generationType);
    }

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className="w-full flex justify-between items-center py-3 px-6 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
                <span>{hasShape ? 'Generate New Shape' : 'Generate Shape'}</span>
                <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-2 bg-gray-700 border border-gray-600 rounded-md shadow-lg animate-fade-in">
                    <div className="px-4 pt-2 pb-1 text-xs font-bold text-gray-400 uppercase">For Enlarging</div>
                    <ul className="pb-1">
                        {shapes.map(shape => (
                            <li key={`enlarge-${shape}`}>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleSelect(shape, 'enlarge'); }} className="block px-4 py-2 text-sm text-gray-200 hover:bg-green-600 capitalize transition-colors duration-150">
                                    {shape}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-gray-600"></div>
                     <div className="px-4 pt-2 pb-1 text-xs font-bold text-gray-400 uppercase">For Reducing</div>
                    <ul className="pb-1">
                        {shapes.map(shape => (
                            <li key={`reduce-${shape}`}>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleSelect(shape, 'reduce'); }} className="block px-4 py-2 text-sm text-gray-200 hover:bg-green-600 capitalize transition-colors duration-150">
                                    {shape}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const App: React.FC = () => {
    const [shapeData, setShapeData] = useState<ShapeData | null>(null);
    const [enlargedShapeData, setEnlargedShapeData] = useState<ShapeData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDilating, setIsDilating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [scaleFactor, setScaleFactor] = useState<number | null>(null);
    const [scaleFactorInput, setScaleFactorInput] = useState<string>('2');

    const handleGenerateShape = async (shapeType: string, generationType: 'enlarge' | 'reduce') => {
        setIsLoading(true);
        setError(null);
        setShapeData(null);
        setEnlargedShapeData(null);
        setScaleFactor(null);
        setScaleFactorInput(generationType === 'reduce' ? '0.5' : '2');
        try {
            const data = await generateShapeData(shapeType, generationType);
            setShapeData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDilation = async () => {
        if (!shapeData) return;

        const customScaleFactor = parseFloat(scaleFactorInput);
        if (isNaN(customScaleFactor) || customScaleFactor <= 0) {
            setError('Scale factor must be a positive number.');
            return;
        }

        if (customScaleFactor === 1) {
            setError('A scale factor of 1 results in no change. Please enter a different value.');
            return;
        }

        setIsDilating(true);
        setError(null);
        setScaleFactor(customScaleFactor);

        try {
            const data = await transformShapeData(shapeData, customScaleFactor);
            setEnlargedShapeData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setScaleFactor(null);
        } finally {
            setIsDilating(false);
        }
    };

    const handleReset = () => {
        setShapeData(null);
        setEnlargedShapeData(null);
        setError(null);
        setScaleFactor(null);
        setScaleFactorInput('2');
    };

    return (
        <div className="h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 overflow-hidden">
            <div className="w-full max-w-6xl mx-auto flex flex-col h-full">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                        Geometric Shape Generator
                    </h1>
                    <p className="mt-2 text-lg text-gray-400">
                        Using Gemini 2.5 Pro to plot and transform geometric shapes
                    </p>
                </header>

                <main className="flex flex-col md:flex-row gap-8 flex-1 min-h-0">
                    <div className="md:w-3/5 w-full flex items-center justify-center min-h-0">
                        <CartesianPlane shapeData={shapeData} enlargedShapeData={enlargedShapeData} dilationScaleFactor={scaleFactor} />
                    </div>
                    <div className="md:w-2/5 w-full bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col overflow-y-auto">
                        <div className="flex-grow">
                             <div className="mb-6">
                                <ShapeSelector 
                                    onSelect={handleGenerateShape}
                                    disabled={isLoading || isDilating}
                                    hasShape={!!shapeData}
                                />
                             </div>
                            <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Shape Details</h2>
                            {isLoading && <LoadingSpinner />}
                            {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</div>}
                            
                            {!isLoading && !error && !shapeData && (
                                <div className="text-center text-gray-500 py-10">
                                    <p className="text-lg">Click the button to generate a shape.</p>
                                    <p className="text-sm mt-2">Gemini will define a shape and its vertices.</p>
                                </div>
                            )}

                            {shapeData && !enlargedShapeData && <ShapeDetailsCard title="Original Shape" shapeData={shapeData} />}
                            {isDilating && <div className="mt-4"><LoadingSpinner text="Performing dilation..."/></div>}
                            {shapeData && enlargedShapeData && (
                                <CombinedShapeDetails originalShape={shapeData} enlargedShape={enlargedShapeData} scaleFactor={scaleFactor} />
                            )}
                        </div>
                        <div className="flex flex-col gap-4 mt-6">
                             {shapeData && !enlargedShapeData && (
                                <>
                                    <div className="animate-fade-in space-y-2">
                                        <label htmlFor="scale-factor-input" className="block text-sm font-medium text-gray-400">
                                            Dilation Scale Factor
                                        </label>
                                        <input
                                            type="number"
                                            id="scale-factor-input"
                                            value={scaleFactorInput}
                                            onChange={(e) => setScaleFactorInput(e.target.value)}
                                            step="0.1"
                                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                            placeholder="e.g., 2 or 0.5"
                                            aria-describedby="scale-factor-help"
                                            disabled={isDilating || isLoading}
                                        />
                                        <p id="scale-factor-help" className="text-xs text-gray-400">
                                            Enter a value &gt; 1 to enlarge, or between 0 and 1 to reduce.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                                        <button
                                            onClick={handleDilation}
                                            disabled={isDilating || isLoading}
                                            className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                        >
                                            {isDilating ? 'Dilating...' : 'DILATION'}
                                        </button>
                                    </div>
                                </>
                             )}
                             {shapeData && (
                                <button
                                    onClick={handleReset}
                                    disabled={isLoading || isDilating}
                                    className="w-full py-3 px-6 bg-gray-500 text-white font-bold rounded-lg shadow-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 animate-fade-in"
                                >
                                    Reset
                                </button>
                             )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
