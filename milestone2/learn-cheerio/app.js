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
                const query = 'INSERT INTO CottonOn (title, img, pricing, urlpg, colour) VALUES (?, ?, ?, ?, ?)';
                connection.query(query, [title, imgSrc, price, pageUrl, JSON.stringify(colours)], (err, results) => {
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
const url = 'https://cottonon.com/SG/co/women/womens-clothing/womens-pants/';
scrapeAndStoreProductData(url);

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


// Example usa

// Close the MySQL connection when done
// connection.end();
