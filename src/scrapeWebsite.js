const { URL } = require('url');
const { goToPage } = require('./utils/page');

const scrapeWebsite = async ({
     browser,
     website,
     scrapeDate,
     sport,
     ...options
}) => {
    const { host } = new URL(website);
    const { getMatches } = require(`./scrapers/${host}`);

    let page = null;

    if (host.includes('flashscore')) {
        page = await goToPage(browser, website, false);
    } else {
        page = await goToPage(browser, website, false);
    }

    const allMatches = await getMatches({
        page,
        scrapeDate,
        sport,
        website,
        options
    });

    console.log(allMatches)

    await page.close();

    return allMatches;
};

module.exports = {
    scrapeWebsite,
};
