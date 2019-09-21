const request = require("request");
const { config } = require('./config');

const createMessage = result =>
    `[#МатчиRIP] на *${result[0][0].date}*:
    ${result.map((events, k) => `
${k !== 0 ? `\n` : ``}*${events[0].sport}*
${events.map(({ league, matches }, i) => `\n${i + 1}) ${league} - *${matches.length}*`)}`)
}`;

const sendTelegramMessage = message => new Promise((resolve, reject) => {
    const messages = createMessage(message).replace(/,/g, '');

    const options = {
        method: 'GET',
        url: `https://api.telegram.org/bot${config.token}/sendMessage`,
        qs:
            { chat_id: config.chatId,
                text:  messages
            },
        headers:
            { 'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
        formData: { parse_mode: 'Markdown' }
    };

    request(options, function (error, response, body) {
        if (error) reject(error);
        resolve(body);
    });
});

module.exports = { sendTelegramMessage };
