import React, { useState, useEffect } from 'react';
import { X, Upload, Package, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';

const BIKE_COMPANIES = ['Hero', 'Honda', 'TVS', 'Bajaj', 'Yamaha', 'Suzuki', 'Royal Enfield', 'KTM', 'Other'];
const DEFAULT_CATEGORIES = ['Visor', 'Side Panel', 'Headlight', 'Engine Parts', 'Bolt', 'Washer', 'Nut', 'Brake Pad / Shoe', 'Cable', 'Electrical', 'Suspension', 'Filter', 'Other'];

const ItemFormModal = ({ isOpen, onClose, onSubmit, editingItem, categories = DEFAULT_CATEGORIES }) => {
  const activeCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const [formData, setFormData] = useState({
    bikeCompany: 'Hero',
    bikeModel: '',
    category: activeCategories[0] || 'Visor',
    colour: '',
    quantity: 1,
    boxNumber: '',
    purchasePrice: '',
    imageUrl: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingItem) {
      setFormData({
        bikeCompany: editingItem.bikeCompany || 'Hero',
        bikeModel: editingItem.bikeModel || '',
        category: editingItem.category || activeCategories[0] || 'Visor',
        colour: editingItem.colour || '',
        quantity: editingItem.quantity !== undefined ? editingItem.quantity : 1,
        boxNumber: editingItem.boxNumber || '',
        purchasePrice: editingItem.purchasePrice !== undefined ? Math.round(Number(editingItem.purchasePrice)) : '',
        imageUrl: editingItem.imageUrl || '',
      });
      setPreviewUrl(editingItem.imageUrl || '');
      setImageFile(null);
    } else {
      setFormData({
        bikeCompany: 'Hero',
        bikeModel: '',
        category: activeCategories[0] || 'Visor',
        colour: '',
        quantity: 1,
        boxNumber: '',
        purchasePrice: '',
        imageUrl: '',
      });
      setPreviewUrl('');
      setImageFile(null);
    }
    setErrorMsg('');
  }, [editingItem, isOpen, categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.bikeModel.trim()) {
      setErrorMsg('Bike Model is required (e.g. Splendor Plus)');
      return;
    }
    if (!formData.boxNumber.trim()) {
      setErrorMsg('Box Number is required (e.g. B01, Drawer-1)');
      return;
    }
    if (formData.purchasePrice === '' || isNaN(Number(formData.purchasePrice)) || Number(formData.purchasePrice) < 0) {
      setErrorMsg('Valid Purchase Price is required');
      return;
    }

    setLoading(true);
    try {
      const cleanPrice = Math.round(Number(formData.purchasePrice));
      
      const dataToSend = new FormData();
      dataToSend.append('bikeCompany', formData.bikeCompany);
      dataToSend.append('bikeModel', formData.bikeModel);
      dataToSend.append('partName', formData.category); // Default partName to Category
      dataToSend.append('category', formData.category);
      dataToSend.append('colour', formData.colour);
      dataToSend.append('quantity', formData.quantity);
      dataToSend.append('boxNumber', formData.boxNumber);
      dataToSend.append('purchasePrice', cleanPrice);
      dataToSend.append('imageUrl', formData.imageUrl);

      if (imageFile) {
        dataToSend.append('image', imageFile);
      }

      await onSubmit(dataToSend, editingItem ? editingItem._id : null);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  // Explicit Secret Price Code preview helper (Using explicit string concatenation)
  const cleanPriceStr = formData.purchasePrice !== '' && !isNaN(Number(formData.purchasePrice))
    ? String(Math.round(Number(formData.purchasePrice)))
    : null;
  const secretPreview = cleanPriceStr !== null
    ? `347 - ${cleanPriceStr}`
    : '347 - XXX';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {editingItem ? 'Edit Spare Part Details' : 'Add New Spare Part'}
              </h2>
              <p className="text-xs text-slate-400">
                {editingItem ? 'Update inventory specifications & secret price' : 'Enter part details to store in repair shop inventory'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Bike Company */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Bike Company *
              </label>
              <select
                name="bikeCompany"
                value={formData.bikeCompany}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {BIKE_COMPANIES.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>

            {/* Bike Model */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Bike Model *
              </label>
              <input
                type="text"
                name="bikeModel"
                value={formData.bikeModel}
                onChange={handleChange}
                placeholder="e.g. Splendor Plus, Activa 6G"
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {activeCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Colour */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Colour
              </label>
              <input
                type="text"
                name="colour"
                value={formData.colour}
                onChange={handleChange}
                placeholder="e.g. Black, Red, Silver"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Box Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Box Number *
              </label>
              <input
                type="text"
                name="boxNumber"
                value={formData.boxNumber}
                onChange={handleChange}
                placeholder="e.g. B01, B02, Drawer-1"
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Initial Stock Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Purchase Price Input */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Actual Purchase Price (₹) *
              </label>
              <input
                type="number"
                name="purchasePrice"
                min="0"
                step="1"
                value={formData.purchasePrice}
                onChange={handleChange}
                placeholder="e.g. 500"
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono text-lg"
              />
            </div>

          </div>

          {/* Secret Price Banner Notice */}
          <div className="p-4 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-300">Secret Price Code Auto-Generator</p>
                <p className="text-xs text-slate-400">Random 3-digit prefix + separator line + exact price (e.g. 500 → #347 - 500)</p>
              </div>
            </div>
            <div className="text-right font-mono text-base font-extrabold text-emerald-400 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 tracking-wider">
              #{secretPreview}
            </div>
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Upload Part Image
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* File Input Zone */}
              <div className="sm:col-span-2 relative border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-2xl p-4 text-center bg-slate-950 transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 mx-auto text-slate-400 group-hover:text-blue-400 transition-colors" />
                <p className="text-xs font-medium text-slate-300 mt-1">
                  Click or drag image file here
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
              </div>

              {/* Image Preview Thumbnail */}
              <div className="h-36 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Part Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-600">
                    <ImageIcon className="w-8 h-8 mx-auto" />
                    <span className="text-[10px]">Preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingItem ? 'Update Item' : 'Save Item'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ItemFormModal;
