const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const upload = require('../middleware/upload');

// Base path: /api/items

router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.post('/', upload.single('image'), itemController.createItem);
router.put('/:id', upload.single('image'), itemController.updateItem);
router.patch('/:id/quantity', itemController.updateQuantity);
router.delete('/:id', itemController.deleteItem);

module.exports = router;
