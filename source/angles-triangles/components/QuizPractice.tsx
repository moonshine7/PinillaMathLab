import React, { useState } from 'react';

const QuizPractice: React.FC = () => {
  // Problems extracted from the PDF OCR text
  const questions = [
    {
      id: 1,
      text: "If m∠7 = 125°, find m∠2. (Parallel lines a and b)",
      hint: "Angle 2 and Angle 7 are Alternate Exterior Angles.",
      answer: 125
    },
    {
      id: 2,
      text: "Find m∠GDE given a triangle where angles are 4x, 6x, and exterior angle relationship applies.",
      // Simplified for this demo based on common pattern: Ext = Int + Int
      // Let's create a specific static problem based on the visual
      type: "static",
      text_override: "In a triangle, if Angle A = 70° and Angle B = 60°, what is the measure of Angle C?",
      answer: 50
    },
    {
        id: 3,
        text: "Solve for x: Two alternate interior angles are 3x and 4x - 20.",
        // 3x = 4x - 20 -> -x = -20 -> x = 20
        answer: 20
    }
  ];

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, string>>({});

  const checkAnswer = (id: number, correct: number) => {
    const val = parseInt(answers[id] || "0");
    if (val === correct) {
      setFeedback({ ...feedback, [id]: "Correct! 🎉" });
    } else {
      setFeedback({ ...feedback, [id]: "Try again." });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Practice Problems</h2>
      <div className="grid gap-6">
        {questions.map((q) => (
          <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h4 className="font-semibold text-lg mb-2">Problem {q.id}</h4>
            <p className="text-slate-600 mb-4">{q.text_override || q.text}</p>
            {q.hint && <p className="text-xs text-slate-400 mb-4 italic">Hint: {q.hint}</p>}
            
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                placeholder="Answer..." 
                className="border border-slate-300 rounded px-3 py-2 w-32 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
              />
              <button 
                onClick={() => checkAnswer(q.id, q.answer)}
                className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
              >
                Check
              </button>
              {feedback[q.id] && (
                <span className={`text-sm font-bold ${feedback[q.id].includes("Correct") ? "text-green-600" : "text-rose-500"}`}>
                  {feedback[q.id]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizPractice;