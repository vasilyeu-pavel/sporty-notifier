const { goToPage } = require('./utils/page');

const targetLeagues = [
    // football
    'Argentina - Reserve League',
    'Denmark - Superliga',
    'Denmark - DBU Pokalen',
    'Denmark - Play-offs 1/2',
    'Norway - Eliteserien',
    'Norway - 1. Division',
    'Norway - 2. Division',
    'Norway - 3. Division',
    'Norway - NM Cupen',
    'Sweden - Allsvenskan',
    'Sweden - Superettan',
    'Sweden - Division 1',
    'Sweden - Damallsvenskan',
    'Sweden - Elitettan',
    'Sweden - Svenska Cupen',
    'Poland - Ekstraklasa',
    // hockey
    'ШВЕЦИЯ-Элитсериен',
    'ФИНЛЯНДИЯ-Местис (Вторая лига)',
    'ФИНЛЯНДИЯ-Nuorten SM-Liiga',
    'ФИНЛЯНДИЯ-Суоми-сарья (Третья лига)',
    'ГЕРМАНИЯ-ДЕЛ',
    'ФРАНЦИЯ-Магнус лига',
    'ФИНЛЯНДИЯ-Nuorten SM-Liiga - Этап победителей',
    'ФИНЛЯНДИЯ-Nuorten SM-Liiga - Понижение (плей-офф)',
];

const loadDisableRows = async page =>
    await page.evaluate(({ leagues }) =>
        // find all rows
        [...document.querySelector('.table-container').querySelectorAll('tr')]
            .filter(row => row)
            // filter on exist h3
            .filter(row => row.querySelector('h3'))
            // filter by user filters
            .filter(row => leagues.some(league => league === row.querySelector('span').innerText))
            // click on each disable rows
            .forEach(row => {
                if (!row.getAttribute('class').includes('expanded')) {
                    row.firstElementChild.click()
                }
            })
        , { leagues: targetLeagues });

const hideOpenedRows = async (page, scrapeDate, sport) =>
    await page.evaluate(({ leagues, date, sport }) =>
        // find all rows
        [...document.querySelector('.hockey').querySelectorAll('.event__header')]
            .filter(row => row)
            .map(row => {
                const collapseButton = row.querySelector('.collapse');
                if (collapseButton) {
                    collapseButton.click();
                }
                return row;
            })
            .filter(row => leagues.some(league =>
                league === `${row.querySelector('.event__title--type').innerText}-${row.querySelector('.event__title--name').innerText}`))
            .map(row => ({
                league: `${row.querySelector('.event__title--type').innerText}-${row.querySelector('.event__title--name').innerText}`,
                sport,
                date,
                matches: new Array(+row.querySelector('.event__info').innerText.split('(')[1].split(')')[0]),
            }))
        , { leagues: targetLeagues, date: scrapeDate, sport });

const getAllMatches = async (page, scrapeDate, sport) =>
    await page.evaluate(({ leagues, date, sport }) =>
        [...document.querySelector('.table-container').querySelectorAll('tr')]
            .filter(row => row)
            // filter on exist h3
            .filter(row => row.querySelector('h3'))
            // filter by user filters
            .filter(row => leagues.some(league => league === row.querySelector('span').innerText))
            .map(row => {
                const leagueResult = {
                    league: row.querySelector('span').innerText.replace(/ /g, ''),
                    date,
                    sport,
                    matches: [],
                };
                let startEl = row.nextElementSibling;

                while (!startEl.getAttribute('class').includes('group-head')) {
                    if (!startEl.getAttribute('class').includes('round-head')) {
                        if (startEl.querySelector('.team-a') && startEl.querySelector('.team-b')) {
                            leagueResult.matches.push({
                                match: `${startEl.querySelector('.team-a').innerText}-${startEl.querySelector('.team-b').innerText}`.replace(/ /g, ''),
                            });
                        }
                    }

                    startEl = startEl.nextElementSibling;
                }
                return leagueResult;
            }), { leagues: targetLeagues, date: scrapeDate, sport });

const scrapeWebsite = async (browser, website, scrapeDate, sport) => {
    if (website.includes('myscore')) {
        const page = await goToPage(browser, website, false);
        const allMatches = await hideOpenedRows(page, scrapeDate, sport);

        await page.close();

        return allMatches;
    } else {
        const page = await goToPage(browser, website, true);
        await loadDisableRows(page);

        await page.waitFor(1000);

        const allMatches = await getAllMatches(page, scrapeDate, sport);

        await page.close();

        return allMatches;
    }
};

module.exports = {
    scrapeWebsite,
};
