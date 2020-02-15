const { getSelectors } = require('../../data/selectors');
const targetLeagues = require('../../data/leagues.json');

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

    return await page.evaluate(({ leagues, date, sport, selectors, options }) => {
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

            const validationRow = el => (el.querySelector(home)
                && el.querySelector(away)
                && (el.querySelector(time)
                    || el.querySelector(status)
                ));

            const handleClick = selector => row => {
                const collapseButton = row.querySelector(selector);
                if (collapseButton) collapseButton.click();

                return row;
            };

            const getLeagueName = row => `${row.querySelector(type).innerText}-${row.querySelector(name).innerText}`;

            const getMatchName = ({ home, away }) => `${home}-${away}`.replace(/ /g, '');

            const getMatchStartTime = el => `${el.querySelector(time) ? el.querySelector(time).innerText
                // "19:30\nTKP"
                    .split('\n')[0]
                : 'начался'
                }`.replace(/ /g, ''); // "19 : 30"

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
                .map(row => {
                    const leagueResult = {
                        // for get options from websites list
                        ...options,
                        // for get options from leagues list
                        ...leagues.find(({ name }) => name === getLeagueName(row)),
                        league: `${getLeagueName(row)}`,
                        sport,
                        date,
                        matches: []
                    };

                    // save in closes next row
                    let startEl = row.nextElementSibling;

                    // iterable till not will meet row with event__header class
                    while (startEl && ![...startEl.classList].includes(rowFilter)) {
                        if ([...startEl.classList].includes(matchFilter)) {
                            if (!validationRow(startEl)) return;

                            leagueResult.matches.push({
                                match: getMatchName({
                                    home: startEl.querySelector(home).innerText,
                                    away: startEl.querySelector(away).innerText
                                }),
                                start: getMatchStartTime(startEl),
                            });
                        }

                        startEl = startEl.nextElementSibling;
                    }

                    return leagueResult;
                })
        },
        // vars to eval
        {
            leagues: targetLeagues,
            date: scrapeDate,
            sport,
            selectors: JSON.stringify(selectors),
            options,
        }
    );
};


module.exports = { getMatches };
