//inspiration pg webscrapping
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
            const imageElements = document.querySelectorAll('.hCL.kVc.L4E.MIw');
            return Array.from(imageElements).map(img => img.src).filter(src => src); // Filter out any undefined src
        });

        console.log('Found images:', images);

        // Insert image URLs into the database
        images.forEach(imageUrl => {
            const query = 'INSERT INTO finspo (image_url) VALUES (?)';
            pool.query(query, [imageUrl], (err, results) => {
                if (err) {
                    console.error('Error inserting data into MySQL:', err);
                    return;
                }
                console.log('Inserted image URL:', imageUrl);
            });
        });

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
const url = 'https://www.pinterest.com/search/pins/?q=model%20off%20duty%20looks&rs=typed';
(async () => {
    await scrapeAndStoreImages(url);
})();



// const mysql = require('mysql2');
// const axios = require('axios');
// const cheerio = require('cheerio');
// require('dotenv').config();



// const pool = mysql.createConnection({
//     // host: process.env.DB_HOST,
//     // user: process.env.DB_USER,
//     // password: process.env.DB_PASSWORD,
//     // database: process.env.DB_DATABASE
//     uri: process.env.JDBC_DATABASE_URL
// });


// pool.connect((err) => {
//     if (err) {
//         console.error('Error connecting to jawsdb:', err);
//         return;
//     }
//     console.log('Connected to jawsdb');
// });


// async function scrapeAndStoreProductData(url) {
//     try {
//         // Fetch HTML content from the provided URL
//         const { data } = await axios.get(url);
//         // Load the HTML content into Cheerio
//         const $ = cheerio.load(data);
//         const productTile = $('.product-tile');

//         productTile.each((index, element) => {
//             try {
//                 const name = $(element).find('.name-link').attr('title').trim();
//                 const title = name.replace('Go to Product:', '');

//                 // Adjust the selector to target the nested img element
//                 const imgElement = $(element).find('.thumb-link img');
//                 const imgSrc = imgElement.attr('src') || imgElement.attr('data-src') || imgElement.attr('data-srcset');
//                 const urlElement = $(element).find('.thumb-link');
//                 const pageUrl = urlElement.attr('href') || urlElement.attr('data-orighref');
               
//                 const priceWithCurrency = $(element).find('.product-pricing').text().trim();
//                 const price = parseFloat(priceWithCurrency.replace(/[^\d.]/g, ''));

//                 //const colorElements = $(element).find('.swatch');
//                 //const colorElements = [];
//                 const colorElements = $(element).find('.product-colours-available').children();

//                 //const colorElements = $(element).find('.product-colours-available .swatch');
//                 console.log('Color Elements:', colorElements.html()); // Log the HTML of color elements for debugging
                
//                 const colours = [];
              
//                     colorElements.each((index, Element) => {
//                     const classList = $(Element).attr('class').split(' ');
//                     console.log(`Class List for element ${index + 1}:`, classList); // Log the class list for each color element for debugging
                
//                     const colorClass = classList.find(cls => cls.startsWith('swatch-'));
//                     console.log('Color Class:', colorClass); // Log the color class for debugging
                
//                     if (colorClass) {
//                         colours.push(colorClass.replace('swatch-', '')); // Remove 'swatch-' prefix to get color name
//                     }
//                 });
                
//                 console.log('Extracted Colours:', colours); // Log the final colours array
                
//                 // Insert product data into the database
//                 const query = 'INSERT INTO cottonon (title, img, pricing, urlpg, colour) VALUES (?, ?, ?, ?, ?)';
//                 pool.query(query, [title, imgSrc, price, pageUrl, JSON.stringify(colours)], (err, results) => {
//                     if (err) {
//                         console.error('Error inserting data into MySQL:', err);
//                         return;
//                     }
//                     console.log('Inserted product data:', results.insertId);
//                 });

//                 console.log({ title, imgSrc, price, pageUrl, colours });
//             } catch (error) {
//                 console.error('Error extracting product details:', error);
//             }
//         });
//     } catch (error) {
//         console.error('Error scraping the website:', error);
//     }
// }

// // Example usage
// const url = 'https://cottonon.com/SG/co/men/mens-clothing/mens-fleece-knits/';
// scrapeAndStoreProductData(url);

    
