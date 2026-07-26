import React from 'react';
import { 
  Eye, 
  Layers, 
  Sun, 
  Cpu, 
  Disc, 
  Circle, 
  Hexagon, 
  Zap, 
  Sliders, 
  Wind, 
  Package, 
  ChevronRight,
  Wrench
} from 'lucide-react';

const CATEGORY_META = [
  { name: 'Visor', icon: Eye, color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30' },
  { name: 'Side Panel', icon: Layers, color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30' },
  { name: 'Headlight', icon: Sun, color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30' },
  { name: 'Engine Parts', icon: Cpu, color: 'from-red-500/20 to-rose-500/20 text-red-400 border-red-500/30' },
  { name: 'Bolt', icon: Disc, color: 'from-slate-500/20 to-zinc-500/20 text-slate-300 border-slate-500/30' },
  { name: 'Washer', icon: Circle, color: 'from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30' },
  { name: 'Nut', icon: Hexagon, color: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30' },
  { name: 'Brake Pad / Shoe', icon: Wrench, color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30' },
  { name: 'Electrical', icon: Zap, color: 'from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30' },
  { name: 'Suspension', icon: Sliders, color: 'from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30' },
  { name: 'Filter', icon: Wind, color: 'from-sky-500/20 to-cyan-500/20 text-sky-400 border-sky-500/30' },
  { name: 'Other', icon: Package, color: 'from-slate-700/30 to-slate-800/30 text-slate-400 border-slate-700' },
];

const CategoryGrid = ({ items, onSelectCategory, categories = [], onOpenCategoryManager }) => {
  // Compute item counts & total stock per category
  const categoryStats = React.useMemo(() => {
    const stats = {};

    // Group items by category
    items.forEach(item => {
      const cat = item.category || 'Other';
      if (!stats[cat]) {
        stats[cat] = { count: 0, totalQty: 0 };
      }
      stats[cat].count += 1;
      stats[cat].totalQty += (item.quantity || 0);
    });

    return stats;
  }, [items]);

  // Combine provided categories with meta styling
  const allCategories = React.useMemo(() => {
    const defaultList = ['Visor', 'Side Panel', 'Headlight', 'Engine Parts', 'Bolt', 'Washer', 'Nut', 'Brake Pad / Shoe', 'Electrical', 'Suspension', 'Filter', 'Other'];
    const activeList = categories.length > 0 ? categories : defaultList;

    const metaMap = new Map(CATEGORY_META.map(c => [c.name.toLowerCase(), c]));

    return activeList.map(catName => {
      const existingMeta = metaMap.get(catName.toLowerCase());
      if (existingMeta) {
        return existingMeta;
      }
      return {
        name: catName,
        icon: Package,
        color: 'from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30'
      };
    });
  }, [categories, categoryStats]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Category Grid Section Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white">Select Spare Parts Category</h2>
          <p className="text-xs text-slate-400 mt-0.5">Click a category to browse spare parts inventory</p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCategoryManager && (
            <button
              onClick={onOpenCategoryManager}
              className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              Manage Categories
            </button>
          )}

          <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold rounded-xl">
            {allCategories.length} Categories
          </span>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allCategories.map(cat => {
          const Icon = cat.icon;
          const stat = categoryStats[cat.name] || { count: 0, totalQty: 0 };

          return (
            <div
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className="group relative bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/5 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3.5 rounded-2xl bg-gradient-to-br border ${cat.color} transition-transform group-hover:scale-110 duration-200`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <span className="p-1.5 rounded-xl bg-slate-800/80 group-hover:bg-blue-600 text-slate-400 group-hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </h3>
                
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">{stat.count} {stat.count === 1 ? 'part' : 'parts'}</span>
                  <span className="px-2 py-0.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-slate-400">
                    {stat.totalQty} units
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default CategoryGrid;
