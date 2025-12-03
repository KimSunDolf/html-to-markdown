import React, { useState, useEffect } from 'react';
import { SettingsIcon, ArrowRightIcon, FireIcon, SlidersIcon, ClockIcon, SmartphoneIcon, GlobeIcon, CodeIcon, ExternalLinkIcon, ClipboardIcon } from './components/Icons';
import ApiKeyModal from './components/ApiKeyModal';
import MarkdownViewer from './components/MarkdownViewer';
import { scrapeUrl } from './services/firecrawlService';
import { convertHtmlToMarkdown } from './services/localService';
import { AppState } from './types';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [htmlInput, setHtmlInput] = useState<string>('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  
  // Modes: 'url' (Cloud/Firecrawl) or 'html' (Local Browser Mode)
  const [mode, setMode] = useState<'url' | 'html'>('url');

  // Advanced options (Only for URL mode)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [waitDuration, setWaitDuration] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Load API key from local storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('firecrawl_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Update local storage when key changes
  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('firecrawl_api_key', newKey);
  };

  const handleUrlScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setState(AppState.LOADING);
    setErrorMsg('');
    setResult('');

    const response = await scrapeUrl(apiKey, url, {
      waitFor: waitDuration,
      mobile: isMobile
    });

    if (response.success && response.data) {
      setResult(response.data.markdown);
      setState(AppState.SUCCESS);
    } else {
      setErrorMsg(response.error || 'Failed to convert URL');
      setState(AppState.ERROR);
    }
  };

  const processHtml = (html: string) => {
    setState(AppState.LOADING);
    setErrorMsg('');
    setResult('');

    setTimeout(() => {
      const markdown = convertHtmlToMarkdown(html);
      if (markdown) {
        setResult(markdown);
        setState(AppState.SUCCESS);
      } else {
        setErrorMsg('Failed to convert HTML content');
        setState(AppState.ERROR);
      }
    }, 500);
  };

  const handleHtmlConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmlInput.trim()) return;
    processHtml(htmlInput);
  };

  const handleOpenAndValidate = () => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setHtmlInput(text);
        // Optional: Auto-submit if it looks like HTML
        if (text.includes('<') && text.includes('>')) {
          processHtml(text);
        }
      } else {
        setErrorMsg('Clipboard is empty');
      }
    } catch (err) {
      setErrorMsg('Permission to read clipboard denied. Please paste manually.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden selection:bg-brand-500/30 selection:text-brand-200">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-900/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="p-2 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-brand-500/25">
             <FireIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            FireConvert
          </span>
        </div>
        
        {mode === 'url' && (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 text-sm font-medium text-gray-300 transition-all duration-300 backdrop-blur-sm"
          >
            <span className="hidden sm:inline">{apiKey ? 'API Key Configured' : 'Set API Key'}</span>
            <SettingsIcon className={`w-4 h-4 ${!apiKey ? 'text-brand-400 animate-pulse' : 'text-gray-400'}`} />
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow container max-w-4xl mx-auto px-6 py-10 flex flex-col items-center z-10">
        
        {/* Hero Section */}
        <div className={`text-center transition-all duration-700 ${state === AppState.SUCCESS ? 'mb-8' : 'mb-10 mt-6'}`}>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Turn any <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Page</span> into <br className="hidden md:block"/> clean <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Markdown</span>.
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Extract content, preserve formatting, and transcode images. 
            <br />
            {mode === 'url' ? (
              <span>Using <span className="text-brand-300 font-medium">Firecrawl Cloud API</span> for automated extraction.</span>
            ) : (
              <span>Using <span className="text-brand-300 font-medium">Local Browser</span> for bypass & verification.</span>
            )}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="w-full max-w-md mx-auto mb-8 bg-[#1e293b]/50 p-1 rounded-xl border border-gray-700 flex backdrop-blur-sm">
          <button
            onClick={() => {
              setMode('url');
              setState(AppState.IDLE);
              setResult('');
              setErrorMsg('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
              mode === 'url' 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <GlobeIcon className="w-4 h-4" />
            Cloud Auto
          </button>
          <button
            onClick={() => {
              setMode('html');
              setState(AppState.IDLE);
              setResult('');
              setErrorMsg('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
              mode === 'html' 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <CodeIcon className="w-4 h-4" />
            Local Browser
          </button>
        </div>

        {/* Input Section - Conditional Rendering */}
        <div className="w-full max-w-3xl animate-fade-in relative">
           
          {mode === 'url' ? (
            /* URL MODE */
            <>
              <form onSubmit={handleUrlScrape} className="w-full relative group z-10">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 via-purple-500 to-blue-500 rounded-2xl opacity-30 group-hover:opacity-50 transition duration-500 blur-md"></div>
                <div className="relative flex items-center bg-[#1e293b] border border-gray-700 rounded-xl p-2 shadow-2xl focus-within:ring-2 focus-within:ring-brand-500/50 focus-within:border-brand-500 transition-all">
                  <input
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-grow bg-transparent text-white px-4 py-3 text-lg placeholder-gray-500 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={state === AppState.LOADING}
                    className="ml-2 px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    {state === AppState.LOADING ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Convert <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Advanced Options Toggle */}
              <div className="mt-4 flex flex-col items-center">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-brand-400 transition-colors uppercase tracking-widest"
                >
                  <SlidersIcon className="w-4 h-4" />
                  Advanced Options
                </button>

                {/* Advanced Panel */}
                <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${showAdvanced ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-[#1e293b]/50 border border-gray-700/50 rounded-xl p-4 flex flex-col sm:flex-row gap-6 justify-center items-center">
                      
                      {/* Wait Duration Input */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <ClockIcon className="w-4 h-4" />
                          <span>Wait (ms)</span>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          max="30000"
                          step="100"
                          value={waitDuration}
                          onChange={(e) => setWaitDuration(parseInt(e.target.value) || 0)}
                          className="w-24 bg-[#0f172a] border border-gray-600 rounded-md px-3 py-1 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                          placeholder="0"
                        />
                      </div>

                      {/* Mobile Toggle */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <SmartphoneIcon className="w-4 h-4" />
                          <span>Mobile View</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsMobile(!isMobile)}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                            isMobile ? 'bg-brand-600' : 'bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block w-4 h-4 transform transition-transform duration-200 ease-in-out bg-white rounded-full mt-1 ml-1 ${
                              isMobile ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                </div>
              </div>
            </>
          ) : (
            /* HTML MANUAL MODE (Local Browser) */
            <div className="w-full flex flex-col items-center">
              
              {/* Assisted Workflow: URL Input for opening */}
              <div className="w-full mb-4 flex gap-2">
                 <input
                    type="text"
                    placeholder="Optional: Enter URL to open & verify (e.g. WeChat link)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-grow bg-[#1e293b] border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                  />
                  <button
                    onClick={handleOpenAndValidate}
                    disabled={!url}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <ExternalLinkIcon className="w-4 h-4" />
                    Open Page
                  </button>
              </div>

              <form onSubmit={handleHtmlConvert} className="w-full relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 via-purple-500 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur-md"></div>
                <div className="relative bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl p-4">
                  <div className="mb-3 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                       <CodeIcon className="w-4 h-4" />
                       <span>Page Source</span>
                     </div>
                     <button
                        type="button"
                        onClick={handlePasteFromClipboard}
                        className="text-xs bg-brand-900/50 text-brand-300 hover:bg-brand-900 hover:text-brand-200 border border-brand-800/50 px-3 py-1.5 rounded-md transition-all flex items-center gap-2"
                     >
                       <ClipboardIcon className="w-3.5 h-3.5" />
                       Auto Paste & Convert
                     </button>
                  </div>
                  
                  <textarea
                    value={htmlInput}
                    onChange={(e) => setHtmlInput(e.target.value)}
                    placeholder="Step 1: Open the URL above
Step 2: Solve the CAPTCHA in the new tab
Step 3: Press Ctrl+A then Ctrl+C
Step 4: Click 'Auto Paste & Convert' button above"
                    className="w-full h-40 bg-[#0f172a] border border-gray-700 rounded-lg p-4 text-sm font-mono text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all custom-scrollbar resize-none"
                    spellCheck={false}
                  />
                  
                  <div className="mt-4 flex justify-between items-center">
                     <p className="text-xs text-gray-500 italic max-w-md hidden sm:block">
                       * Bypasses all firewalls by using your local browser session.
                     </p>
                     <button
                        type="submit"
                        disabled={state === AppState.LOADING || !htmlInput.trim()}
                        className="w-full sm:w-auto px-6 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                      >
                        {state === AppState.LOADING ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Convert Now <ArrowRightIcon className="w-4 h-4" />
                          </>
                        )}
                      </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Helper / Error Text */}
          <div className="w-full text-center mt-4 h-6">
             {state === AppState.ERROR && (
               <span className="text-red-400 text-sm animate-fade-in">{errorMsg}</span>
             )}
             {mode === 'url' && !apiKey && state !== AppState.ERROR && (
               <span className="text-gray-500 text-xs">API Key required for cloud conversion</span>
             )}
          </div>
        </div>

        {/* Results Section */}
        {state === AppState.SUCCESS && (
          <div className="w-full mt-10 animate-fade-in-up">
            <MarkdownViewer content={result} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} FireConvert. Built for aesthetic scraping.</p>
      </footer>

      {/* Settings Modal - Only for URL mode */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={handleApiKeyChange}
      />
    </div>
  );
};

export default App;