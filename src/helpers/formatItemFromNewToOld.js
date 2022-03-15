/* eslint-disable id-length */
/**
 * Перевод предмета из старого формата в новый
 * @param {Number} appId - Id игры
 * @param {{id: number, nameId: number, isVirtual: boolean, price: number}} item - Предмет в старом формате
 * @returns {{id: number[], appId: number, o: number, vi: (0|1)[], p: number}}
 */
const formatItemFromNewToOld = (appId, item) => ({
    id: [item.id],
    o: item.nameId,
    appId,
    vi: [Number(item.isVirtual || false)],
    p: item.price,
});

export default formatItemFromNewToOld;