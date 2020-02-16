const request = require("request");
const { config } = require('./config');

class Telegram {
    constructor() {
        this.config = config;
        this.message = null;
        this.date = null;
        this.matchesMessage = '';
    };

    setDate(date) {
        this.date = date;

        return this;
    }

    setDefaultMessage() {
        this.matchesMessage = `[#Важные матчи] на *${this.date}*:`;

        return this;
    }

    createMessage(message) {
        return     `[#МатчиRIP] на *${message[0][0].date}*:
    ${message.map((events, k) => `
${k !== 0 ? `\n` : ``}*${events[0].sport}*
${events.map(({ league, matches }, i) => `\n${i + 1}) ${league} - *${matches && matches.length}*`)}`)
            }`;
    }

    createMatchesMessage({ sport, league, matches }) {
        return `
*${sport}* [${league}]
${matches.map(({match, start}) => `\n- ${match}*[${start}]*`)}
`;
    }

    setImportantMessage(message) {
        this.matchesMessage += this.createMatchesMessage(message).replace(/,/g, '');

        return this;
    }

    setError(message) {
        this.message = message;

        return this;
    }

    setMessage(message = '') {
        this.message = this.createMessage(message).replace(/,/g, '');

        return this;
    }

    async send() {
        for (const message of [this.message, this.matchesMessage]) {
            if (message) {
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
}

module.exports = { Telegram };
