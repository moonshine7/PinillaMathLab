import React from 'react';
import type { Point, ShapeType } from '../types';

type RotationSequenceType = '90ccw' | '90cw' | '270ccw' | '270cw';

interface ControlsProps {
    onTranslate: () => void;
    onReflectX: () => void;
    onReflectY: () => void;
    onRotate: () => void;
    onRotate180: () => void;
    isTransforming: boolean;
    initialCoords: Point[];
    finalCoords: Point[];
    shapeType: ShapeType;
    translationVector: { dx: number; dy: number } | null;
    transformationType: 'translate' | 'reflectX' | 'reflectY' | 'rotate90ccw' | 'rotate90cw' | 'rotate270ccw' | 'rotate270cw' | 'rotate180' | null;
    nextRotationType: RotationSequenceType;
}

const CoordinateDisplay: React.FC<{ title: string; coords: Point[] }> = ({ title, coords }) => (
    <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">{title}</h3>
        <div className="font-mono text-sm text-gray-300 space-y-1">
            {coords.map((p, i) => (
                <p key={i}>
                    Point {String.fromCharCode(65 + i)}: ( {p.x.toString().padStart(3, ' ')}, {p.y.toString().padStart(3, ' ')} )
                </p>
            ))}
        </div>
    </div>
);

