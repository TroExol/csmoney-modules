
/**
 * Сортировка cookie файлов.
 * @param {Array} necessary - Массив с необходимыми cookie.
 * @param {Array | String} listCookie - Массив || Строка с файлами cookie.
 * @returns {Object}
 */
export const sortCookie = (necessary, listCookie) => {

    listCookie = Array.isArray(listCookie) ? listCookie.join(';').split(';') : listCookie.split(';');

    return necessary.reduce((processedCookie, typeCookie) => {
        for (const cookie of listCookie) {
            if (!listCookie.join('').includes(typeCookie)) {
                throw new Error(`Не хватает cookie файлов. \nОтсутствует файл: ${typeCookie}. \nСписок всех необходимых cookie: ${necessary}.`);
            }

            if (cookie.includes(typeCookie)) {
                processedCookie[typeCookie] = decodeURI(cookie.split('=')[1]);
            }
        }
        return processedCookie;
    }, {});
};
