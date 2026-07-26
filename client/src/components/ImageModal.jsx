import React, { useEffect } from 'react';
import { X, Box, Tag, Key, Bike } from 'lucide-react';

const ImageModal = ({ item, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div 
        className="w-full max-w-5xl flex items-center justify-between py-2 px-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">
              {item.bikeCompany} {item.bikeModel}
            </h3>
            <p className="text-xs text-slate-400">
              {item.category} • {item.colour || 'Standard Colour'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Close Fullscreen View (Esc)"
        >
          <X className="w-5 h-5" />
          <span className="hidden sm:inline">Close</span>
        </button>
      </div>

      {/* Main Fullscreen Image Container */}
      <div 
        className="flex-1 w-full max-w-5xl my-4 flex items-center justify-center relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 p-2"
        onClick={(e) => e.stopPropagation()}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={`${item.bikeModel} ${item.category}`}
            className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
          />
        ) : (
          <div className="text-center text-slate-500 p-12 flex flex-col items-center gap-3">
            <Bike className="w-20 h-20 stroke-1" />
            <p className="text-base font-medium">No Image Available for this Part</p>
          </div>
        )}
      </div>

      {/* Bottom Metadata Info Card */}
      <div 
        className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold rounded-xl flex items-center gap-1.5">
            <Box className="w-4 h-4 text-amber-400" />
            Box Number: {item.boxNumber}
          </span>

          <span className="px-3 py-1.5 bg-slate-800 text-slate-200 border border-slate-700 font-semibold rounded-xl flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-blue-400" />
            {item.category}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400 uppercase font-semibold">Secret Code:</span>
            <span className="font-mono font-extrabold text-blue-400 text-base tracking-wider">
              #{item.displayPrice}
            </span>
          </div>

          <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
            <span className="text-xs text-slate-400 uppercase font-semibold">Stock Qty:</span>
            <span className="font-mono font-extrabold text-emerald-400 text-base">
              {item.quantity} units
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
