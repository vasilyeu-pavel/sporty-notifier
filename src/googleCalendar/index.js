const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(path.join(path.resolve(__dirname), TOKEN_PATH), (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(path.join(path.resolve(__dirname), TOKEN_PATH), JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
const listEvents = (auth, scrapeDate) => new Promise((resolve, reject) => {
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date(scrapeDate)).toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return reject(err);
        }

        const events = res.data.items;
        if (events.length) {
            // events.map((event, i) => {
            //     const start = event.start.dateTime || event.start.date;
            //     console.log(`${start} - ${event.summary}`);
            // });
            resolve(events);
        } else {
            console.log('No upcoming events found.');
            resolve([]);
        }
    });
});

/**
 * save important matches to google calendar
 * @param auth
 * @param matches - filtered by exist
 * @param name - league name
 * @param date - scrape date
 * @return {Promise<void>}
 */
const saveMatchesInGC = async (auth, matches, name, date) => {
    // send event to google calendar by rotation
    for (const {match, start} of matches) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (start.includes(':')) {
            await createEvents({
                auth,
                name: match,
                description: name,
                date,
                time: start,
            })
        }
    }
};

/**
 * Filter matches by already exist in google calendar
 * not insert duplicate
 * @param important
 * @param googleMatches - matches from google
 * @return {Array}
 */
const getMatchesToSave = (important, googleMatches) => {
    const matchesToSave = [];

    important.forEach((league) => {
        const { matches } = league;
        matches.forEach(match => {
            if (!googleMatches.some((l) => l.summary === match.match)) {
                matchesToSave.push(match)
            }
        })
    });

    return matchesToSave;
};

/**
 * create request template and send this to google
 * @param auth
 * @param name
 * @param description
 * @param date
 * @param time
 * @return {Promise<any>}
 */
const createEvents = ({
    auth,
    name = 'Google I/O 2019',
    description = '',
    date = '2020-02-17',
    time = '21:00:00',
}) => {
    return new Promise((resolve, reject) => {
        const calendar = google.calendar({ version: 'v3', auth });
        const dateTime = new Date(`${date} ${time}`).toISOString();

        const event = {
            summary: name,
            description: description,
            start: {
                dateTime,
                timeZone: 'Europe/Minsk'
            },
            end: {
                dateTime,
                timeZone: 'Europe/Minsk'
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 30 },
                ]
            }
        };

        calendar.events.insert({
            auth: auth,
            calendarId: 'primary',
            resource: event,
        }, function(err) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                reject(err);
            }
            console.log('Event success created', date, name);
            resolve(true);
        });
    })
};

// authorization in google
const AuthGoogle = () => new Promise((resolve, reject) => {
    // Load client secrets from a local file.
    fs.readFile(path.join(path.resolve(__dirname), 'credentials.json'), (err, content) => {
        if (err) {
            console.log('Error loading client secret file:', err);
            reject(err);
        }
        // Authorize a client with credentials, then call the Google Calendar API.
        authorize(JSON.parse(content), (auth => resolve(auth)));
    });
});

module.exports = {
    AuthGoogle,
    listEvents,
    saveMatchesInGC,
    getMatchesToSave,
};


