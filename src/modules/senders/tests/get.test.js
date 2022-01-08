/* eslint-disable id-length*/
import Test from 'ava';
import {get} from '../get.js';

const getHeaders = dispatches => value => {
    dispatches.push(['getHeaders', value]);
    return value;
};

const console = dispatches => ({
    log: value => dispatches.push(['console.log', value]),
});

const axiosSuccess = response => dispatches => ({
    get: (...values) => {
        dispatches.push(['axios.get', ...values]);
        return Promise.resolve(response);
    },
});

const axiosError = response => dispatches => ({
    get: (...values) => {
        dispatches.push(['axios.get', ...values]);
        return Promise.reject(response);
    },
});

Test('Успешная отправка get запроса', async t => {
    const dispatches = [];
    
    const response = await get({
        axios: axiosSuccess({data: 'data'})(dispatches),
        getHeaders: getHeaders(dispatches),
        console: console(dispatches),
    })('path', {param: 'param'}, 'cookie');
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['getHeaders', 'cookie'],
        ['axios.get', 'path', {
            params: {
                param: 'param',
            },
            headers: 'cookie',
        }],
        ['response', 'data'],
    ]);
});

Test('Успешная отправка get запроса с ошибкой старых куки', async t => {
    const dispatches = [];
    
    const response = await get({
        axios: axiosSuccess({data: {error: 6}})(dispatches),
        getHeaders: getHeaders(dispatches),
        console: console(dispatches),
    })('path', {param: 'param'}, 'cookie');
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['getHeaders', 'cookie'],
        ['axios.get', 'path', {
            params: {
                param: 'param',
            },
            headers: 'cookie',
        }],
        ['console.log', 'Необходимо поменять куки cs.money'],
        ['response', {error: 6}],
    ]);
});

Test('Успешная отправка get запроса без params и cookie', async t => {
    const dispatches = [];
    
    const response = await get({
        axios: axiosSuccess({data: 'data'})(dispatches),
        getHeaders: getHeaders(dispatches),
        console: console(dispatches),
    })('path');
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['getHeaders', null],
        ['axios.get', 'path', {
            params: null,
            headers: null,
        }],
        ['response', 'data'],
    ]);
});

Test('Неуспешная отправка get запроса без error', async t => {
    const dispatches = [];
    
    const response = await get({
        axios: axiosError(null)(dispatches),
        getHeaders: getHeaders(dispatches),
        console: console(dispatches),
    })('path');
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['getHeaders', null],
        ['axios.get', 'path', {
            params: null,
            headers: null,
        }],
        ['response', undefined],
    ]);
});

Test('Неуспешная отправка get запроса без error.response', async t => {
    const dispatches = [];
    
    const response = await get({
        axios: axiosError({response: null})(dispatches),
        getHeaders: getHeaders(dispatches),
        console: console(dispatches),
    })('path');
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['getHeaders', null],
        ['axios.get', 'path', {
            params: null,
            headers: null,
        }],
        ['response', undefined],
    ]);
});

Test('Неуспешная отправка get запроса с error.response.data', async t => {
    const dispatches = [];
    
    const response = await get({
        axios: axiosError({response: {data: 'data'}})(dispatches),
        getHeaders: getHeaders(dispatches),
        console: console(dispatches),
    })('path');
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['getHeaders', null],
        ['axios.get', 'path', {
            params: null,
            headers: null,
        }],
        ['response', 'data'],
    ]);
});