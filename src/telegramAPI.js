const request = require("request");
const { config } = require('./config');

class Telegram {
    constructor() {
        this.config = config;
        this.message = null;
    };

    createMessage(message) {
        return     `[#МатчиRIP] на *${message[0][0].date}*:
    ${message.map((events, k) => `
${k !== 0 ? `\n` : ``}*${events[0].sport}*
${events.map(({ league, matches }, i) => `\n${i + 1}) ${league} - *${matches.length}*`)}`)
            }`;
    }

    setMessage(message = '') {
        this.message = typeof message === 'object'
            ? this.createMessage(message).replace(/,/g, '')
            : message;
    }

    send() {
        const options = {
            method: 'GET',
            url: `https://api.telegram.org/bot${this.config.token}/sendMessage`,
            qs:
                {
                    chat_id: this.config.chatId,
                    text: this.message
                },
            headers: {
                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
            },
            formData: {
                parse_mode: 'Markdown'
            }
        };

        return new Promise((resolve, reject) => {
            request(options, function (error, response, body) {
                if (error) reject(error);
                resolve(body);
            });
        });
    }
}

module.exports = { Telegram };
