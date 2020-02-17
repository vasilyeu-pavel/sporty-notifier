const puppeteer = require('puppeteer');
const { getFullDate } = require('./utils/formatDate');
const { scrapeWebsite } = require('./scrapeWebsite');
const { getWebsite } = require('./data/websites');
const createEmitter = require('./emitter');
const {
    AuthGoogle
} = require('./googleCalendar');

const initialEmitter = createEmitter();

const scraper = async (date = Date.now()) => {
    const auth = await AuthGoogle();

    const emitter = initialEmitter({ auth });

    const fullDate = getFullDate(date);

    const websites = getWebsite(fullDate('/'));

    console.log('start scraping!');
    console.time('scrape');
    const scrapeDate = fullDate('-');

    emitter.emit('setDate', scrapeDate);

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
        ],
        // headless: false
    });

    try {
        // for develop mode you can commenting scraping and use mocks
        // mocks data for develop
        // const mocks = require('./data/mocks.json');
        // const result = mocks;
        const result = await Promise.all(websites.map(websiteOption =>
            scrapeWebsite({
                ...websiteOption,
                browser,
                scrapeDate
            })));

        await browser.close();

        console.timeEnd('scrape');

        if (result.length && result.some(res => res.length)) {
            // remove empty element
            const filteredMatches = result.filter(el => el.length);

            emitter.emit('pushAll', filteredMatches);

            filteredMatches.forEach(events => {
                events.forEach(league => {
                    if (!league.isImportant) return;

                    emitter.emit('pushImportant', league);
                })});

            if (!result.length) return;
        } else {
            emitter.emit('notFound');
        }

    } catch (e) {
        console.error(e.message);
    }

    emitter.emit('send');
};

module.exports = {
    scraper
};
