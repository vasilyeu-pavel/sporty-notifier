const puppeteer = require('puppeteer');
const { getYear, getMonth, getDay, getTomorrow } = require('./utils/formatDate');
const { scrapeWebsite } = require('./scrapeWebsite');
const { sendTelegramMessage } = require('./sendMessage');

const tomorrow = new Date();

const websites = [
    {
        website: `https://www.soccerway.com/matches/${getYear(tomorrow)}/${getMonth(tomorrow)}/${getDay(0, tomorrow) < 10 ? '0' + getDay(0, tomorrow) : getDay(0, tomorrow)}/`,
        sport: 'football',
    },
    {
        website: 'https://www.myscore.com.ua/hockey/',
        sport: 'hockey'
    },
    {
        website: 'https://www.myscore.com.ua/basketball/',
        sport: 'basketball'
    }
];

const scraper = async () => {
    console.log('start scraping!');
    console.time('scrape');
    const scrapeDate = `${getYear(tomorrow)}-${getMonth(tomorrow)}-${getDay(0, tomorrow) < 10 ? '0' + getDay(0, tomorrow): getDay(0, tomorrow)}`;

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
        ],
    }); // headless: false

    try {
        const result = await Promise.all(websites.map(({ website, sport }) =>
            scrapeWebsite(browser, website, scrapeDate, sport)));

        await browser.close();

        console.timeEnd('scrape');

        if (result.length) {
            await sendTelegramMessage(result.filter(el => el.length));
            return result;
        }

    } catch (e) {
        console.error(e.message);
    }

    return [];
};

module.exports = {
    scraper
};
