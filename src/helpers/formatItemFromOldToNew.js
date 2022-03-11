import {itemNames} from '../modules/dataLoader/index.js';

/**
 * Перевод предмета из старого формата в новый
 * @param {Number} appId - Id игры
 * @param {{id: number[], o: number, vi: (0|1)[], cp: number?, p: number}} item - Предмет в старом формате
 * @returns {{price: number, appId: number, nameId: number, fullName: string, id: number, isVirtual: boolean}}
 */
const formatItemFromOldToNew = (appId, item) => ({
    id: item.id[0],
    nameId: item.o,
    appId,
    isVirtual: item.vi?.[0] || false,
    price: item.cp || item.p,
    fullName: itemNames.get(appId, item.o),
});

export default formatItemFromOldToNew;