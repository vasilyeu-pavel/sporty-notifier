const { Worker } = require('worker_threads');
const { getFullDate } = require('./src/utils/formatDate');
const { getWebsite } = require('./src/data/websites');
const { getParams, exec } = require('./src/utils/process');

// реализация: каждый парсер в отдельном потоке
const runService = (workerData) =>
    new Promise((resolve, reject) => {
        const worker = new Worker('./src/utils/workerController.js', { workerData });

        worker.on('message', resolve);
        worker.on('error', reject);

        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    });

const run = () => {
    const [params] = getParams();

    const date = new Date();

    const fullDate = getFullDate(date);
    const websites = getWebsite(fullDate('/'));

    if (!Object.keys(params).length) {
        return Promise.all(websites
            .map((website) =>
                runService(website))
        );
    } else {
        const cmd = `cd ./src && node index.js full=full`;

        return exec(cmd);
    }
};

console.time('performance scraping');
run()
    .then(() => console.timeEnd('performance scraping'))
    .catch(err => console.error(err));
