import React from 'react';
import { Package, Layers, AlertTriangle, Filter } from 'lucide-react';

const DashboardStats = ({ items, filterLowStock, setFilterLowStock }) => {
  const totalItems = items.length;
  const totalQuantity = items.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const lowStockItems = items.filter(i => (i.quantity || 0) < 5);
  const lowStockCount = lowStockItems.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      
      {/* Total Items Card */}
      <div 
        onClick={() => setFilterLowStock(false)}
        className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
          !filterLowStock 
            ? 'bg-slate-900 border-slate-700 shadow-md' 
            : 'bg-slate-900/50 border-slate-800/80 opacity-80 hover:opacity-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Unique Items</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{totalItems}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Package className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">Active parts in shop catalog</p>
      </div>

      {/* Total Quantity Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Stock Quantity</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{totalQuantity} <span className="text-sm font-medium text-slate-400">units</span></h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Layers className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">Combined physical parts available</p>
      </div>

      {/* Low Stock Items Card */}
      <div 
        onClick={() => setFilterLowStock(!filterLowStock)}
        className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
          filterLowStock 
            ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-900/20 ring-2 ring-amber-500/40' 
            : lowStockCount > 0
              ? 'bg-slate-900 border-amber-500/30 hover:border-amber-500/60'
              : 'bg-slate-900 border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Low Stock Alert</p>
              {filterLowStock && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded uppercase">Filtered</span>
              )}
            </div>
            <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{lowStockCount}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-400">Items with &lt; 5 quantity</p>
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 hover:underline">
            <Filter className="w-3 h-3" /> {filterLowStock ? 'Show All' : 'Filter Low Stock'}
          </span>
        </div>
      </div>

    </div>
  );
};

export default DashboardStats;
