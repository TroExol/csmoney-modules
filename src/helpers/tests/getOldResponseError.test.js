/* eslint-disable id-length*/
import Test from 'ava';
import getOldResponseError from '../getOldResponseError.js';

Test('Получение ошибки работает верно', t => {
    t.deepEqual(getOldResponseError('1'), {error: 1});
    t.deepEqual(getOldResponseError('1asd'), {error: undefined});
    t.deepEqual(getOldResponseError(' 1asd'), {error: undefined});
    t.deepEqual(getOldResponseError(' 1'), {error: 1});
    t.deepEqual(getOldResponseError('1 '), {error: 1});
    t.deepEqual(getOldResponseError(' 1 asd'), {error: 1});
    t.deepEqual(getOldResponseError(' 1 '), {error: 1});
    t.deepEqual(getOldResponseError(' 1asd '), {error: undefined});
    t.deepEqual(getOldResponseError(' 1 asd'), {error: 1});
    t.deepEqual(getOldResponseError(2), {error: undefined});
    t.deepEqual(getOldResponseError({}), {error: undefined});
    t.deepEqual(getOldResponseError([]), {error: undefined});
    t.deepEqual(getOldResponseError(undefined), {error: undefined});
    t.deepEqual(getOldResponseError(null), {error: undefined});
});
