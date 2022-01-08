/* eslint-disable id-length*/
import Test from 'ava';
import {input} from '../input.js';

const process = {
    stdin: 'stdin',
    stdout: 'stdout',
};
const readline = content => dispatches => ({
    createInterface: value => {
        dispatches.push(['createInterface', value]);
        
        return {
            question: (question, callback) => {
                dispatches.push(['question', question]);
                callback.call(this, content);
            },
            close: () => dispatches.push(['close']),
        };
    },
});

Test('Чтение с корректным контентом работает верно', async t => {
    const dispatches = [];
    
    const answer = await input({
        readline: readline('ответ ')(dispatches),
        process,
    })('вопрос');
    
    dispatches.push(['answer', answer]);
    
    t.deepEqual(dispatches, [
        ['createInterface', {
            input: 'stdin',
            output: 'stdout',
        }],
        ['question', 'вопрос'],
        ['close'],
        ['answer', 'ответ'],
    ]);
});

Test('Чтение с контентом null работает верно', async t => {
    const dispatches = [];
    
    const answer = await input({
        readline: readline(null)(dispatches),
        process,
    })('вопрос');
    
    dispatches.push(['answer', answer]);
    
    t.deepEqual(dispatches, [
        ['createInterface', {
            input: 'stdin',
            output: 'stdout',
        }],
        ['question', 'вопрос'],
        ['close'],
        ['answer', null],
    ]);
});

Test('Чтение с контентом undefined работает верно', async t => {
    const dispatches = [];
    
    const answer = await input({
        readline: readline(undefined)(dispatches),
        process,
    })('вопрос');
    
    dispatches.push(['answer', answer]);
    
    t.deepEqual(dispatches, [
        ['createInterface', {
            input: 'stdin',
            output: 'stdout',
        }],
        ['question', 'вопрос'],
        ['close'],
        ['answer', null],
    ]);
});

Test('Чтение с контентом пустой строкой работает верно', async t => {
    const dispatches = [];
    
    const answer = await input({
        readline: readline('')(dispatches),
        process,
    })('вопрос');
    
    dispatches.push(['answer', answer]);
    
    t.deepEqual(dispatches, [
        ['createInterface', {
            input: 'stdin',
            output: 'stdout',
        }],
        ['question', 'вопрос'],
        ['close'],
        ['answer', null],
    ]);
});