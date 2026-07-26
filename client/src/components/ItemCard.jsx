import React from 'react';
import { Plus, Minus, Edit3, Trash2, Box, Tag, Key, Bike, Maximize2 } from 'lucide-react';

const ItemCard = ({ item, onUpdateQuantity, onEdit, onDelete, onImageClick }) => {
  const isLowStock = (item.quantity || 0) < 5;
  const isOutOfStock = (item.quantity || 0) === 0;

  return (
    <div className={`group relative bg-slate-900/90 border rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] flex flex-col justify-between ${
      isOutOfStock
        ? 'border-red-500/40 bg-slate-900/60'
        : isLowStock
          ? 'border-amber-500/40'
          : 'border-slate-800 hover:border-slate-700'
    }`}>
      
      {/* Top Banner Image Container (Tall h-72) */}
      <div 
        onClick={() => onImageClick && onImageClick(item)}
        className="relative h-72 w-full bg-slate-950 overflow-hidden flex items-center justify-center cursor-pointer group/img"
        title="Click to view image in fullscreen"
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={`${item.bikeModel} ${item.partName}`}
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Fallback Icon Placeholder */}
        <div
          className="flex-col items-center justify-center gap-2 text-slate-600 w-full h-full bg-gradient-to-b from-slate-900 to-slate-950"
          style={{ display: item.imageUrl ? 'none' : 'flex' }}
        >
          <Bike className="w-14 h-14 stroke-1" />
          <span className="text-xs font-semibold text-slate-500">No Image Uploaded</span>
        </div>

        {/* Zoom Hint Overlay on Image Hover */}
        {item.imageUrl && (
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold backdrop-blur-[2px]">
            <Maximize2 className="w-5 h-5 text-blue-400" />
            <span>Click for Fullscreen View</span>
          </div>
        )}

        {/* Box Number Tag (Top Right) */}
        <div className="absolute top-3 right-3 px-3 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 z-10">
          <Box className="w-3.5 h-3.5" />
          <span>{item.boxNumber}</span>
        </div>

        {/* Company Badge (Top Left) */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-slate-900/90 backdrop-blur-md text-blue-400 text-xs font-bold rounded-lg border border-slate-700 shadow-md z-10">
          {item.bikeCompany}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Title */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                {item.category}
              </h3>
              <p className="text-sm font-semibold text-slate-300">
                {item.bikeModel}
              </p>
            </div>
          </div>

          {/* Details Badges Grid */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700/80 flex items-center gap-1 font-medium">
              <Tag className="w-3 h-3 text-slate-400" />
              {item.category}
            </span>

            {item.colour && (
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700/80 font-medium">
                Colour: <span className="text-slate-100 font-semibold">{item.colour}</span>
              </span>
            )}
          </div>

          {/* Secret Price & Quantity Row */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 items-center">
            
            {/* Secret Price Box */}
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Key className="w-3 h-3 text-blue-400" /> Secret Price Code
              </span>
              <p className="text-base font-extrabold text-blue-400 font-mono tracking-wider mt-0.5">
                #{item.displayPrice}
              </p>
            </div>

            {/* Quantity Display */}
            <div className={`p-2.5 rounded-xl border ${
              isOutOfStock
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : isLowStock
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Stock Quantity
              </span>
              <p className="text-base font-extrabold font-mono mt-0.5 flex items-center justify-between">
                <span>{item.quantity} units</span>
                {isOutOfStock ? (
                  <span className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded font-sans font-bold">Out</span>
                ) : isLowStock ? (
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded font-sans font-bold">Low</span>
                ) : null}
              </p>
            </div>

          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="mt-5 space-y-2">
          {/* Add / Use Quantity Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateQuantity(item, 'add')}
              className="py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Quantity
            </button>

            <button
              onClick={() => onUpdateQuantity(item, 'use')}
              disabled={isOutOfStock}
              className={`py-2 px-3 border font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                isOutOfStock
                  ? 'bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                  : 'bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/40 text-amber-300 active:scale-95'
              }`}
            >
              <Minus className="w-4 h-4" /> Use Item
            </button>
          </div>

          {/* Edit / Delete Row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onEdit(item)}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" /> Edit
            </button>

            <button
              onClick={() => onDelete(item)}
              className="py-2 px-3 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60 hover:border-red-800/60"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" /> Delete
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ItemCard;
