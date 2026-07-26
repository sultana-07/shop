import React, { useRef, useEffect } from 'react';
import { Search, X, Command } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const inputRef = useRef(null);

  // Focus search bar on Command/Ctrl + K or forward slash "/"
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== inputRef.current && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="mb-6 animate-fade-in">
      <div className="relative flex items-center group">
        
        {/* Glowing Search Icon Container */}
        <div className="absolute left-3 sm:left-4 p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 group-focus-within:bg-blue-600 group-focus-within:text-white group-focus-within:border-blue-500 transition-all duration-300 pointer-events-none shadow-md">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        {/* Search Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by model, part name, box #, or color... (e.g. Splendor, Activa, B01)"
          className="w-full pl-14 sm:pl-16 pr-20 sm:pr-24 py-3.5 sm:py-4 text-sm sm:text-base font-medium bg-slate-900/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700/90 rounded-2xl text-slate-100 placeholder-slate-400/80 focus:outline-none focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 shadow-xl transition-all duration-300"
        />

        {/* Right Quick Controls (Clear Button & Keyboard Shortcut Badge) */}
        <div className="absolute right-3 sm:right-4 flex items-center gap-2">
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-1 text-xs font-semibold"
              title="Clear search (Esc)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline text-[10px]">Clear</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-[10px] font-mono font-bold text-slate-400 select-none shadow-inner">
              <Command className="w-3 h-3 text-slate-400" />
              <span>K</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SearchBar;
