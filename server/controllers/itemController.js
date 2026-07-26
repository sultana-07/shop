const Item = require('../models/Item');
const { uploadToCloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Fallback JSON File storage path if MongoDB is offline
const DATA_FILE = path.join(__dirname, '..', 'data', 'items.json');

const ensureDataFile = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
  }
};

const readLocalData = () => {
  ensureDataFile();
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content || '[]');
  } catch {
    return [];
  }
};

const writeLocalData = (data) => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

const isMongoConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// Helper: Generate secret display price (Random 3 digits + line + actual price using explicit string concatenation)
const generateDisplayPrice = (price) => {
  const cleanPrice = String(Math.round(Number(price)));
  const randomPrefix = String(Math.floor(100 + Math.random() * 900)); // 3-digit number (100 to 999)
  return `${randomPrefix} - ${cleanPrice}`;
};

// Helper: Google-style multi-token search check
const matchSearchQuery = (item, queryStr) => {
  if (!queryStr || !queryStr.trim()) return true;
  const tokens = queryStr.toLowerCase().trim().split(/\s+/);
  const combinedText = [
    item.bikeCompany,
    item.bikeModel,
    item.partName,
    item.category,
    item.colour,
    item.boxNumber,
  ].filter(Boolean).join(' ').toLowerCase();

  return tokens.every(token => combinedText.includes(token));
};

// GET /api/items
exports.getItems = async (req, res) => {
  try {
    const { q } = req.query;

    if (isMongoConnected()) {
      let items = await Item.find().sort({ createdAt: -1 });
      if (q && q.trim()) {
        items = items.filter(item => matchSearchQuery(item, q));
      }
      return res.json({ success: true, count: items.length, data: items });
    }

    // Local JSON fallback
    let localItems = readLocalData();
    if (q && q.trim()) {
      localItems = localItems.filter(item => matchSearchQuery(item, q));
    }
    return res.json({ success: true, count: localItems.length, data: localItems });
  } catch (error) {
    console.error('Error in getItems:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving items' });
  }
};

// GET /api/items/:id
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      return res.json({ success: true, data: item });
    }

    const localItems = readLocalData();
    const item = localItems.find(i => i._id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    return res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/items
exports.createItem = async (req, res) => {
  try {
    const {
      bikeCompany,
      bikeModel,
      partName,
      category,
      colour,
      quantity,
      boxNumber,
      purchasePrice,
    } = req.body;

    if (!bikeCompany || !bikeModel || !category || !boxNumber || purchasePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (Bike Company, Bike Model, Category, Box Number, Purchase Price)',
      });
    }

    const numPrice = Math.round(Number(purchasePrice));
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Purchase price must be a valid positive number' });
    }

    const numQty = Number(quantity || 0);
    if (isNaN(numQty) || numQty < 0) {
      return res.status(400).json({ success: false, message: 'Quantity cannot be below 0' });
    }

    // Secret Price generation
    const displayPrice = generateDisplayPrice(numPrice);

    // Image Upload
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const newItemData = {
      bikeCompany: bikeCompany.trim(),
      bikeModel: bikeModel.trim(),
      partName: (partName || category).trim(),
      category: category.trim(),
      colour: (colour || '').trim(),
      quantity: numQty,
      boxNumber: boxNumber.trim(),
      purchasePrice: numPrice,
      displayPrice,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    if (isMongoConnected()) {
      const item = await Item.create(newItemData);
      return res.status(201).json({ success: true, message: 'Item added successfully', data: item });
    }

    // Local JSON fallback
    const localItems = readLocalData();
    const newItem = {
      _id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      ...newItemData,
    };
    localItems.unshift(newItem);
    writeLocalData(localItems);

    return res.status(201).json({ success: true, message: 'Item added successfully', data: newItem });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// PUT /api/items/:id
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bikeCompany,
      bikeModel,
      partName,
      category,
      colour,
      quantity,
      boxNumber,
      purchasePrice,
    } = req.body;

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const numPrice = purchasePrice !== undefined ? Math.round(Number(purchasePrice)) : undefined;
    const numQty = quantity !== undefined ? Number(quantity) : undefined;

    if (numQty !== undefined && numQty < 0) {
      return res.status(400).json({ success: false, message: 'Quantity cannot be below 0' });
    }

    if (isMongoConnected()) {
      const existing = await Item.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }

      if (bikeCompany !== undefined) existing.bikeCompany = bikeCompany.trim();
      if (bikeModel !== undefined) existing.bikeModel = bikeModel.trim();
      if (partName !== undefined) existing.partName = partName.trim();
      if (category !== undefined) existing.category = category.trim();
      if (colour !== undefined) existing.colour = colour.trim();
      if (boxNumber !== undefined) existing.boxNumber = boxNumber.trim();
      if (numQty !== undefined) existing.quantity = numQty;

      if (numPrice !== undefined && numPrice !== existing.purchasePrice) {
        existing.purchasePrice = numPrice;
        existing.displayPrice = generateDisplayPrice(numPrice);
      }

      if (imageUrl !== undefined) existing.imageUrl = imageUrl;

      const updated = await existing.save();
      return res.json({ success: true, message: 'Item updated successfully', data: updated });
    }

    // Local JSON fallback
    const localItems = readLocalData();
    const index = localItems.findIndex(i => i._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const item = localItems[index];
    if (bikeCompany !== undefined) item.bikeCompany = bikeCompany.trim();
    if (bikeModel !== undefined) item.bikeModel = bikeModel.trim();
    if (partName !== undefined) item.partName = partName.trim();
    if (category !== undefined) item.category = category.trim();
    if (colour !== undefined) item.colour = colour.trim();
    if (boxNumber !== undefined) item.boxNumber = boxNumber.trim();
    if (numQty !== undefined) item.quantity = numQty;

    if (numPrice !== undefined && numPrice !== item.purchasePrice) {
      item.purchasePrice = numPrice;
      item.displayPrice = generateDisplayPrice(numPrice);
    }

    if (imageUrl !== undefined) item.imageUrl = imageUrl;

    localItems[index] = item;
    writeLocalData(localItems);

    return res.json({ success: true, message: 'Item updated successfully', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/items/:id/quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'add' or 'use'

    if (!action || !['add', 'use'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be "add" or "use"' });
    }

    if (isMongoConnected()) {
      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }

      if (action === 'use') {
        if (item.quantity <= 0) {
          return res.status(400).json({ success: false, message: 'Quantity is already 0' });
        }
        item.quantity -= 1;
      } else if (action === 'add') {
        item.quantity += 1;
      }

      await item.save();
      return res.json({ success: true, message: `Item quantity ${action === 'add' ? 'increased' : 'decreased'}`, data: item });
    }

    // Local JSON fallback
    const localItems = readLocalData();
    const index = localItems.findIndex(i => i._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const item = localItems[index];
    if (action === 'use') {
      if (item.quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity is already 0' });
      }
      item.quantity -= 1;
    } else if (action === 'add') {
      item.quantity += 1;
    }

    localItems[index] = item;
    writeLocalData(localItems);

    return res.json({ success: true, message: `Item quantity ${action === 'add' ? 'increased' : 'decreased'}`, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const deleted = await Item.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      return res.json({ success: true, message: 'Item deleted successfully' });
    }

    // Local JSON fallback
    const localItems = readLocalData();
    const index = localItems.findIndex(i => i._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    localItems.splice(index, 1);
    writeLocalData(localItems);

    return res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
