const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const { uploadImages, addUrlImage, deleteFolder } = require('../controllers/imageController');
const router = express.Router();

router.post('/upload', upload.array('images', 10), uploadImages);
router.post('/add-url-image', addUrlImage);
router.delete('/delete-folder/:folderId', deleteFolder);

module.exports = router;
