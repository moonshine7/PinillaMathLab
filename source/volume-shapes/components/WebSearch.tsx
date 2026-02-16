
import React, { useState, useCallback } from 'react';
import { groundedSearch } from '../services/geminiService';
import { Spinner } from './Spinner';
import { Card } from './Card';
import type { GroundingSource } from '../types';

const BasicMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\n)/g).filter(Boolean);
    return (
        <p className="whitespace-pre-wrap">
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('* ') && part.includes('\n')) {
                    const listItems = part.split('\n').filter(item => item.startsWith('* '));
                    return (
                        <ul key={index} className="list-disc list-inside pl-4 my-2">
                            {listItems.map((item, i) => <li key={i}>{item.substring(2)}</li>)}
                        </ul>
                    );
                }
                 if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={index} className="bg-gray-700 text-sm rounded px-1 py-0.5">{part.slice(1, -1)}</code>;
                }
                if (part === '\n') {
                    return <br key={index} />;
                }
                return <span key={index}>{part}</span>;
            })}
        </p>
    );
};


export const WebSearch: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);

  const handleSubmit = useCallback(async () => {
    if (!query) {
      setError('Please enter a search query.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);
    setSources([]);

    try {
      const result = await groundedSearch(query);
      const text = result.text;
      const metadata = result.candidates?.[0]?.groundingMetadata;
      
      setResponse(text);
      if (metadata?.groundingChunks) {
          setSources(metadata.groundingChunks as GroundingSource[]);
      }

    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An error occurred during the search.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-2">Ask anything...</h3>
        <p className="text-sm text-gray-400 mb-4">Get up-to-date information with Google Search grounding.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'What were the key highlights of this year's largest tech conference?'"
            className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-blue focus:outline-none"
            disabled={isLoading}
             onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !query}
            className="bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner size="sm" /> : 'Search'}
          </button>
        </div>
      </Card>
      
      {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}

      {isLoading && (
        <Card className="flex items-center justify-center p-8">
          <Spinner />
          <p className="ml-4 text-gray-300">Searching the web...</p>
        </Card>
      )}

      {response && (
        <Card>
          <div className="prose prose-invert max-w-none text-gray-300">
            <BasicMarkdown text={response} />
          </div>
          {sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="font-semibold text-gray-200">Sources:</h4>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {sources.map((source, index) => source.web?.uri && (
                  <li key={index}>
                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline text-sm">
                      {source.web.title || source.web.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
