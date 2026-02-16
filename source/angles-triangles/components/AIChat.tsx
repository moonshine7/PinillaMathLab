import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, GroundingChunk } from '../types';
import { generateTutorResponse, analyzeMathProblem } from '../services/geminiService';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hi! I am GeoBot. Ask me anything about lines, angles, or triangles, or upload a picture of a problem!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateTutorResponse(messages, input, "User is studying Parallel Lines and Triangles.", useSearch);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        sources: response.sources
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const userMsg: ChatMessage = { 
        id: Date.now().toString(), 
        role: 'user', 
        text: `Analyzed image: ${file.name}`,
        image: URL.createObjectURL(file) // For preview
      };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const analysis = await analyzeMathProblem(file);
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: analysis
        };
        setMessages(prev => [...prev, botMsg]);
      } catch (err) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Failed to analyze image." }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Gemini Tutor
        </h3>
        <label className="flex items-center text-xs gap-2 cursor-pointer">
          <input type="checkbox" checked={useSearch} onChange={e => setUseSearch(e.target.checked)} className="rounded text-indigo-200 focus:ring-0" />
          Enable Google Search
        </label>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
            }`}>
              {msg.image && (
                 <img src={msg.image} alt="User upload" className="max-w-full h-auto rounded mb-2 border border-white/20" />
              )}
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-1">Sources:</p>
                  <ul className="list-disc pl-4">
                    {msg.sources.map((src, idx) => (
                      <li key={idx} className="text-xs truncate">
                        <a href={src} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{src}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-slate-100 p-3 rounded-lg rounded-bl-none text-xs text-slate-500 animate-pulse">
               Thinking...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
             title="Upload Math Problem"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
           </button>
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/*"
             onChange={handleFileUpload}
           />
           <input
             type="text"
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             placeholder="Ask a question..."
             className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
           />
           <button 
             onClick={handleSend}
             disabled={isLoading}
             className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
           >
             Send
           </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;