const getParams = () => [process.argv.slice(2).reduce((sum, cur) => {
    const [name, value] = cur.split('=');

    sum[name] = value;

    return sum;
}, {})];

module.exports = {
    getParams
};
