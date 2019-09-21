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
    }
    // {
    //     website: `http://www.scoresway.com/?sport=hockey&page=matches&date=${getYear(tomorrow)}-${getMonth(tomorrow)}-${getDay(0, tomorrow) < 10 ? '0' + getDay(0, tomorrow) : getDay(0, tomorrow)}`,
    //     sport: 'hockey'
    // }
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

    const result = [];

    for (const { website, sport } of websites) {
        console.time(website);
        try {
            const allMatches = await scrapeWebsite(browser, website, scrapeDate, sport);
            if (allMatches.length) {
                result.push(allMatches);
            }
        } catch (e) {
            console.error(e.message);
        }
        console.timeEnd(website);
    }

    await browser.close();
    console.timeEnd('scrape');

    if (result.length) {
        await sendTelegramMessage(result);
        return result;
    }

    return [];
};

module.exports = {
    scraper
};
