const sharp = require('sharp');

const resizeImage = (inputPath, maxWidth, maxHeight) => {
    return sharp(inputPath)
        .resize({ 
            fit: 'inside',
            width: maxWidth,
            height: maxHeight,
            withoutEnlargement: true
        })
        .toBuffer();
};

module.exports = { resizeImage };
