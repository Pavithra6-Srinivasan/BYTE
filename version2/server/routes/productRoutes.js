const express = require('express');
const { getProducts, getProducts2 } = require('../controllers/productController');
const router = express.Router();

router.get('/products', getProducts);
router.get('/products2', getProducts2);

module.exports = router;
