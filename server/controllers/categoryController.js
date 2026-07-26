const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

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

const CATEGORIES_FILE = path.join(__dirname, '..', 'data', 'categories.json');

const ensureCategoriesFile = () => {
  const dir = path.dirname(CATEGORIES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(CATEGORIES_FILE)) {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(DEFAULT_CATEGORIES, null, 2), 'utf-8');
  }
};

const readLocalCategories = () => {
  ensureCategoriesFile();
  try {
    const content = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
    const parsed = JSON.parse(content || '[]');
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
};

const writeLocalCategories = (cats) => {
  ensureCategoriesFile();
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(cats, null, 2), 'utf-8');
};

const isMongoConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// Seed default categories if DB empty
exports.seedDefaultCategoriesIfNeeded = async () => {
  try {
    if (isMongoConnected()) {
      const count = await Category.countDocuments();
      if (count === 0) {
        const docs = DEFAULT_CATEGORIES.map(name => ({ name }));
        await Category.insertMany(docs);
        console.log('Categories seeded in MongoDB.');
      }
    } else {
      ensureCategoriesFile();
    }
  } catch (err) {
    console.warn('Category seed warning:', err.message);
  }
};

// GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    if (isMongoConnected()) {
      let cats = await Category.find().sort({ createdAt: 1 });
      if (cats.length === 0) {
        const docs = DEFAULT_CATEGORIES.map(name => ({ name }));
        await Category.insertMany(docs);
        cats = await Category.find().sort({ createdAt: 1 });
      }
      return res.json({ success: true, data: cats.map(c => c.name) });
    }

    const localCats = readLocalCategories();
    return res.json({ success: true, data: localCats });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

// POST /api/categories
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const cleanName = name.trim();

    if (isMongoConnected()) {
      const existing = await Category.findOne({ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Category already exists' });
      }
      await Category.create({ name: cleanName });
      const allCats = await Category.find().sort({ createdAt: 1 });
      return res.status(201).json({ success: true, message: 'Category added', data: allCats.map(c => c.name) });
    }

    const localCats = readLocalCategories();
    if (localCats.some(c => c.toLowerCase() === cleanName.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    localCats.push(cleanName);
    writeLocalCategories(localCats);
    return res.status(201).json({ success: true, message: 'Category added', data: localCats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/categories/:name
exports.deleteCategory = async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name required' });
    }

    const targetName = decodeURIComponent(name).trim();

    if (isMongoConnected()) {
      await Category.deleteOne({ name: { $regex: new RegExp(`^${targetName}$`, 'i') } });
      const allCats = await Category.find().sort({ createdAt: 1 });
      return res.json({ success: true, message: `Category "${targetName}" removed`, data: allCats.map(c => c.name) });
    }

    let localCats = readLocalCategories();
    localCats = localCats.filter(c => c.toLowerCase() !== targetName.toLowerCase());
    writeLocalCategories(localCats);
    return res.json({ success: true, message: `Category "${targetName}" removed`, data: localCats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/categories/reset
exports.resetCategories = async (req, res) => {
  try {
    if (isMongoConnected()) {
      await Category.deleteMany({});
      const docs = DEFAULT_CATEGORIES.map(name => ({ name }));
      await Category.insertMany(docs);
      return res.json({ success: true, message: 'Categories reset to defaults', data: DEFAULT_CATEGORIES });
    }

    writeLocalCategories(DEFAULT_CATEGORIES);
    return res.json({ success: true, message: 'Categories reset to defaults', data: DEFAULT_CATEGORIES });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
