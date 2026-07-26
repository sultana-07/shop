const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  bikeCompany: {
    type: String,
    required: [true, 'Bike Company is required'],
    trim: true,
  },
  bikeModel: {
    type: String,
    required: [true, 'Bike Model is required'],
    trim: true,
  },
  partName: {
    type: String,
    required: [true, 'Part Name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  colour: {
    type: String,
    default: '',
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be below 0'],
    default: 0,
  },
  boxNumber: {
    type: String,
    required: [true, 'Box Number is required'],
    trim: true,
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase Price is required'],
    min: [0, 'Purchase price cannot be negative'],
  },
  displayPrice: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Item', itemSchema);
