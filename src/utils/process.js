const CP = require('child_process');
const os = require('os');

const getParams = () => [process.argv.slice(2).reduce((sum, cur) => {
    const [name, value] = cur.split('=');

    sum[name] = value;

    return sum;
}, {})];

const exec = cmd => new Promise((res, rej) => {
    if (os.platform() !== 'darwin') {
        throw new Error('No support for this operating system but feel free to fork the repo and add it :)');
    }

    CP.exec(cmd, (err, stdout) => {
        if (err) {
            console.error(`exec error: ${err}`);
            rej(err);
            return;
        }

        console.log(`Number of files ${stdout}`);
        res(stdout);
    });
});

module.exports = {
    getParams,
    exec,
};
