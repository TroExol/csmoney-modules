/* eslint-disable id-length*/
import Test from 'ava';
import {post} from '../post.js';

const getHeaders = dispatches => value => {
    dispatches.push(['getHeaders', value]);
    return value;
};

const console = dispatches => ({
    log: value => dispatches.push(['console.log', value]),
});

const axiosSuccess = response => dispatches => ({
    post: (...values) => {
        dispatches.push(['axios.post', ...values]);
        return Promise.resolve(response);
    },
});

const axiosError = response => dispatches => ({
    post: (...values) => {
        dispatches.push(['axios.post', ...values]);
        return Promise.reject(response);
    },
});

Test('Успешная отправка post запроса', async t => {
    const dispatches = [];
    
    const response = await post({
        axios: axiosSuccess({data: 'data'})(dispatches),
        getHeaders: getHeaders(dispatches),
        console: console(dispatches),
    })('path', {param: 'param'}, 'cookie');
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['getHeaders', 'cookie'],
        ['axios.post', 'path', {param: 'param'}, {headers: 'cookie'}],
        ['response', 'data'],
    ]);
});

Test('Успешная отправка post запроса с ошибкой старых куки', async t => {
    const dispatches = [];
    
    const response = await post({
        axios: axiosSuccess({data: {error: 6}})(dispatches),
        getHeaders: getHeaders(dispatches),
        console: console(dispatches),
    })('path', {param: 'param'}, 'cookie');
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['getHeaders', 'cookie'],
        ['axios.post', 'path', {param: 'param'}, {headers: 'cookie'}],
        ['console.log', 'Необходимо поменять куки cs.money'],
        ['response', {error: 6}],
    ]);
});

Test('Успешная отправка post запроса без params и cookie', async t => {
    const dispatches = [];
    
    const response = await post({
        axios: axiosSuccess({data: 'data'})(dispatches),
        getHeaders: getHeaders(dispatches),
        console: console(dispatches),
    })('path');
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['getHeaders', null],
        ['axios.post', 'path', null, {headers: null}],
        ['response', 'data'],
    ]);
});

Test('Неуспешная отправка post запроса без error', async t => {
    const dispatches = [];
    
    const response = await post({
        axios: axiosError(null)(dispatches),
        getHeaders: getHeaders(dispatches),
        console: console(dispatches),
    })('path');
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['getHeaders', null],
        ['axios.post', 'path', null, {headers: null}],
        ['response', undefined],
    ]);
});

Test('Неуспешная отправка post запроса без error.response', async t => {
    const dispatches = [];
    
    const response = await post({
        axios: axiosError({response: null})(dispatches),
        getHeaders: getHeaders(dispatches),
        console: console(dispatches),
    })('path');
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['getHeaders', null],
        ['axios.post', 'path', null, {headers: null}],
        ['response', undefined],
    ]);
});

Test('Неуспешная отправка post запроса с error.response.data', async t => {
    const dispatches = [];
    
    const response = await post({
        axios: axiosError({response: {data: 'data'}})(dispatches),
        getHeaders: getHeaders(dispatches),
        console: console(dispatches),
    })('path');
    
    dispatches.push(['response', response]);
    
    t.deepEqual(dispatches, [
        ['getHeaders', null],
        ['axios.post', 'path', null, {headers: null}],
        ['response', 'data'],
    ]);
});