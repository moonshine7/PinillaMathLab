import React from 'react';
import { VolumeVisualizer } from './components/VolumeVisualizer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-dark text-brand-light font-sans">
      <header className="bg-gray-900 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Interactive <span className="text-brand-blue">Volume Visualizer</span>
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <VolumeVisualizer />
      </main>
      
      <footer className="text-center py-4 mt-8 text-gray-500 text-sm border-t border-gray-800">
        <p>An interactive tool for visualizing geometric volumes.</p>
      </footer>
    </div>
  );
};

export default App;