export const Controls: React.FC<ControlsProps> = ({ 
    onTranslate, 
    onReflectX, 
    onReflectY, 
    onRotate,
    onRotate180,
    isTransforming, 
    initialCoords, 
    finalCoords, 
    shapeType, 
    translationVector, 
    transformationType,
    nextRotationType
}) => {
    
    const formatRulePart = (variable: 'x' | 'y', delta: number) => {
        if (delta === 0) return variable;
        const sign = delta > 0 ? '+' : '-';
        return `${variable} ${sign} ${Math.abs(delta)}`;
    };

    const getInfo = () => {
        if (!transformationType) return { title: 'Transformation', rule: null, properties: null };

        switch (transformationType) {
            case 'translate':
                return {
                    title: 'Translation',
                    rule: `( ${formatRulePart('x', translationVector?.dx ?? 0)}, ${formatRulePart('y', translationVector?.dy ?? 0)} )`,
                    properties: (
                        <>
                            <li>The <strong>area</strong> of the final image does not change.</li>
                            <li>The <strong>orientation</strong> of the final image does not change.</li>
                            <li>The <strong>angles</strong> of the final image do not change.</li>
                        </>
                    )
                };
            case 'reflectX':
                return {
                    title: 'Reflection over X-axis',
                    rule: `( x, -y )`,
                    properties: (
                        <>
                            <li>The <strong>area</strong> in the final image does not change.</li>
                            <li>The <strong>angles</strong> in the final image do not change.</li>
                            <li>The <strong>orientation</strong> has been changed (reversed).</li>
                        </>
                    )
                };
            case 'reflectY':
                return {
                    title: 'Reflection over Y-axis',
                    rule: `( -x, y )`,
                    properties: (
                        <>
                            <li>The <strong>area</strong> in the final image does not change.</li>
                            <li>The <strong>angles</strong> in the final image do not change.</li>
                            <li>The <strong>orientation</strong> has been changed (reversed).</li>
                        </>
                    )
                };
            case 'rotate90ccw':
                return {
                    title: 'Rotation (90° CCW / 270° CW)',
                    rule: `( -y, x )`,
                    properties: (
                        <>
                            <li>The <strong>area</strong> in the final image does not change.</li>
                            <li>The <strong>angles</strong> in the final image do not change.</li>
                            <li>The <strong>orientation</strong> of the final image has changed.</li>
                        </>
                    )
                };
             case 'rotate90cw':
                return {
                    title: 'Rotation (90° CW / 270° CCW)',
                    rule: `( y, -x )`,
                    properties: (
                        <>
                            <li>The <strong>area</strong> in the final image does not change.</li>
                            <li>The <strong>angles</strong> in the final image do not change.</li>
                            <li>The <strong>orientation</strong> of the final image has changed.</li>
                        </>
                    )
                };
            case 'rotate270ccw':
                return {
                    title: 'Rotation (270° CCW / 90° CW)',
                    rule: `( y, -x )`,
                    properties: (
                        <>
                            <li>The <strong>area</strong> in the final image does not change.</li>
                            <li>The <strong>angles</strong> in the final image do not change.</li>
                            <li>The <strong>orientation</strong> of the final image has changed.</li>
                        </>
                    )
                };
            case 'rotate270cw':
                return {
                    title: 'Rotation (270° CW / 90° CCW)',
                    rule: `( -y, x )`,
                    properties: (
                        <>
                            <li>The <strong>area</strong> in the final image does not change.</li>
                            <li>The <strong>angles</strong> in the final image do not change.</li>
                            <li>The <strong>orientation</strong> of the final image has changed.</li>
                        </>
                    )
                };
             case 'rotate180':
                return {
                    title: 'Rotation (180°)',
                    rule: `( -x, -y )`,
                    properties: (
                        <>
                            <li>The <strong>area</strong> in the final image does not change.</li>
                            <li>The <strong>angles</strong> in the final image do not change.</li>
                            <li>The <strong>orientation</strong> of the final image has changed.</li>
                            <li>Result is the same for Clockwise or Counter-Clockwise rotation.</li>
                        </>
                    )
                };
            default:
                return { title: 'Transformation', rule: null, properties: null };
        }
    };
    
    const { title: infoTitle, rule, properties } = getInfo();

    const isRotating = transformationType?.startsWith('rotate');

    return (
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col justify-between h-full">
            <div>
                 <h2 className="text-xl font-bold mb-4 capitalize">{shapeType} Transformation</h2>
                <div className="space-y-4">
                    <CoordinateDisplay title="Pre Image Coordinates" coords={initialCoords} />
                    <CoordinateDisplay title="Final Image Coordinates" coords={finalCoords} />
                    
                    {transformationType && (
                        <>
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-cyan-400 mb-2">{infoTitle} Rule</h3>
                                <div className="font-mono text-lg text-center text-gray-200 p-2 tracking-wider">
                                    <span>(x, y)</span>
                                    <span className="mx-2 text-cyan-400 font-bold">⟶</span>
                                    <span>
                                        {rule}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Properties</h3>
                                <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                                    {properties}
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            <div className="mt-6 flex flex-col gap-4">
                <button
                    onClick={onTranslate}
                    disabled={isTransforming}
                    className={`
                        w-full py-3 px-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 ease-in-out
                        focus:outline-none focus:ring-4 focus:ring-green-500/50
                        ${isTransforming
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-500 text-white transform hover:-translate-y-1'
                        }
                    `}
                >
                    {isTransforming && transformationType === 'translate' ? 'Translating...' : 'Translation'}
                </button>
                <div className="flex flex-col sm:flex-row gap-4">
                     <button
                        onClick={onRotate}
                        disabled={isTransforming}
                        className={`
                            w-full py-3 px-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 ease-in-out
                            focus:outline-none focus:ring-4 focus:ring-red-500/50
                            ${isTransforming
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-500 text-white transform hover:-translate-y-1'
                            }
                        `}
                    >
                        {isTransforming && (transformationType !== 'rotate180' && isRotating) ? 'Rotating...' : 'Rotation 90° / 270°'}
                    </button>
                    <button
                        onClick={onRotate180}
                        disabled={isTransforming}
                        className={`
                            w-full py-3 px-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 ease-in-out
                            focus:outline-none focus:ring-4 focus:ring-red-500/50
                            ${isTransforming
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-500 text-white transform hover:-translate-y-1'
                            }
                        `}
                    >
                        {isTransforming && transformationType === 'rotate180' ? 'Rotating...' : 'Rotation 180°'}
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={onReflectY}
                        disabled={isTransforming}
                        className={`
                            w-full py-3 px-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 ease-in-out
                            focus:outline-none focus:ring-4 focus:ring-yellow-400/50
                            ${isTransforming
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 transform hover:-translate-y-1'
                            }
                        `}
                    >
                        {isTransforming && transformationType === 'reflectY' ? 'Reflecting...' : 'Reflect over Y-axis'}
                    </button>
                    <button
                        onClick={onReflectX}
                        disabled={isTransforming}
                        className={`
                            w-full py-3 px-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 ease-in-out
                            focus:outline-none focus:ring-4 focus:ring-yellow-400/50
                            ${isTransforming
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 transform hover:-translate-y-1'
                            }
                        `}
                    >
                        {isTransforming && transformationType === 'reflectX' ? 'Reflecting...' : 'Reflect over X-axis'}
                    </button>
                </div>
            </div>
        </div>
    );
};