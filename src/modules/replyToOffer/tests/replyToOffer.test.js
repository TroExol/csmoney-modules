/* eslint-disable id-length*/
import Test from 'ava';
import {replyToOffer} from '../replyToOffer.js';

const postSuccess = response => dispatches => (...values) => {
    dispatches.push(['post', ...values]);
    return Promise.resolve(response);
};

const postError = dispatches => (...values) => {
    dispatches.push(['post', ...values]);
    return Promise.reject('error');
};

Test('Успешный ответ на оффер', async t => {
    const dispatches = [];
    
    const responseReply = await replyToOffer({
        post: postSuccess({status: true})(dispatches),
    })(1, 'confirm', 'cookie');
    
    t.deepEqual(dispatches, [
        ['post', 'https://cs.money/confirm_virtual_offer', {
            action: 'confirm',
            offer_id: '1',
        }, 'cookie'],
    ]);
    t.truthy(responseReply);
});

Test('Успешный ответ на оффер без успешного статуса', async t => {
    const dispatches = [];
    
    const responseReply = await replyToOffer({
        post: postSuccess({status: false})(dispatches),
    })(1, 'confirm', 'cookie');
    
    t.deepEqual(dispatches, [
        ['post', 'https://cs.money/confirm_virtual_offer', {
            action: 'confirm',
            offer_id: '1',
        }, 'cookie'],
    ]);
    t.falsy(responseReply);
});

Test('Неуспешный ответ на оффер', async t => {
    const dispatches = [];
    
    const responseReply = await replyToOffer({
        post: postError(dispatches),
    })(1, 'confirm', 'cookie');
    
    t.deepEqual(dispatches, [
        ['post', 'https://cs.money/confirm_virtual_offer', {
            action: 'confirm',
            offer_id: '1',
        }, 'cookie'],
    ]);
    t.falsy(responseReply);
});