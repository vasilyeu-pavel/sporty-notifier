const TelegramBot = require('node-telegram-bot-api');
const { config } = require('./config');

const bot = new TelegramBot(config.token, { polling: true });

class Telegram {
    constructor() {
        this.error = null;
        this.date = null;
        this.importantMatches = '';
        this.allMatches = '';
    };

    setDate(date) {
        this.date = date;

        return this;
    }

    setDefaultMessage() {
        this.importantMatches = `\n
[#Важные матчи] на *${this.date}*:
`;

        this.allMatches = `\n[#МатчиRIP] на *${this.date}*:`;

        return this;
    }

    createAllMessage(message) {
        if (!message || !message.length) return 'Нет матчей';

        return     `
    ${message.map((events, k) => `
${k !== 0 ? `\n` : ``}*${events[0].sport}*
${events.map(({ league, matches }, i) => `\n${i + 1}) ${league} - *${matches && matches.length}*`)}`)
            }`;
    }

    createImportantMessage({ sport, league, matches }) {
        if (!matches || !matches.length) return 'Нет матчей';

        return `
*${sport}* [${league}]
${matches.map(({match, start}) => `\n- ${match}*[${start}]*`)}
`;
    }

    setImportantMessage(message) {
        this.importantMatches += this.createImportantMessage(message).replace(/,/g, '');

        return this;
    }

    setError(message) {
        this.error = message;

        return this;
    }

    setMessage(message = '') {
        this.allMatches += this.createAllMessage(message).replace(/,/g, '');

        return this;
    }

    async send() {
        const message = !this.error ? this.allMatches + this.importantMatches : this.error;

        if (message && message.length) {
            await bot.sendMessage(config.chatId, message, { parse_mode: "markdown" });
        }
    }
}

module.exports = { Telegram };
