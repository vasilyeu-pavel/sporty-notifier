const EventEmitter = require('events');
const { Telegram } = require('../telegramAPI');
const { createEvents } = require('../googleCalendar');

const telegram = new Telegram();

const createEmitter = (scrapeDate = null, all = [], important = []) => {
    const state = { scrapeDate, all, important, auth: null };

    return ({ auth }) => {
        state.auth = auth;

        const scraperEmitter = new EventEmitter();

        scraperEmitter.on('pushAll', (matches) => {
            const {scrapeDate, all} = state;
            all.push(matches);

            telegram
                .setDate(scrapeDate)
                .setDefaultMessage()
                .setMessage(matches);
        });

        scraperEmitter.on('setDate', date => state.scrapeDate = date);

        scraperEmitter.on('pushImportant', async (importantMatches) => {
            const { important, auth } = state;
            const { name, date, matches } = importantMatches;

            important.push(importantMatches);

            telegram.setImportantMessage(importantMatches);

            for (const { match, start } of matches) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                    if (start.includes(':')) {
                        createEvents({
                            auth,
                            name: match,
                            description: name,
                            date,
                            time: start,
                        })
                    }
            }
        });

        scraperEmitter.on('notFound', () => {
            const {scrapeDate} = state;

            const errorMessage = `На *[${scrapeDate}]* не было найдено спортивных событий`;

            telegram.setError(errorMessage);
        });

        scraperEmitter.on('send', async () => {
            const { all, auth } = state;
            try {
                // await telegram.send();
                console.log('scrape was success');
                // console.log(JSON.stringify(all, null, 4));
            } catch (e) {
                console.log(e);
            }
        });

        return scraperEmitter;
    }
};

module.exports = createEmitter;
