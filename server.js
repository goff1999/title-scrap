const express = require('express');
const scrapeTheVerge = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs'); // For rendering HTML

app.get('/', async (req, res) => {
    const articles = await scrapeTheVerge();
    res.render('index', { articles });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
