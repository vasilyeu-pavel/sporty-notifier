const puppeteer = require('puppeteer');
const { getFullDate } = require('./utils/formatDate');
const { scrapeWebsite } = require('./scrapeWebsite');
const { getWebsite } = require('./data/websites');
const createEmitter = require('./emitter');

const scraper = async (date = Date.now()) => {
    const fullDate = getFullDate(date);

    const websites = getWebsite(fullDate('/'));

    console.log('start scraping!');
    console.time('scrape');
    const scrapeDate = fullDate('-');

    const scraperEmitter = createEmitter(scrapeDate)();

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
        ],
        // headless: false
    });

    try {
        const result = await Promise.all(websites.map(websiteOption =>
            scrapeWebsite({
                ...websiteOption,
                browser,
                scrapeDate
            })));

        await browser.close();

        console.timeEnd('scrape');

        if (result.length && result.some(res => res.length)) {
            const filteredMatches = result.filter(el => el.length);

            scraperEmitter.emit('pushAll', filteredMatches);

            filteredMatches.forEach(events => events.forEach(league => {
                if (!league.isImportant) return;

                scraperEmitter.emit('pushImportant', league);
            }));
        } else {
            scraperEmitter.emit('notFound');
        }

    } catch (e) {
        console.error(e.message);
    }

    scraperEmitter.emit('send');
};

module.exports = {
    scraper
};
