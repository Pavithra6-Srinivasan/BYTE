

const mysql = require('mysql2');
const axios = require('axios');
const cheerio = require('cheerio');

// Create a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'sqluser',
    password: 'password',
    database: 'byteusers'
});

// Connect to the database
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL as id', connection.threadId);
});
async function scrapeAndStoreProductData(url) {
    try {
        // Fetch HTML content from the provided URL
        const { data } = await axios.get(url);
        // Load the HTML content into Cheerio
        const $ = cheerio.load(data);
        const productTile = $('.product-tile');

        productTile.each((index, element) => {
            const title = $(element).find('.product-name a').attr('title').trim();
            const img = $(element).find('.product-image img').attr('src');
            const priceWithCurrency = $(element).find('.product-sales-price').text().trim();
            const price = parseFloat(priceWithCurrency.replace(/[^\d.]/g, ''));
            
            // Extract the colors from the swatches
            const colorElements = $(element).find('.product-colours-available span');
            const colours = [];
            colorElements.each((index, colorElement) => {
                const colorClass = $(colorElement).attr('class').split(' ').pop();
                colours.push(colorClass.replace('swatch-', '')); // Remove 'swatch-' prefix to get color name
            });
        
            console.log({
                title,
                img,
                price,
                colours
            });
        )}
        // Iterate over each product element
//         $('grid-title pagination-item columns gtm-product-data-container').each((index, element) => {
//             // Extract information from the product element
//             const title = $(element).find('p.name').attr('title');
//             const img = $(element).find('img.thumbnail').attr('src');
//             // Remove the currency symbol (£) and any other non-numeric characters from the price
//             const price = parseFloat(priceWithCurrency.replace(/[^\d.]/g, ''));
//             const colour = $(element).find('p.colour').text().trim();
            
//             // Insert the product data into the MySQL database
//             const sql = 'INSERT INTO CottonOn (title, img, price, colour) VALUES (?, ?, ?, ?)';
//             const values = [title, img, price, colour];
//             connection.query(sql, values, (err, result) => {
//                 if (err) {
//                     console.error('Error inserting product data:', err.message);
//                     return;
//                 }
//                 console.log('Product data inserted successfully:', result);
//             });
//         });
//     } catch (error) {
//         console.error('Error scraping product data:', error.message);
//     }
// }


// Example usage
const url = 'https://books.toscrape.com/';
scrapeAndStoreProductData(url);

// Close the MySQL connection when done
// connection.end();
