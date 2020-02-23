const { getSelectors } = require('../../data/selectors');
const targetLeagues = require('../../data/leagues.json');
const { helpers, withParsingConstructor } = require('../../utils/document');

/**
 * get all matches from myscore
 * @param page <Puppeteer page>
 * @param scrapeDate <string> value
 * @param sport <string>
 * @return {Promise<*>}
 * [
 * {
                "league": "ФИНЛЯНДИЯ-Суоми-сарья (Третья лига) - Этап победителей",
                "sport": "hockey",
                "date": "2020-02-15",
                "matches": [
                    {
                        "match": "ЙХТ-Джайентс",
                        "start": "17:00"
                    },
                    {
                        "match": "РаахеК-ФПС",
                        "start": "17:00"
                    },
                ]
            }
 * ]
 */
const getMatches = async ({ page, scrapeDate, sport, website, options }) => {
    const selectors = getSelectors(website);

    return await page.evaluate(async ({ leagues, date, sport, selectors, options, functions, website }) => {
            const {
                rowSelector,
                hide,
                open,
                filter: {
                    rowFilter,
                    matchFilter,
                },
                match: {
                    away,
                    home,
                    time,
                    status,
                },
                title: {
                    type,
                    name,
                }
            } = JSON.parse(selectors);

            const API = Object.entries(JSON.parse(functions)).reduce((res, cur) => {
                const name = cur[0];
                const { body, arg } = cur[1];
                res[name] = new Function(...arg, body);

                return res;
            }, {});

            const {
                getTextSelector,
                findRowWithMatches,
            } = API;

            const handleClick = selector => row => {
                const collapseButton = row.querySelector(selector);
                if (collapseButton) collapseButton.click();

                return row;
            };

            // using in findRowWithMatches
            const validate = el => (el.querySelector(home)
                && el.querySelector(away)
                && (el.querySelector(time)
                    || el.querySelector(status)
                ));
            const getMatchStartTime = el => `${el.querySelector(time) ? el.querySelector(time).innerText
                // "19:30\nTKP"
                    .split('\n')[0]
                : 'начался'
                }`.replace(/ /g, ''); // "19 : 30"

            const getLeagueName = row => `${getTextSelector(row, type)}-${getTextSelector(row, name)}`;

            // find all rows
            return [...document.querySelector(`.${sport}`).querySelectorAll(rowSelector)]
                .filter(Boolean)
                // hide all
                .map(handleClick(hide))
                // filter by current leagues
                .filter(row => leagues.some(({name: league}) => league === getLeagueName(row)))
                // open only current leagues
                .map(handleClick(open))
                // get matches
                .map(row => ({
                    ...options,
                    // for get options from leagues list
                    ...leagues.find(({ name }) => name.replace(/ /g, '') === getLeagueName(row).trim()),
                    league: getLeagueName(row),
                    sport,
                    date,
                    matches: findRowWithMatches(row, website, matchFilter, home, away, getMatchStartTime, validate, rowFilter),
                }))
        },
        // vars to eval
        {
            leagues: targetLeagues,
            date: scrapeDate,
            sport,
            selectors: JSON.stringify(selectors),
            options,
            functions: JSON.stringify(withParsingConstructor(helpers)),
            website,
        }
    );
};


module.exports = { getMatches };
