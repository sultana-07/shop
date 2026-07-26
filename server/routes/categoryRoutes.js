const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Base path: /api/categories

router.get('/', categoryController.getCategories);
router.post('/', categoryController.addCategory);
router.post('/reset', categoryController.resetCategories);
router.delete('/:name', categoryController.deleteCategory);

module.exports = router;
