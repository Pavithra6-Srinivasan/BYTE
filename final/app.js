const mysql = require('mysql2');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const pool = mysql.createConnection({
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

                const imgElement = $(element).find('.thumb-link img');
                const imgSrc = imgElement.attr('src') || imgElement.attr('data-src') || imgElement.attr('data-srcset');
                const urlElement = $(element).find('.thumb-link');
                const pageUrl = urlElement.attr('href') || urlElement.attr('data-orighref');
               
                const priceWithCurrency = $(element).find('.product-pricing').text().trim();
                const price = parseFloat(priceWithCurrency.replace(/[^\d.]/g, ''));

                const colorElements = $(element).find('.product-colours-available').children();

                console.log('Color Elements:', colorElements.html()); 
                
                const colours = [];
              
                    colorElements.each((index, Element) => {
                    const classList = $(Element).attr('class').split(' ');
                    console.log(`Class List for element ${index + 1}:`, classList); 
                
                    const colorClass = classList.find(cls => cls.startsWith('swatch-'));
                    console.log('Color Class:', colorClass); 
                
                    if (colorClass) {
                        colours.push(colorClass.replace('swatch-', ''));
                    }
                });
                
                console.log('Extracted Colours:', colours);
                
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

const url = 'https://cottonon.com/SG/co/men/mens-clothing/mens-fleece-knits/';
scrapeAndStoreProductData(url);
