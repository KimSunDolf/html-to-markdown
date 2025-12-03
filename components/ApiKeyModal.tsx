import React, { useState, useEffect } from 'react';
import { CloseIcon, CheckIcon } from './Icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, apiKey, setApiKey }) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTempKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(tempKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1e293b] border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-2">
            Firecrawl API Key
          </label>
          <input
            id="api-key"
            type="password"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            placeholder="fc-..."
            className="w-full bg-[#0f172a] border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
          <p className="mt-2 text-xs text-gray-400">
            Get your key from <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 underline">firecrawl.dev</a>
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!tempKey.trim()}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            saved 
              ? 'bg-green-600 text-white' 
              : 'bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {saved ? (
            <>
              <CheckIcon className="w-5 h-5" />
              Saved
            </>
          ) : (
            'Save Configuration'
          )}
        </button>
      </div>
    </div>
  );
};

export default ApiKeyModal;