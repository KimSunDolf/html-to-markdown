import React, { useState } from 'react';
import { DownloadIcon, CopyIcon, CheckIcon } from './Icons';

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-${new Date().getTime()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full animate-slide-up">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-gray-300 font-medium text-sm uppercase tracking-wider">Markdown Result</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md transition-all"
            title="Copy to clipboard"
          >
            {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-500 rounded-md shadow-lg shadow-brand-900/20 transition-all hover:scale-105"
            title="Download .md file"
          >
            <DownloadIcon className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
      
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
        <div className="relative bg-[#0b1120] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex gap-2 px-4 py-3 bg-[#1e293b] border-b border-gray-800">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <div className="p-0">
                <textarea
                readOnly
                value={content}
                className="w-full h-[500px] p-6 bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none custom-scrollbar"
                spellCheck={false}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownViewer;