import React, { useState, useEffect } from 'react';
import { SavedPattern } from '../types';
import { TrashIcon } from './Icons';

interface MyPatternsScreenProps {
  onLoadPattern: (pattern: SavedPattern) => void;
}

const MyPatternsScreen: React.FC<MyPatternsScreenProps> = ({ onLoadPattern }) => {
  const [patterns, setPatterns] = useState<SavedPattern[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('myPatterns');
      if (saved) {
        setPatterns(JSON.parse(saved));
      }
    } catch (error) {
        console.error("Could not load patterns from local storage", error);
        // Optionally clear corrupted data
        // localStorage.removeItem('myPatterns');
    }
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this pattern?')) {
        const newPatterns = patterns.filter(p => p.id !== id);
        setPatterns(newPatterns);
        localStorage.setItem('myPatterns', JSON.stringify(newPatterns));
    }
  };

  if (patterns.length === 0) {
    return (
      <div className="text-center text-slate-500 mt-16">
        <h3 className="text-lg font-semibold text-slate-700">No Saved Patterns</h3>
        <p className="mt-2">Go to the editor and click "Save Pattern" to see your creations here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {patterns.map(pattern => (
        <div key={pattern.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <img src={pattern.previewDataUrl} alt="Pattern preview" className="w-full h-auto object-cover bg-slate-100" />
          <div className="p-3 flex-grow flex flex-col justify-between">
            <p className="text-xs text-slate-500 mb-2">
                Saved on {new Date(pattern.createdAt).toLocaleDateString()}
            </p>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onLoadPattern(pattern)}
                    className="flex-grow text-center text-sm font-semibold bg-sky-500 text-white px-3 py-1.5 rounded-md hover:bg-sky-600 transition-colors"
                >
                    Load
                </button>
                <button 
                    onClick={() => handleDelete(pattern.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    aria-label="Delete pattern"
                >
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyPatternsScreen;
