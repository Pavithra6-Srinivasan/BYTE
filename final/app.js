const mysql = require('mysql2');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();



const pool = mysql.createConnection({
    // host: process.env.DB_HOST,
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_DATABASE
    uri: process.env.JDBC_DATABASE_URL
});


pool.connect((err) => {
    if (err) {
        console.error('Error connecting to jawsdb:', err);
        return;
    }
    console.log('Connected to jawsdb');
});


async function scrapeAndStoreProductData(url) {
    try {
        // Fetch HTML content from the provided URL
        const { data } = await axios.get(url);
        // Load the HTML content into Cheerio
        const $ = cheerio.load(data);
        const productTile = $('.product-tile');

        productTile.each((index, element) => {
            try {
                const name = $(element).find('.name-link').attr('title').trim();
                const title = name.replace('Go to Product:', '');

                // Adjust the selector to target the nested img element
                const imgElement = $(element).find('.thumb-link img');
                const imgSrc = imgElement.attr('src') || imgElement.attr('data-src') || imgElement.attr('data-srcset');
                const urlElement = $(element).find('.thumb-link');
                const pageUrl = urlElement.attr('href') || urlElement.attr('data-orighref');
               
                const priceWithCurrency = $(element).find('.product-pricing').text().trim();
                const price = parseFloat(priceWithCurrency.replace(/[^\d.]/g, ''));

                //const colorElements = $(element).find('.swatch');
                //const colorElements = [];
                const colorElements = $(element).find('.product-colours-available').children();

                //const colorElements = $(element).find('.product-colours-available .swatch');
                console.log('Color Elements:', colorElements.html()); // Log the HTML of color elements for debugging
                
                const colours = [];
              
                    colorElements.each((index, Element) => {
                    const classList = $(Element).attr('class').split(' ');
                    console.log(`Class List for element ${index + 1}:`, classList); // Log the class list for each color element for debugging
                
                    const colorClass = classList.find(cls => cls.startsWith('swatch-'));
                    console.log('Color Class:', colorClass); // Log the color class for debugging
                
                    if (colorClass) {
                        colours.push(colorClass.replace('swatch-', '')); // Remove 'swatch-' prefix to get color name
                    }
                });
                
                console.log('Extracted Colours:', colours); // Log the final colours array
                
                // Insert product data into the database
                const query = 'INSERT INTO cottonon (title, img, pricing, urlpg, colour) VALUES (?, ?, ?, ?, ?)';
                pool.query(query, [title, imgSrc, price, pageUrl, JSON.stringify(colours)], (err, results) => {
                    if (err) {
                        console.error('Error inserting data into MySQL:', err);
                        return;
                    }
                    console.log('Inserted product data:', results.insertId);
                });

                console.log({ title, imgSrc, price, pageUrl, colours });
            } catch (error) {
                console.error('Error extracting product details:', error);
            }
        });
    } catch (error) {
        console.error('Error scraping the website:', error);
    }
}

// Example usage
const url = 'https://cottonon.com/SG/co/men/mens-clothing/mens-fleece-knits/';
scrapeAndStoreProductData(url);

    