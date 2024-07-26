const mysql = require('mysql2');
const puppeteer = require('puppeteer');
require('dotenv').config();

const pool = mysql.createConnection({
    uri: process.env.JDBC_DATABASE_URL,
});

pool.connect((err) => {
    if (err) {
        console.error('Error connecting to jawsdb:', err);
        return;
    }
    console.log('Connected to jawsdb');
});

async function scrapeAndStoreImages(url) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        await autoScroll(page);

        const images = await page.evaluate(() => {
            const imageElements = document.querySelectorAll('img');
            return Array.from(imageElements).map(img => img.src).filter(src => src);
        });

        console.log('Found images:', images);

        for (const imageUrl of images) {
            await new Promise((resolve, reject) => {
                const query = 'SELECT COUNT(*) as count FROM minspo WHERE image_url = ?';
                pool.query(query, [imageUrl], (err, results) => {
                    if (err) {
                        console.error('Error querying data from MySQL:', err);
                        reject(err);
                        return;
                    }

                    if (results[0].count === 0) {
                        const insertQuery = 'INSERT INTO minspo (image_url) VALUES (?)';
                        pool.query(insertQuery, [imageUrl], (err, results) => {
                            if (err) {
                                console.error('Error inserting data into MySQL:', err);
                                reject(err);
                                return;
                            }
                            console.log('Inserted image URL:', imageUrl);
                            resolve();
                        });
                    } else {
                        console.log('Image URL already exists:', imageUrl);
                        resolve();
                    }
                });
            });
        }

        await browser.close();
    } catch (error) {
        console.error('Error scraping the website:', error);
    }
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 100;
            const delay = 100;
            let previousHeight = 0;

            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;

                const newHeight = document.body.scrollHeight;
                if (newHeight === previousHeight) {
                    clearInterval(timer);
                    resolve();
                } else {
                    previousHeight = newHeight;
                }
            }, delay);
        });
    });
}

// Example usage
const url = 'https://www.pinterest.com/search/pins/?q=judebelligham%20street%20style&rs=typed';
(async () => {
    await scrapeAndStoreImages(url);
})();
