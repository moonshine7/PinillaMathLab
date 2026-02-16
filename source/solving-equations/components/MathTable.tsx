import React from 'react';
import { GraphDataPoint, LineEquation, MathScenario } from '../types';

interface MathTableProps {
  data: GraphDataPoint[];
  equation1: LineEquation;
  equation2: LineEquation;
  intersectionX: number;
}

const MathTable: React.FC<MathTableProps> = ({ data, equation1, equation2, intersectionX }) => {
  // Filter data to keep the table manageable, but ensure intersection is present
  // We want some points before and some points after the intersection
  const centerIndex = data.findIndex(d => Math.abs(d.x - intersectionX) < 0.1);
  
  // Try to take 5 points before and 5 points after, if possible
  let startIndex = Math.max(0, centerIndex - 5);
  let endIndex = Math.min(data.length, centerIndex + 6);
  
  // Fallback if intersection is far off (though logic tries to center it)
  if (centerIndex === -1) {
      startIndex = 0;
      endIndex = Math.min(data.length, 10);
  }

  const displayData = data.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
         <h3 className="text-lg font-semibold text-slate-700">Data Table</h3>
         <p className="text-xs text-slate-500">Showing values around the intersection point</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">X</th>
              <th className="px-6 py-3 text-blue-600">{equation1.name} (Y1)</th>
              <th className="px-6 py-3 text-red-600">{equation2.name} (Y2)</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((point) => {
              const isIntersection = Math.abs(point.x - intersectionX) < 0.01;
              return (
                <tr 
                    key={point.x} 
                    className={`border-b hover:bg-slate-50 transition-colors ${isIntersection ? 'bg-green-50' : 'bg-white'}`}
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {point.x}
                    {isIntersection && <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Intercept</span>}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-mono">
                    {point.y1.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-red-600 font-mono">
                    {point.y2.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MathTable;