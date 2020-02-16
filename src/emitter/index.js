const EventEmitter = require('events');
const { Telegram } = require('../telegramAPI');

const telegram = new Telegram();

const createEmitter = (scrapeDate = null, all = [], important = []) => {
    const state = { scrapeDate, all, important };

    return () => {
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

        scraperEmitter.on('pushImportant', (importantMatches) => {
            const {important} = state;
            important.push(importantMatches);

            telegram.setImportantMessage(importantMatches);
        });

        scraperEmitter.on('notFound', () => {
            const {scrapeDate} = state;

            const errorMessage = `На *[${scrapeDate}]* не было найдено спортивных событий`;

            telegram.setError(errorMessage);
        });

        scraperEmitter.on('send', async () => {
            const {all} = state;
            try {
                await telegram.send();
                console.log('scrape was success');
                console.log(JSON.stringify(all, null, 4));
            } catch (e) {
                console.log(e);
            }
        });

        return scraperEmitter;
    }
};

module.exports = createEmitter;
