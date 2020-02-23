const withToString = (obj) => {
    if (!obj || !Object.keys(obj).length) return;

    const temp = {};

    for (const key in obj) {
        temp[key] = obj[key].toString()
    }

    return temp;
};

const withParsingConstructor = (obj) => {
    if (!obj || !Object.keys(obj).length) return;

    const temp = {};

    for (const key in obj) {
        const f = obj[key].toString();

        temp[key] = {
            arg: f.toString().split('(')[1].split(')')[0].split(','),
            body: f.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1],
        };
    }

    return temp;
};

// this func call in browser context
// and undeclared vars will gets from global browser context
let helpers = {
    test: function(a, b) {
      console.log(a + b)
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
    filterByLeague: function (row, leagues, type) {
        return leagues.some(({ name: league }) => league === row.querySelector(type).innerText);
    },
    // func: validate && getMatchStartTime was declared in page.evaluate()
    findRowWithMatches: function (row, website, matchFilter, home, away, getMatchStartTime, validate, rowFilter) {
        let startEl = row.nextElementSibling;
        const getHomeName = (startEl, home) => startEl.querySelector(home).innerText;
        const getAwayName = (startEl, away) => startEl.querySelector(away).innerText;
        const getMatchName = (home, away) => `${home}-${away}`.replace(/ /g, '');

        const validateRow = (startEl) => (website.includes('soccerway') && ![...startEl.classList].includes(matchFilter)) ||
            (website.includes('myscore') && [...startEl.classList].includes(matchFilter));

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
    withToString,
    withParsingConstructor,
};
