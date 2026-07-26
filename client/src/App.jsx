import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import CategoryGrid from './components/CategoryGrid';
import ItemCard from './components/ItemCard';
import ItemFormModal from './components/ItemFormModal';
import SettingsModal from './components/SettingsModal';
import ImageModal from './components/ImageModal';
import Toast from './components/Toast';
import { Loader2, PackageX, Plus, RefreshCw, ArrowLeft, Tag, LayoutGrid, Wrench } from 'lucide-react';

const RENDER_BACKEND_URL = 'https://shop-jnis.onrender.com';
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/items`
  : import.meta.env.DEV
    ? '/api/items'
    : `${RENDER_BACKEND_URL}/api/items`;

const CATEGORIES_API_URL = API_BASE_URL.replace(/\/items$/, '/categories');

const DEFAULT_CATEGORIES = [
  'Visor', 
  'Side Panel', 
  'Headlight', 
  'Engine Parts', 
  'Bolt', 
  'Washer', 
  'Nut', 
  'Brake Pad / Shoe', 
  'Cable', 
  'Electrical', 
  'Suspension', 
  'Filter', 
  'Other'
];

const App = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // null = Home Category Grid
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fullscreenImageItem, setFullscreenImageItem] = useState(null);

  // Dynamic Categories state with backend API persistence & local cache fallback
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('bike_inventory_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading stored categories:', e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Sync categories to localStorage cache
  useEffect(() => {
    try {
      localStorage.setItem('bike_inventory_categories', JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories:', e);
    }
  }, [categories]);

  // Fetch Categories from Backend API (Real-time sync across all devices)
  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORIES_API_URL);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setCategories(data.data);
      }
    } catch (e) {
      // Silent error on network glitch
    }
  };

  // Fetch Items from Backend API (Initial load or manual refresh)
  const fetchItems = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(API_BASE_URL);
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      } else if (!isSilent) {
        showToast(data.message || 'Failed to fetch inventory', 'error');
      }
    } catch (err) {
      if (!isSilent) {
        console.error('Fetch error:', err);
        showToast('Could not connect to inventory server', 'error');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Real-time multi-device sync: poll server items & categories silently every 3 seconds
  useEffect(() => {
    fetchItems(false);
    fetchCategories();

    const intervalId = setInterval(() => {
      fetchItems(true);
      fetchCategories();
    }, 3000);

    const handleFocus = () => {
      fetchItems(true);
      fetchCategories();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // List of active user-managed categories
  const availableCategories = categories;

  // Filter items to only include those belonging to active user-managed categories
  const activeItems = useMemo(() => {
    return items.filter(item => 
      categories.some(cat => cat.toLowerCase() === (item.category || '').toLowerCase())
    );
  }, [items, categories]);

  // Category management functions with backend API sync
  const handleAddCategory = async (newCat) => {
    if (!categories.some(c => c.toLowerCase() === newCat.toLowerCase())) {
      setCategories(prev => [...prev, newCat]);
    }
    try {
      const res = await fetch(CATEGORIES_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCat }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (e) {
      console.error('Error adding category to server:', e);
    }
  };

  const handleRemoveCategory = async (catToRemove) => {
    setCategories(prev => prev.filter(c => c.toLowerCase() !== catToRemove.toLowerCase()));
    if (selectedCategory?.toLowerCase() === catToRemove.toLowerCase()) {
      setSelectedCategory(null);
    }
    try {
      const res = await fetch(`${CATEGORIES_API_URL}/${encodeURIComponent(catToRemove)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (e) {
      console.error('Error deleting category from server:', e);
    }
  };

  const handleResetCategories = async () => {
    try {
      const res = await fetch(`${CATEGORIES_API_URL}/reset`, { method: 'POST' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (e) {
      console.error('Error resetting categories on server:', e);
    }
  };

  // Google-style multi-token search & category filtering
  const filteredItems = useMemo(() => {
    let result = [...activeItems];

    // Filter by category if selected
    if (selectedCategory) {
      result = result.filter(item => item.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by low stock if toggled
    if (filterLowStock) {
      result = result.filter(item => (item.quantity || 0) < 5);
    }

    // Filter by multi-keyword search
    if (searchQuery.trim()) {
      const tokens = searchQuery.toLowerCase().trim().split(/\s+/);
      result = result.filter(item => {
        const combinedText = [
          item.bikeCompany,
          item.bikeModel,
          item.partName,
          item.category,
          item.colour,
          item.boxNumber,
        ].filter(Boolean).join(' ').toLowerCase();

        return tokens.every(token => combinedText.includes(token));
      });
    }

    return result;
  }, [activeItems, selectedCategory, searchQuery, filterLowStock]);

  // Handle Add or Edit Submit
  const handleFormSubmit = async (formData, itemId) => {
    try {
      const url = itemId ? `${API_BASE_URL}/${itemId}` : API_BASE_URL;
      const method = itemId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        showToast(itemId ? 'Item details updated successfully!' : 'New spare part added to inventory!');
        fetchItems(true);
      } else {
        showToast(data.message || 'Operation failed', 'error');
        throw new Error(data.message);
      }
    } catch (err) {
      throw err;
    }
  };

  // Handle Quantity Increment / Decrement
  const handleUpdateQuantity = async (item, action) => {
    if (action === 'use' && item.quantity <= 0) {
      showToast('Quantity cannot go below 0', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/${item._id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (data.success) {
        // Optimistic local update for instant feedback
        setItems(prev => prev.map(i => {
          if (i._id === item._id) {
            const newQty = action === 'add' ? i.quantity + 1 : Math.max(0, i.quantity - 1);
            return { ...i, quantity: newQty };
          }
          return i;
        }));

        showToast(
          action === 'add'
            ? `Increased stock quantity for "${item.partName}"`
            : `Used 1 unit of "${item.partName}" (Qty: ${item.quantity - 1})`,
          action === 'add' ? 'success' : 'info'
        );
      } else {
        showToast(data.message || 'Failed to update quantity', 'error');
      }
    } catch (err) {
      showToast('Server error updating quantity', 'error');
    }
  };

  // Handle Delete Confirmation
  const handleDeleteItem = async (item) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${item._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Item "${item.partName}" deleted`, 'info');
        setItems(prev => prev.filter(i => i._id !== item._id));
      } else {
        showToast(data.message || 'Failed to delete item', 'error');
      }
    } catch (err) {
      showToast('Server error deleting item', 'error');
    } finally {
      setDeleteConfirmItem(null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSelectCategory = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const handleGoHome = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setFilterLowStock(false);
  };

  // Show category grid view if no category is selected and no search query is active
  const isCategoryGridView = selectedCategory === null && !searchQuery.trim() && !filterLowStock;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      
      {/* Top Header Navbar */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        totalItemsCount={activeItems.length}
        onGoHome={handleGoHome}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Top Prominent Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Category Pills Quick Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none">
          <button
            onClick={handleGoHome}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
              selectedCategory === null
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            All Categories
          </button>

          {availableCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory?.toLowerCase() === cat.toLowerCase()
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 text-blue-400 hover:text-white transition-all flex items-center gap-1 shrink-0"
            title="Manage Categories in Settings"
          >
            <Wrench className="w-3.5 h-3.5" />
            + Category
          </button>
        </div>

        {/* Dynamic Section View Header */}
        {!isCategoryGridView && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <button
                onClick={handleGoHome}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-400" />
                  {selectedCategory ? `${selectedCategory} Parts` : searchQuery ? `Search Results` : 'Spare Parts Catalog'}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-800 text-blue-400 rounded-full border border-slate-700">
                  {filteredItems.length} {filteredItems.length === 1 ? 'part' : 'parts'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {filterLowStock && (
                <button
                  onClick={() => setFilterLowStock(false)}
                  className="px-3 py-1 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl hover:bg-amber-500/30 transition-colors"
                >
                  Clear Low Stock Filter
                </button>
              )}

              <button
                onClick={() => fetchItems(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
                title="Refresh Inventory"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-sm font-semibold">Loading shop inventory...</p>
          </div>
        ) : isCategoryGridView ? (
          /* Category Grid View on App Launch */
          <CategoryGrid
            items={activeItems}
            categories={availableCategories}
            onSelectCategory={handleSelectCategory}
            onOpenCategoryManager={() => setIsSettingsOpen(true)}
          />
        ) : filteredItems.length === 0 ? (
          /* Empty Search or Inventory View */
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center my-6 max-w-xl mx-auto">
            <div className="p-4 bg-slate-800/50 rounded-full w-fit mx-auto text-slate-500 mb-4">
              <PackageX className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Matching Spare Parts Found</h3>
            <p className="text-sm text-slate-400 mb-6">
              {selectedCategory
                ? `No spare parts currently stored in the "${selectedCategory}" category.`
                : searchQuery
                  ? `No items matched "${searchQuery}".`
                  : 'Your inventory catalog is currently empty.'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Item to {selectedCategory || 'Catalog'}
              </button>
            )}
          </div>
        ) : (
          /* Items Cards Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredItems.map(item => (
              <ItemCard
                key={item._id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onEdit={handleOpenEditModal}
                onDelete={(item) => setDeleteConfirmItem(item)}
                onImageClick={(item) => setFullscreenImageItem(item)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Add / Edit Item Modal */}
      <ItemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
        categories={availableCategories}
      />

      {/* Store Settings & Category Manager Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        items={activeItems}
        filterLowStock={filterLowStock}
        setFilterLowStock={setFilterLowStock}
        categories={availableCategories}
        onAddCategory={handleAddCategory}
        onRemoveCategory={handleRemoveCategory}
        onResetCategories={handleResetCategories}
      />

      {/* Fullscreen Image Lightbox Modal */}
      {fullscreenImageItem && (
        <ImageModal
          item={fullscreenImageItem}
          onClose={() => setFullscreenImageItem(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Delete Spare Part?</h3>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete <span className="font-bold text-white">"{deleteConfirmItem.partName}"</span> ({deleteConfirmItem.bikeModel})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(deleteConfirmItem)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold text-xs hover:bg-red-500 shadow-lg shadow-red-600/30"
              >
                Delete Part
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
};

export default App;
