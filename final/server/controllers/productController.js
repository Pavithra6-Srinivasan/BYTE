const db = require('../config/db');

const getProducts = (req, res) => {
    const query = "SELECT title, pricing, img, colour, urlpg FROM cottonon WHERE category = 'graphictees'";

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching cotton:', error);
            res.status(500).send('Error fetching cottonon');
            return;
        }

        res.render('products', { products: results });
    });
};

const getProducts2 = (req, res) => {
    const query = "SELECT title, pricing, img, colour, urlpg FROM cottonon WHERE category = 'tops'";

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching cotton:', error);
            res.status(500).send('Error fetching cottonon');
            return;
        }

        res.render('products2', { products2: results });
    });
};

module.exports = { getProducts, getProducts2 };
