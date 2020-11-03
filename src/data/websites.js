const getWebsite = date => ([
        {
            website: `https://soccerway.com/matches/${date}/`,
            sport: 'football',
        },
        {
            website: 'https://flashscore.ru/hockey/',
            sport: 'hockey'
        },
        // {
        //     website: 'https://myscore.com.ua/basketball/',
        //     sport: 'basketball'
        // }
    ]);

module.exports = { getWebsite };
