const { isMainThread, workerData, parentPort } = require('worker_threads');

const terminalTab = require('./openTab');

const runner = async () => {
    if (!isMainThread) {
        // { website: 'https://myscore.com.ua/hockey/', sport: 'hockey' }
        const {
            website,
            sport,
        } = workerData;

        const cmd = `cd ../sporty-notifier/src && node index.js website=${website} sport=${sport}`;

        await terminalTab.open(cmd);

        parentPort.postMessage(workerData);
    }
};

runner();
