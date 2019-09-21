const goToPage = async (browser, link, isBlockedScripts = false) => {
    const blockedResourceTypes = [
        'image',
        'media',
        'font',
        'texttrack',
        'object',
        'beacon',
        'csp_report',
        'imageset',
        'stylesheet',
    ];

    const skippedResources = [
        'quantserve',
        'adzerk',
        'doubleclick',
        'adition',
        'exelator',
        'sharethrough',
        'cdn.api.twitter',
        'google-analytics',
        'googletagmanager',
        'fontawesome',
        'facebook',
        'analytics',
        'optimizely',
        'clicktale',
        'mixpanel',
        'zedo',
        'clicksor',
        'tiqcdn',
        '.png',
        'jquery',
    ];

    const page = await browser.newPage();

    if (isBlockedScripts) {
        await page.setRequestInterception(true);

        page.on('request', (request) => {
            if (
                blockedResourceTypes.indexOf(request.resourceType()) !== -1
                || skippedResources.some(resource => request.url().includes(resource))
            ) {
                request.abort();
            } else {
                request.continue();
            }
        });
    }

    await page.goto(link, { timeout: 0, waitUntil: 'networkidle2' });

    await page.waitFor(100);

    return page;
};

const getInnerTextBySelector = async (page, selectorName) => {
    if (!page) return;

    return await page.evaluate(({ selector }) => document.querySelector(selector).innerText, { selector: selectorName });
};

const getAttributeBySelector = async (page, selectorName, attributeName) => {
    if (!page) return;

    return await page.evaluate(({ selector, attribute }) => {
        const element = document.querySelector(selector);
        if (!element) return;

        return element.getAttribute(attribute);
    }, { selector: selectorName, attribute: attributeName });
};

module.exports = {
    getAttributeBySelector,
    getInnerTextBySelector,
    goToPage,
};
