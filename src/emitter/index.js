const EventEmitter = require('events');
const { Telegram } = require('../telegramAPI');
const { listEvents, saveMatchesInGC, getMatchesToSave } = require('../googleCalendar');

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
            const { important } = state;

            important.push(importantMatches);

            telegram.setImportantMessage(importantMatches);
        });

        scraperEmitter.on('notFound', () => {
            const {scrapeDate} = state;

            const errorMessage = `На *[${scrapeDate}]* не было найдено спортивных событий`;

            telegram.setError(errorMessage);
        });

        scraperEmitter.on('send', async () => {
            const { all, auth, important, scrapeDate } = state;
            try {
                console.log(JSON.stringify(all, null, 4));
                // send scraps matches to telegram bot
                await telegram.send();

                console.log('scrape was success');
                // get google events
                const matchesFromGoogle = await listEvents(auth, scrapeDate);

                if (!important.length) return [];

                // filtered
                const matchesToSave = getMatchesToSave(important, matchesFromGoogle);

                if (!matchesToSave.length) return;

                const { name, date } = important[0];

                // save filtered matches
                await saveMatchesInGC(auth, matchesToSave, name, date);
            } catch (e) {
                console.log(e);
            }

        });

        return scraperEmitter;
    }
};

module.exports = createEmitter;
