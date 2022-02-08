/* eslint-disable id-length*/
import Test from 'ava';
import {confirmOffersRecursively} from '../confirmOffersRecursively.js';

const console = dispatches => ({
    log: (...values) => dispatches.push(['console.log', ...values]),
});

const setTimeout = dispatches => (callback, timeout) => dispatches.push(['setTimeout', callback.toString(), timeout]);

const transactionsSuccess = response => dispatches => ({
    getPendingOfferIds: (...values) => {
        dispatches.push(['getPendingOfferIds', ...values]);
        return Promise.resolve(response);
    },
});

const transactionsError = dispatches => ({
    getPendingOfferIds: (...values) => {
        dispatches.push(['getPendingOfferIds', ...values]);
        return Promise.reject('error');
    },
});

const replyToOffer = dispatches => (...values) => {
    dispatches.push(['replyToOffer', ...values]);
};

const defaultSetting = dispatches => ({
    getAccountIds: () => {
        dispatches.push(['getAccountIds']);
        return ['key'];
    },
});

Test('Успешное подтверждение офферов', async t => {
    const dispatches = [];
    
    await confirmOffersRecursively({
        transactions: transactionsSuccess([10])(dispatches),
        replyToOffer: replyToOffer(dispatches),
        defaultSetting: defaultSetting(dispatches),
        console: console(dispatches),
        setTimeout: setTimeout(dispatches),
    })({key: 'cookie'}, {status: false, delay: 0});
    
    t.deepEqual(dispatches, [
        ['getAccountIds'],
        ['getPendingOfferIds', {key: 'cookie'}, 'key'],
        ['replyToOffer', 10, 'confirm', 'cookie'],
    ]);
});

Test('Успешное подтверждение офферов с дефолтными параметрами', async t => {
    const dispatches = [];
    
    await confirmOffersRecursively({
        transactions: transactionsSuccess([10])(dispatches),
        replyToOffer: replyToOffer(dispatches),
        defaultSetting: {
            ...defaultSetting(dispatches),
            repeatLoad: {
                confirmOffer: {status: false, delay: 0},
            }
        },
        console: console(dispatches),
        setTimeout: setTimeout(dispatches),
    })({key: 'cookie'});
    
    t.deepEqual(dispatches, [
        ['getAccountIds'],
        ['getPendingOfferIds', {key: 'cookie'}, 'key'],
        ['replyToOffer', 10, 'confirm', 'cookie'],
    ]);
});

Test('Успешное подтверждение офферов с повтором', async t => {
    const dispatches = [];
    
    await confirmOffersRecursively({
        transactions: transactionsSuccess([10])(dispatches),
        replyToOffer: replyToOffer(dispatches),
        defaultSetting: defaultSetting(dispatches),
        console: console(dispatches),
        setTimeout: setTimeout(dispatches),
    })({key: 'cookie'}, {status: true, delay: 60000});
    
    t.deepEqual(dispatches, [
        ['getAccountIds'],
        ['getPendingOfferIds', {key: 'cookie'}, 'key'],
        ['replyToOffer', 10, 'confirm', 'cookie'],
        ['setTimeout', '() => confirmOffersRecursively({defaultSetting, transactions, replyToOffer, console, setTimeout})(cookie, repeatLoad)', 60000],
    ]);
});

Test('Неуспешное подтверждение офферов', async t => {
    const dispatches = [];
    
    await confirmOffersRecursively({
        transactions: transactionsError(dispatches),
        replyToOffer: replyToOffer(dispatches),
        defaultSetting: defaultSetting(dispatches),
        console: console(dispatches),
        setTimeout: setTimeout(dispatches),
    })({key: 'cookie'}, {status: false, delay: 0});
    
    t.deepEqual(dispatches, [
        ['getAccountIds'],
        ['getPendingOfferIds', {key: 'cookie'}, 'key'],
        ['console.log', 'confirmOffers unexpected error:', 'error'],
    ]);
});