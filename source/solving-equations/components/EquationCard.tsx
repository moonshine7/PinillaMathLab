import React from 'react';
import { LineEquation } from '../types';

interface EquationCardProps {
  equation: LineEquation;
  variable: 'y1' | 'y2';
  colorClass: string;
}

const EquationCard: React.FC<EquationCardProps> = ({ equation, variable, colorClass }) => {
  const sign = equation.intercept >= 0 ? '+' : '-';
  const interceptAbs = Math.abs(equation.intercept);
  // Use the equation's specific inequality symbol
  const operator = equation.inequality || '=';

  return (
    <div className={`p-4 rounded-lg border ${colorClass} bg-opacity-5 bg-white shadow-sm`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-lg">{equation.name}</h4>
        <span className={`text-xs px-2 py-1 rounded-full border ${colorClass.replace('border', 'bg').replace('500', '100')} text-slate-700`}>
            {equation.isProportional ? 'Proportional' : 'Non-Proportional'}
        </span>
      </div>
      <div className="font-mono text-xl text-center py-2 bg-slate-50 rounded border border-slate-100">
        y {operator} {equation.slope}x {sign} {interceptAbs}
      </div>
      <div className="mt-2 text-sm text-slate-500">
        <strong>Slope (m):</strong> {equation.slope} <br />
        <strong>Y-Intercept (b):</strong> {equation.intercept}
      </div>
    </div>
  );
};

export default EquationCard;