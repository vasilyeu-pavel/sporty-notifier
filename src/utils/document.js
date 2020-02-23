const withToString = (obj) => {
    if (!obj || !Object.keys(obj).length) return;

    const temp = {};

    for (const key in obj) {
        temp[key] = obj[key].toString()
    }

    return temp;
};

// this func call in browser context
// and undeclared vars will gets from global browser context
const helpers = {
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
        console.log(row, leagues, type)
        return leagues.some(({ name: league }) => league === row.querySelector(type).innerText);
    },
    // func: validate && getMatchStartTime was declared in page.evaluate()
    findRowWithMatches: function (row, website) {
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
};
