const { getSelectors } = require('../../data/selectors');
const targetLeagues = require('../../data/leagues.json');
const { withFunctions } = require('../../utils/document');

const functions = withFunctions()(true);

const loadDisableRows = async (page, selectors) =>
    await page.evaluate(({ leagues, selectors, functions }) => {
            const {
                container,
                rowSelector,
                open,
                title: {
                    type,
                    name,
                }
            } = JSON.parse(selectors);

            // deserialize function
            const {
                // function from helpers
                filterByLeague,
                getElementBySelector,
            } = Object.entries(JSON.parse(functions)).reduce((res, cur) => {
                const name = cur[0];
                const { body, arg } = cur[1];
                res[name] = new Function(...arg, body);

                return res;
            }, {});

            // find all rows
            return [...document.querySelector(container).querySelectorAll(rowSelector)]
                .filter(Boolean)
                // filter on exist h3
                .filter(getElementBySelector(name))
                // filter by user filters
                .filter(filterByLeague(leagues, type))
                // click on each disable rows
                .map(row => ![...row.classList].includes(open) && row.firstElementChild.click())
        },
        // vars to eval
        {
            leagues: targetLeagues,
            selectors: JSON.stringify(selectors),
            functions,
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

            // deserialize function
            const {
                // function from helpers
                filterByLeague,
                getTextSelector,
                findRowWithMatches,
                getLeagueBySelector,
                getElementBySelector,
            } = Object.entries(JSON.parse(functions)).reduce((res, cur) => {
                const name = cur[0];
                const { body, arg } = cur[1];
                res[name] = new Function(...arg, body);

                return res;
            }, {});

            // using in findRowWithMatches
            const validate = (el) => getElementBySelector(home)(el) && getElementBySelector(away)(el);
            const getMatchStartTime = el => `${getElementBySelector(time)(el).innerText.replace(/ /g, '')}`;

            return [...getElementBySelector(container)(document).querySelectorAll(rowSelector)]
                .filter(Boolean)
                // filter on exist h3
                .filter(getElementBySelector(name))
                // filter by user filters
                .filter(filterByLeague(leagues, type))
                .map(row => ({
                    // for get options from websites list
                    ...options,
                    // for get options from leagues list
                    ...getLeagueBySelector(leagues, row, type),
                    league: getTextSelector(row, type),
                    date,
                    sport,
                    matches: findRowWithMatches(row, website, selectors, getMatchStartTime, validate),
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
            functions,
        })
};

module.exports = { getMatches };
