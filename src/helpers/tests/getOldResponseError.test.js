/* eslint-disable id-length*/
import Test from 'ava';
import getOldResponseError from '../getOldResponseError.js';

Test('Получение ошибки работает верно', t => {
    t.is(getOldResponseError('1'), 1);
    t.is(getOldResponseError('1asd'), undefined);
    t.is(getOldResponseError(' 1asd'), undefined);
    t.is(getOldResponseError(' 1'), 1);
    t.is(getOldResponseError('1 '), 1);
    t.is(getOldResponseError(' 1 asd'), 1);
    t.is(getOldResponseError(' 1 '), 1);
    t.is(getOldResponseError(' 1asd '), undefined);
    t.is(getOldResponseError(' 1 asd'), 1);
    t.is(getOldResponseError(2), undefined);
    t.is(getOldResponseError({}), undefined);
    t.is(getOldResponseError([]), undefined);
    t.is(getOldResponseError(undefined), undefined);
    t.is(getOldResponseError(null), undefined);
});
