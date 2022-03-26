/**
 * Разбитие стакнутых предметов на new.cs.money
 * @param {Object} item - Предмет
 * @param {Number} appId - Id игры
 */
const unstackItems = (item, appId) => {
    const listItems = [];
    for (let index = 0; index < item.id.length; index++) {
        listItems.push({
            'id': [item.id[index]],
            'o': item.o,
            'vi': item.vi ? [item.vi[index]] : null,
            'ai': item.ai ? [item.ai[index]] : [item.id[index]],
            'bi': item.bi ? [item.bi[index]] : item.b ? [item.b[index]] : null,
            'p': item.p,
            'ar': item.ar ? [item.ar[index]] : null,
            'f': item.f ? [item.f[index]] : null,
            'cp': item.cp || null,
            'l': item.l ? [item.l[index]] : null,
            'lt': item.lt || null,
            'ss': item.ss ? [item.ss[index]] : null,
            appId,
        });
    }
    
    return listItems;
};

export default unstackItems;