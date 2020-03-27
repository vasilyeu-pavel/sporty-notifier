const { exec } = require('child_process');
const os = require('os');

const open = cmd => new Promise((res, rej) => {
    if (os.platform() !== 'darwin') {
        throw new Error('No support for this operating system but feel free to fork the repo and add it :)');
    }

    exec(cmd, (err, stdout) => {
        if (err) {
            console.error(`exec error: ${err}`);
            rej(err);
            return;
        }

        console.log(`Number of files ${stdout}`);
        res(stdout);
    });
});

module.exports = { open };
