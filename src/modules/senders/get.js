import axios from 'axios';
import getHeaders from './headers.js';
import {isObject, getOldResponseError} from '../../helpers/index.js';
import {getCookies} from '../getCookies/index.js';

export const get = ({
    axios,
    getHeaders
}) =>
    /**
     * GET запрос.
     * @param {String} path - Ссылка для запроса.
     * @param {Object | null} params - Параметры запроса.
     * @param {String | Object | null} cookie - Может быть строкой файлов куки. Или объектом с параметрами для получения нужных куки для указанного аккаунта.
     * @param {String | Number} [cookie.accountId] - Id аккаeнта для которого требуются cookie.
     * @param {true} [cookie.oldCsm] - 
     *  @param {true} [cookie.newCsm] - 
     * @returns {Promise<any>} - Результат запроса.
     */
    async (path, params = null, cookie = null) => {
        try {

            if (isObject(cookie)) {
                cookie = getCookies.getStrCookie(cookie);
            }

            const {data} = await axios.get(path, {
                params,
                headers: getHeaders(cookie),
            });
            
            const {error} = isObject(data) ? data : getOldResponseError(data);

            if (error && (error === 6 || error === 19)) {
                const workСookie = await getCookies.checkCookie({accountId: cookie.accountId});
                if (!workСookie) {
                    return await get(path, params, cookie);
                }
            }
            
            return data;
        } catch (error) {
            return error?.response?.data;
        }
    };


export default get({
    axios,
    getHeaders,
    console,
});
