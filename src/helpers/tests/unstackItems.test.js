/* eslint-disable id-length*/
import Test from 'ava';
import unstackItems from '../unstackItems.js';

Test('При отсутствии стаков работает верно', t => {
    const item = {
        id: [1],
        o: 2,
        vi: [3],
        ai: [4],
        bi: [5],
        p: 6,
        ar: [7],
        f: [8],
        cp: 9,
        l: [10],
        lt: 11,
        ss: [12],
    };
    
    t.deepEqual(unstackItems(item, 730), [{
        id: [1],
        o: 2,
        vi: [3],
        ai: [4],
        bi: [5],
        p: 6,
        ar: [7],
        f: [8],
        cp: 9,
        l: [10],
        lt: 11,
        ss: [12],
        appId: 730,
    }]);
});

Test('При наличии стаков работает верно', t => {
    const item = {
        id: [1, 2],
        o: 2,
        vi: [3, 4],
        ai: [4, 5],
        bi: [5, 6],
        p: 6,
        ar: [7, 8],
        f: [8, 9],
        cp: 9,
        l: [10, 11],
        lt: 11,
        ss: [12, 13],
    };
    
    t.deepEqual(unstackItems(item, 730), [
        {
            id: [1],
            o: 2,
            vi: [3],
            ai: [4],
            bi: [5],
            p: 6,
            ar: [7],
            f: [8],
            cp: 9,
            l: [10],
            lt: 11,
            ss: [12],
            appId: 730,
        },
        {
            id: [2],
            o: 2,
            vi: [4],
            ai: [5],
            bi: [6],
            p: 6,
            ar: [8],
            f: [9],
            cp: 9,
            l: [11],
            lt: 11,
            ss: [13],
            appId: 730,
        },
    ]);
});

Test('При отсутствии полей работает верно', t => {
    const item = {
        id: [1],
        o: 2,
        p: 6,
    };
    
    t.deepEqual(unstackItems(item, 730), [{
        id: [1],
        o: 2,
        vi: null,
        ai: [1],
        bi: null,
        p: 6,
        ar: null,
        f: null,
        cp: null,
        l: null,
        lt: null,
        ss: null,
        appId: 730,
    }]);
});

Test('При наличии поля b работает верно', t => {
    const item = {
        id: [1],
        o: 2,
        b: [3],
        p: 6,
    };
    
    t.deepEqual(unstackItems(item, 730), [{
        id: [1],
        o: 2,
        vi: null,
        ai: [1],
        bi: [3],
        p: 6,
        ar: null,
        f: null,
        cp: null,
        l: null,
        lt: null,
        ss: null,
        appId: 730,
    }]);
});