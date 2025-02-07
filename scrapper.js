
const puppeteer = require('puppeteer');

async function scrapeHeadlines() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://www.theverge.com/', { waitUntil: 'domcontentloaded' });

    // Extract headlines and URLs
    let articles = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a._1lkmsmo1._184mftor'))
            .map(link => ({ title: link.innerText, url: link.href }));
    });

    // Extract dates from article pages
    for (let article of articles) {
        try {
            await page.goto(article.url, { waitUntil: 'domcontentloaded' });

            article.date = await page.evaluate(() => {
                let dateElement = document.querySelector('time');
                return dateElement ? new Date(dateElement.dateTime).toISOString() : null;
            });
        } catch (error) {
            console.error(`Failed to load page: ${ article.url } `, error);
            article.date = null;
        }
    }

    await browser.close();

    // Filter articles from January 1, 2022, onwards
    const filteredArticles = articles
        .filter(article => article.date && new Date(article.date) >= new Date('2022-01-01'))
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort anti-chronologically

    // Print the filtered headlines
    console.log('Headlines of articles published from January 1, 2022, onwards:');
    filteredArticles.forEach(article => {
        console.log(`${ article.date }: ${ article.title } `);
    });
}

scrapeHeadlines().catch(error => console.error('Error:', error));
