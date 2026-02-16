import React, { useState, useCallback, useMemo } from 'react';
import { CartesianPlane } from './components/CartesianPlane';
import { Controls } from './components/Controls';
import { generateRandomShape, translateShapeToRandomQuadrant, reflectShapeOverXAxis, reflectShapeOverYAxis, rotateShape90DegreesCCW, rotateShape90DegreesCW, rotateShape180Degrees } from './utils/geometry';
import type { Shape, Quadrant } from './types';

const rotationSequence = ['90ccw', '90cw', '270ccw', '270cw'] as const;
type RotationSequenceType = typeof rotationSequence[number];

const App: React.FC = () => {
  const [initialShape, setInitialShape] = useState<Shape>(() => {
    const randomQuadrant = (Math.floor(Math.random() * 4) + 1) as Quadrant;
    return generateRandomShape(randomQuadrant);
  });
  const [finalShape, setFinalShape] = useState<Shape>(initialShape);
  const [isTransforming, setIsTransforming] = useState<boolean>(false);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [translationVector, setTranslationVector] = useState<{ dx: number; dy: number } | null>(null);
  const [transformationType, setTransformationType] = useState<'translate' | 'reflectX' | 'reflectY' | 'rotate90ccw' | 'rotate90cw' | 'rotate270ccw' | 'rotate270cw' | 'rotate180' | null>(null);
  const [nextRotationIndex, setNextRotationIndex] = useState(0);

  const currentShape = useMemo(() => finalShape, [finalShape]);
  const nextRotationType = useMemo(() => rotationSequence[nextRotationIndex], [nextRotationIndex]);

  const handleTranslate = useCallback(() => {
    if (isTransforming) return;

    setIsTransforming(true);
    setTransformationType('translate');
    const currentShapeForTransformation = currentShape;
    setInitialShape(currentShapeForTransformation);

    const newShape = translateShapeToRandomQuadrant(currentShapeForTransformation);
    
    // Calculate and set the translation vector based on the first point
    const dx = newShape.points[0].x - currentShapeForTransformation.points[0].x;
    const dy = newShape.points[0].y - currentShapeForTransformation.points[0].y;
    setTranslationVector({ dx, dy });

    setFinalShape(newShape);
    
    setAnimationKey(prevKey => prevKey + 1);
    
    setTimeout(() => {
      setIsTransforming(false);
    }, 12000);
  }, [currentShape, isTransforming]);

  const handleReflect = useCallback((axis: 'x' | 'y') => {
    if (isTransforming) return;

    setIsTransforming(true);
    setTransformationType(axis === 'x' ? 'reflectX' : 'reflectY');
    setTranslationVector(null); // Clear translation info for reflections

    const currentShapeForReflection = currentShape;
    setInitialShape(currentShapeForReflection);
    
    const newShape = axis === 'x' 
      ? reflectShapeOverXAxis(currentShapeForReflection)
      : reflectShapeOverYAxis(currentShapeForReflection);
      
    setFinalShape(newShape);
    setAnimationKey(prevKey => prevKey + 1);
    
    setTimeout(() => {
      setIsTransforming(false);
    }, 8000); 
  }, [currentShape, isTransforming]);

  const handleRotate = useCallback(() => {
    if (isTransforming) return;

    setIsTransforming(true);
    const rotationType = nextRotationType;
    
    // Set a specific transformation type for animation and display
    setTransformationType(`rotate${rotationType}`);
    setTranslationVector(null);

    const currentShapeForRotation = currentShape;
    setInitialShape(currentShapeForRotation);
    
    // The final coordinates for 90CCW are the same as 270CW, and 90CW is the same as 270CCW.
    const newShape = (rotationType === '90ccw' || rotationType === '270cw')
      ? rotateShape90DegreesCCW(currentShapeForRotation)
      : rotateShape90DegreesCW(currentShapeForRotation);
      
    setFinalShape(newShape);
    setAnimationKey(prevKey => prevKey + 1);
    
    // Cycle to the next rotation type
    setNextRotationIndex(prev => (prev + 1) % rotationSequence.length);
    
    // Use a longer timeout for the multi-stage rotation animation
    setTimeout(() => {
      setIsTransforming(false);
    }, 18000); 
  }, [currentShape, isTransforming, nextRotationType]);

  const handleRotate180 = useCallback(() => {
    if (isTransforming) return;

    setIsTransforming(true);
    setTransformationType('rotate180');
    setTranslationVector(null);

    const currentShapeForRotation = currentShape;
    setInitialShape(currentShapeForRotation);
    
    const newShape = rotateShape180Degrees(currentShapeForRotation);
      
    setFinalShape(newShape);
    setAnimationKey(prevKey => prevKey + 1);
    
    setTimeout(() => {
      setIsTransforming(false);
    }, 16000); 
  }, [currentShape, isTransforming]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left Side: Cartesian Plane */}
        <div className="flex-grow lg:w-2/3 bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col items-center justify-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4">Geometric Transformations</h1>
            <CartesianPlane 
                initialShape={initialShape}
                finalShape={finalShape}
                animationKey={animationKey}
                transformationType={transformationType}
                translationVector={translationVector}
            />
        </div>

        {/* Right Side: Controls and Information */}
        <div className="lg:w-1/3 flex flex-col space-y-6">
            <Controls 
                onTranslate={handleTranslate} 
                onReflectX={() => handleReflect('x')}
                onReflectY={() => handleReflect('y')}
                onRotate={handleRotate}
                onRotate180={handleRotate180}
                isTransforming={isTransforming}
                initialCoords={initialShape.points}
                finalCoords={finalShape.points}
                shapeType={currentShape.type}
                translationVector={translationVector}
                transformationType={transformationType}
                nextRotationType={nextRotationType}
            />
        </div>
      </div>
       <footer className="text-center text-gray-500 mt-8">
            <p>An interactive tool to visualize geometric transformations on a Cartesian plane.</p>
        </footer>
    </div>
  );
};

export default App;