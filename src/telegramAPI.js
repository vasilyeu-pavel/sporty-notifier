const request = require("request");
const { config } = require('./config');

class Telegram {
    constructor() {
        this.config = config;
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

    reset() {
        this.importantMatches = '';
        this.allMatches = '';
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
            const options = {
                method: 'GET',
                url: `https://api.telegram.org/bot${this.config.token}/sendMessage`,
                qs:
                    {
                        chat_id: this.config.chatId,
                        text: message
                    },
                headers: {
                    'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
                },
                formData: {
                    parse_mode: 'Markdown'
                }
            };

            await new Promise((resolve, reject) => {
                request(options, function (error, response, body) {
                    if (error) reject(error);
                    resolve(body);
                });
            });
        }
    }
}

module.exports = { Telegram };
