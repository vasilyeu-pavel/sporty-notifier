const { scraper } = require('./src');

// exports.soccerwayParser = function soccerwayParser(req, res) {
//     scraper()
//         .then((result) => res.json(result))
//         .catch(e => {
//             console.error(e);
//             res.end();
//         })
// };

scraper();

