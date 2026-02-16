import React from 'react';
import { LineEquation, InequalityType } from '../types';

interface InequalityDisplayProps {
  equation1: LineEquation;
  equation2: LineEquation;
  operator: InequalityType;
  hoveredX: number | null;
}

const InequalityDisplay: React.FC<InequalityDisplayProps> = ({ equation1, equation2, operator, hoveredX }) => {
  
  const formatExpression = (slope: number, intercept: number) => {
    let expr = "";
    
    // Slope term
    if (slope === 1) expr += "x";
    else if (slope === -1) expr += "-x";
    else if (slope !== 0) expr += `${slope}x`;
    
    // Intercept term
    if (intercept > 0) {
        expr += slope !== 0 ? ` + ${intercept}` : `${intercept}`;
    } else if (intercept < 0) {
        expr += slope !== 0 ? ` - ${Math.abs(intercept)}` : `${intercept}`;
    } else {
        if (slope === 0) expr += "0";
    }
    
    return expr;
  };

  const calculateValue = (eq: LineEquation, x: number) => {
      return (eq.slope * x + eq.intercept).toFixed(2);
  };

  const eq1Val = hoveredX !== null ? calculateValue(equation1, hoveredX) : null;
  const eq2Val = hoveredX !== null ? calculateValue(equation2, hoveredX) : null;
  const isConditionTrue = eq1Val && eq2Val ? eval(`${eq1Val} ${operator === '=' ? '==' : operator} ${eq2Val}`) : false;

  return (
    <div className="flex flex-col gap-2 w-full">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide text-center">Solve for X</h3>
      <div className="flex items-stretch justify-center gap-2 md:gap-4">
        
        {/* Left Expression (Equation 1) */}
        <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded mb-2">
            {equation1.name}
          </div>
          <div className="text-xl md:text-2xl font-mono font-bold text-slate-800 text-center">
             {formatExpression(equation1.slope, equation1.intercept)}
          </div>
          {/* Dynamic Value Overlay */}
          {eq1Val && (
             <div className="mt-2 text-blue-800 font-bold bg-white px-2 py-1 rounded shadow-sm text-sm animate-in fade-in">
                Value: {eq1Val}
             </div>
          )}
        </div>

        {/* Operator */}
        <div className={`flex items-center justify-center w-16 md:w-20 bg-slate-800 text-white text-3xl md:text-4xl font-black rounded-xl shadow-lg z-10 ${hoveredX !== null ? (isConditionTrue ? 'bg-green-600 ring-4 ring-green-200' : 'bg-slate-400 opacity-50') : ''} transition-all duration-300`}>
           {operator}
        </div>

        {/* Right Expression (Equation 2) */}
        <div className="flex-1 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded mb-2">
             {equation2.name}
          </div>
          <div className="text-xl md:text-2xl font-mono font-bold text-slate-800 text-center">
             {formatExpression(equation2.slope, equation2.intercept)}
          </div>
          {/* Dynamic Value Overlay */}
          {eq2Val && (
             <div className="mt-2 text-red-800 font-bold bg-white px-2 py-1 rounded shadow-sm text-sm animate-in fade-in">
                Value: {eq2Val}
             </div>
          )}
        </div>
      </div>
      
      {hoveredX !== null && (
          <div className={`text-center text-sm font-medium py-1 ${isConditionTrue ? 'text-green-600' : 'text-slate-400'}`}>
            At x = {hoveredX}, the inequality is {isConditionTrue ? 'TRUE' : 'FALSE'}
          </div>
      )}
    </div>
  );
};

export default InequalityDisplay;