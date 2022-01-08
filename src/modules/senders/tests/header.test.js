/* eslint-disable id-length*/
import Test from 'ava';
import getHeaders from '../headers.js';

Test('Заголовок формируется верно', t => {
    const header = getHeaders('cookie');
    
    t.deepEqual(header, {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/json;charset=UTF-8',
        'origin': 'https://old.cs.money',
        'referrer': 'https://old.cs.money/ru/',
        'sec-ch-ua': '"Chromium";v="94", "Google Chrome";v="94", ";Not A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4595.0 Safari/537.36',
        'x-client-app': 'web',
        'cookie': 'currency=USD;trade_locked=true;maxTradeLockDays=8;cookie',
    });
});