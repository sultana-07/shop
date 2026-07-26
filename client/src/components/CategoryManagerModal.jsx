import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, RotateCcw, Check } from 'lucide-react';

const CategoryManagerModal = ({ isOpen, onClose, categories, onAddCategory, onRemoveCategory, onResetCategories }) => {
  const [newCatName, setNewCatName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = newCatName.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a category name');
      return;
    }

    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg(`"${trimmed}" category already exists`);
      return;
    }

    onAddCategory(trimmed);
    setSuccessMsg(`Category "${trimmed}" added successfully!`);
    setNewCatName('');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleRemove = (categoryToRemove) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (categories.length <= 1) {
      setErrorMsg('At least one category must remain');
      return;
    }
    onRemoveCategory(categoryToRemove);
    setSuccessMsg(`Category "${categoryToRemove}" removed`);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Manage Categories</h2>
              <p className="text-xs text-slate-400">Add custom categories or remove existing ones</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4" /> {successMsg}
            </div>
          )}

          {/* Add Category Form */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Add New Category
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Clutch Plate, Mirror, Chain Sprocket"
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
          </form>

          {/* Categories List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Existing Categories ({categories.length})</span>
              {onResetCategories && (
                <button
                  onClick={onResetCategories}
                  className="text-slate-400 hover:text-blue-400 flex items-center gap-1 normal-case text-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 border border-slate-800 rounded-2xl p-2 bg-slate-950/50">
              {categories.map(cat => (
                <div
                  key={cat}
                  className="flex items-center justify-between px-3 py-2 bg-slate-900 border border-slate-800/80 rounded-xl text-sm text-slate-200 group hover:border-slate-700 transition-colors"
                >
                  <span className="font-medium">{cat}</span>
                  <button
                    onClick={() => handleRemove(cat)}
                    className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                    title={`Remove category "${cat}"`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default CategoryManagerModal;
