const { getSelectors } = require('../../data/selectors');
const targetLeagues = require('../../data/leagues.json');
const { helpers, withToString, withParsingConstructor } = require('../../utils/document');

const loadDisableRows = async (page, selectors) =>
    await page.evaluate(({ leagues, selectors }) => {
            const {
                container,
                rowSelector,
                open,
                title: {
                    type,
                    name,
                }
            } = JSON.parse(selectors);

            // find all rows
            return [...document.querySelector(container).querySelectorAll(rowSelector)]
                .filter(Boolean)
                // filter on exist h3
                .filter(row => row.querySelector(name))
                // filter by user filters
                .filter(row => leagues.some(({name}) => name === row.querySelector(type).innerText))
                // click on each disable rows
                .map(row => ![...row.classList].includes(open) && row.firstElementChild.click())
        },
        // vars to eval
        {
            leagues: targetLeagues,
            selectors: JSON.stringify(selectors)
        });

/**
 * func call only soccerway website
 * @param page <Puppeteer page>
 * @param scrapeDate <string> value
 * @param sport <string>
 * @return {Promise<*>}
 * [
 *  {
        "league": "Sweden-SvenskaCupen",
        "date": "2020-02-15",
        "sport": "football",
        "matches": [
            {
                "match": "MalmöFF-Syrianska",
                "start": "18:00"
            }
        ]
    }
 ]
 */
const getMatches = async ({ page, scrapeDate, sport, website, options }) => {
    const selectors = getSelectors(website);

    await loadDisableRows(page, selectors);

    await page.waitFor(1000);

    return await page.evaluate(({ leagues, date, sport, selectors, options, functions, website }) => {
            const {
                container,
                rowSelector,
                filter: {
                    rowFilter,
                    matchFilter,
                },
                match: {
                    away,
                    home,
                    time,
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
                filterByLeague,
                getTextSelector,
                findRowWithMatches,
            } = API;

            // using in findRowWithMatches
            const validate = (startEl) => startEl.querySelector(home) && startEl.querySelector(away);
            const getMatchStartTime = el => `${el.querySelector(time).innerText.replace(/ /g, '')}`;

            return [...document.querySelector(container).querySelectorAll(rowSelector)]
                .filter(Boolean)
                // filter on exist h3
                .filter(row => row.querySelector(name))
                // filter by user filters
                .filter(row => filterByLeague(row, leagues, type))
                .map(row => ({
                    // for get options from websites list
                    ...options,
                    // for get options from leagues list
                    ...leagues.find(({ name }) => name.replace(/ /g, '') === getTextSelector(row, type)),
                    league: getTextSelector(row, type),
                    date,
                    sport,
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
            website,
            functions: JSON.stringify(withParsingConstructor(helpers)),
        })
};

module.exports = { getMatches };
