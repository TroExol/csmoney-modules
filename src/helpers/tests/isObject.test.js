/* eslint-disable id-length*/
import Test from 'ava';
import isObject from '../isObject.js';

Test('Проверка на объект выполняется верно', t => {
    t.true(isObject({}));
    t.true(isObject({data: 'data'}));
    
    t.false(isObject(5));
    t.false(isObject(5.1));
    t.false(isObject(0));
    t.false(isObject(5123n));
    t.false(isObject([]));
    t.false(isObject([1, 2]));
    t.false(isObject('123'));
    t.false(isObject(''));
    t.false(isObject(false));
    t.false(isObject(true));
    t.false(isObject(null));
    t.false(isObject(undefined));
    t.false(isObject(Symbol()));
    t.false(isObject(() => {}));
});
