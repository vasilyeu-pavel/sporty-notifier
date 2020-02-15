const { URL } = require('url');

const selectors = {
    "myscore.com.ua": {
        rowSelector: '.event__header',
        filter: {
            rowFilter: 'event__header',
            matchFilter: 'event__match'
        },
        match: {
            away: '.event__participant--away',
            home: '.event__participant--home',
            time: '.event__time',
            status: '.event__stage--block',
        },
        title: {
            type: '.event__title--type',
            name: '.event__title--name',
        },
        hide: '.collapse',
        open: '.expand',
    },
    'soccerway.com': {
        container: '.table-container',
        rowSelector: 'tr',
        filter: {
            rowFilter: 'group-head',
            matchFilter: 'round-head'
        },
        match: {
            away: '.team-b',
            home: '.team-a',
            time: '.score-time',
        },
        title: {
            type: 'span',
            name: 'h3',
        },
        open: 'expanded',
    }
};

const getSelectors = (website) => {
    const { host } = new URL(website);

    return selectors[host];
};

module.exports = { getSelectors };
