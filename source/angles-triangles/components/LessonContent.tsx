import React from 'react';
import { ViewState } from '../types';

interface Props {
  view: ViewState;
}

const LessonContent: React.FC<Props> = ({ view }) => {
  if (view === ViewState.LESSON_PARALLEL) {
    return (
      <div className="space-y-6">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-2xl font-bold text-indigo-700">Parallel Lines and Transversals</h2>
          <p>
            A <span className="font-semibold text-yellow-600">transversal</span> is a line that intersects two lines in the same plane at two different points. 
            When a transversal line (labeled <i>t</i>) intersects two parallel lines (labeled <i>a</i> and <i>b</i>), it creates a pattern of eight distinct angles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-l-4 border-l-indigo-500 shadow-sm">
            <h3 className="font-bold text-lg mb-2">Corresponding Angles</h3>
            <p className="text-sm text-slate-600">These angles are in the same position at each intersection where the transversal line crosses the parallel lines.</p>
            <div className="mt-2 bg-slate-100 p-2 text-xs rounded">Example: <b>Angle 1</b> and <b>Angle 5</b></div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-l-4 border-l-emerald-500 shadow-sm">
            <h3 className="font-bold text-lg mb-2">Alternate Interior Angles</h3>
            <p className="text-sm text-slate-600">These are a pair of angles on opposite sides of the transversal line and <b>between</b> the parallel lines.</p>
            <div className="mt-2 bg-slate-100 p-2 text-xs rounded">Example: <b>Angle 3</b> and <b>Angle 6</b></div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-l-4 border-l-amber-500 shadow-sm">
            <h3 className="font-bold text-lg mb-2">Alternate Exterior Angles</h3>
            <p className="text-sm text-slate-600">These are a pair of angles on opposite sides of the transversal line and <b>outside</b> the parallel lines.</p>
            <div className="mt-2 bg-slate-100 p-2 text-xs rounded">Example: <b>Angle 1</b> and <b>Angle 8</b></div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-l-4 border-l-rose-500 shadow-sm">
            <h3 className="font-bold text-lg mb-2">Same-Side Interior Angles</h3>
            <p className="text-sm text-slate-600">These angles are on the same side of the transversal line and between the parallel lines. They add up to 180° (supplementary).</p>
            <div className="mt-2 bg-slate-100 p-2 text-xs rounded">Example: <b>Angle 3</b> and <b>Angle 5</b></div>
          </div>
        </div>

        <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-indigo-900">Solving for Unknowns</h3>
            <p className="mb-4">If you know the measure of just one angle, you can figure out all the others using these rules:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-800">
                <li><b>Vertical angles</b> are always equal (angles opposite each other).</li>
                <li><b>Linear pairs</b> (angles side-by-side on a straight line) add up to 180°.</li>
                <li>If lines are parallel, <b>Alternate Interior angles</b> are equal. <br/><span className="text-sm text-slate-500 font-mono">Example equation: 3x = 4x - 20</span></li>
                <li><b>Same-side interior angles</b> add up to 180°. <br/><span className="text-sm text-slate-500 font-mono">Example equation: 2x + 110 = 180</span></li>
            </ul>
        </div>
      </div>
    );
  }

  if (view === ViewState.LESSON_TRIANGLES) {
    return (
      <div className="space-y-6">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-2xl font-bold text-indigo-700">Angle Theorems for Triangles</h2>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <h3 className="text-xl font-bold text-orange-800 mb-2">Triangle Sum Theorem</h3>
            <p className="text-lg">The sum of all three angles inside any triangle is always <b>180°</b>.</p>
            <div className="mt-4 font-mono bg-white p-3 rounded border border-orange-100 inline-block text-sm">
                Angle A + Angle B + Angle C = 180°
            </div>
        </div>

        <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
            <h3 className="text-xl font-bold text-teal-800 mb-2">Exterior Angle Theorem</h3>
            <p className="mb-2">An <b>exterior angle</b> is the angle formed outside the triangle when you extend one of its sides.</p>
            <p className="font-medium">The Rule:</p>
            <p>The exterior angle is equal to the sum of the two angles inside the triangle that are farthest away from it (the remote interior angles).</p>
            <div className="mt-4 font-mono bg-white p-3 rounded border border-teal-100 inline-block text-sm">
                Exterior Angle = Remote Interior 1 + Remote Interior 2
            </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
             <div className="bg-white p-4 rounded shadow">
                 <h4 className="font-bold text-slate-700">Example Problem</h4>
                 <p className="text-sm text-slate-600 mt-1">Find the measure of Angle A if:</p>
                 <ul className="list-disc pl-5 text-sm text-slate-600 mt-2 mb-2">
                    <li>Angle A = (4y - 4)°</li>
                    <li>Angle B = 3y°</li>
                    <li>The Exterior Angle = 52°</li>
                 </ul>
                 <div className="text-xs text-slate-500 mt-2 italic bg-slate-50 p-3 rounded">
                    <strong>Solution Step-by-Step:</strong><br/>
                    1. Use the Exterior Angle Theorem: (Angle A) + (Angle B) = Exterior Angle<br/>
                    2. Set up the equation: (4y - 4) + 3y = 52<br/>
                    3. Combine like terms: 7y - 4 = 52<br/>
                    4. Add 4 to both sides: 7y = 56<br/>
                    5. Divide by 7: y = 8<br/>
                    6. Plug y back into Angle A: 4(8) - 4 = 28°
                 </div>
             </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LessonContent;