const withToString = (obj) => {
    if (!obj || !Object.keys(obj).length) return;

    const temp = {};

    for (const key in obj) {
        temp[key] = obj[key].toString()
    }

    return temp;
};

const withFunctions = (obj = helpers) => {
    if (!obj || !Object.keys(obj).length) return;

    const temp = {};

    for (const key in obj) {
        const f = obj[key].toString();

        temp[key] = {
            arg: f.toString().split('(')[1].split(')')[0].split(','),
            body: f.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1],
        };
    }

    return (toString = false) => {
      if (!toString) return temp;

      return JSON.stringify(temp);
    };
};

// this func call in browser context
// and undeclared vars will gets from global browser context
let helpers = {
    test: function(a, b) {
      console.log(a + b)
    },
    getElementBySelector: function(selector) {
        return (element) =>
            element.querySelector(selector);
    },
    getMatchName: function(home, away) {
        return `${home}-${away}`.replace(/ /g, '');
    },
    getMatchStartTime: function (el) {
        return `${el.querySelector(time).innerText.replace(/ /g, '')}`;
    },
    getTextSelector: function (element, selector) {
        return element.querySelector(selector).innerText.replace(/ /g, '');
    },
    filterByLeague: function (leagues, type) {
        return (element) =>
            leagues.some(({ name: league }) => league === element.querySelector(type).innerText);
    },
    getLeagueBySelector: function(leagues, row, type) {
        return leagues.find(({ name }) => name.replace(/ /g, '') === row.querySelector(type).innerText.replace(/ /g, ''))
    },
    // func: validate && getMatchStartTime was declared in page.evaluate()
    findRowWithMatches: function (row, website, selectors, getMatchStartTime, validate) {
        const {
            filter: {
                rowFilter,
                matchFilter,
            },
            match: {
                away,
                home,
            },
        } = JSON.parse(selectors);

        let startEl = row.nextElementSibling;
        const getHomeName = (startEl, home) => startEl.querySelector(home).innerText;
        const getAwayName = (startEl, away) => startEl.querySelector(away).innerText;
        const getMatchName = (home, away) => `${home}-${away}`.replace(/ /g, '');

        const validateRow = (startEl) => (website.includes('soccerway') && ![...startEl.classList].includes(matchFilter)) ||
            (website.includes('flashscore') && [...startEl.classList].includes(matchFilter));

        const matches = [];

        while (startEl && ![...startEl.classList].includes(rowFilter)) {
            if (validateRow(startEl)) {
                if (!validate(startEl)) break;

                const homeName = getHomeName(startEl, home);
                const awayName = getAwayName(startEl, away);

                matches.push({
                    match: getMatchName(homeName, awayName),
                    start: getMatchStartTime(startEl),
                });
            }

            startEl = startEl.nextElementSibling;
        }

        return matches;
    },
};

module.exports = {
    helpers,
    withFunctions,
};
