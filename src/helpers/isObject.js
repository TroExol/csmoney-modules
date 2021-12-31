/**
 * Является ли переменная объектом
 * @param {any} value - Значение
 * @returns {boolean}
 */
const isObject = value => typeof value === 'object' &&
    !Array.isArray(value) &&
    value !== null;

export default isObject;