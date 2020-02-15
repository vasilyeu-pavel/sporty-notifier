const puppeteer = require('puppeteer');
const { getFullDate } = require('./utils/formatDate');
const { scrapeWebsite } = require('./scrapeWebsite');
const { Telegram } = require('./sendMessage');
const { getWebsite } = require('./data/websites');

const scraper = async (date = Date.now()) => {
    const telegram = new Telegram();

    const fullDate = getFullDate(date);

    const websites = getWebsite(fullDate('/'));

    console.log('start scraping!');
    console.time('scrape');
    const scrapeDate = fullDate('-');

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
        ],
    }); // headless: false

    try {
        const result = await Promise.all(websites.map(websiteOption =>
            scrapeWebsite({
                ...websiteOption,
                browser,
                scrapeDate
            })));

        await browser.close();

        console.timeEnd('scrape');

        console.log(JSON.stringify(result, null, 4));

        if (result.length && result.some(res => res.length)) {
            telegram.setMessage(result.filter(el => el.length));
        } else {
            const messages = `На *[${scrapeDate}]* не было найдено спортивных событий`;
            console.log(messages);
            telegram.setMessage(messages);
        }

    } catch (e) {
        console.error(e.message);
    }

    telegram.send();
};

module.exports = {
    scraper
};
