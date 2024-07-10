const fs = require('fs');
const db = require('../config/db');
const { resizeImage } = require('../utils/imageUtils');

const uploadImages = async (req, res) => {
    const maxWidth = 800;
    const maxHeight = 600;
    const folderId = `folder-${Date.now()}`;

    try {
        const uploadPromises = req.files.map(async (file) => {
            const imgPath = file.path;
            const resizedImgBuffer = await resizeImage(imgPath, maxWidth, maxHeight);
            const encodedImg = resizedImgBuffer.toString('base64');

            const sql = 'INSERT INTO images (folder_id, img) VALUES (?, ?)';
            return new Promise((resolve, reject) => {
                db.query(sql, [folderId, encodedImg], (err, result) => {
                    if (err) reject(err);
                    resolve(`data:image/jpeg;base64,${encodedImg}`);
                });
            }).finally(() => {
                fs.unlink(imgPath, (err) => {
                    if (err) {
                        console.error(`Failed to delete file: ${imgPath}`, err);
                    }
                });
            });
        });

        const results = await Promise.all(uploadPromises);
        res.json({ folderId, images: results });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error processing images');
    }
};

const addUrlImage = async (req, res) => {
    const { url } = req.body;
    const folderId = `folder-${Date.now()}`;

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const encodedImg = buffer.toString('base64');

        const sql = 'INSERT INTO images (folder_id, img) VALUES (?, ?)';
        db.query(sql, [folderId, encodedImg], (err, result) => {
            if (err) throw err;
            res.json({ folderId, imageUrl: `data:image/jpeg;base64,${encodedImg}` });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching image from URL');
    }
};

const deleteFolder = (req, res) => {
    const { folderId } = req.params;
    const sql = 'DELETE FROM images WHERE folder_id = ?';
    db.query(sql, [folderId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting folder');
        }
        res.send('Folder deleted');
    });
};

module.exports = { uploadImages, addUrlImage, deleteFolder };
