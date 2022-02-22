import axios from 'axios';
import {isObject, getOldResponseError} from '../../helpers/index.js';
import {getCookies} from '../getCookies/index.js';
import getHeaders from './headers.js';

export const post = ({
    axios,
    getHeaders,
    console,
}) =>
    /**
     * POST запрос
     * @param {string} path - Ссылка для запроса
     * @param {Object || null} params - Параметры запроса
     * @param {string || null} cookie - Куки
     * @returns {Promise<any>} - Результат запроса
     */
    async (path, params = null, cookie = null) => {
        try {
            if (isObject(cookie)) {
                cookie = getCookies.getStrCookie(cookie);
            }

            const {data} = await axios.post(path, params, {
                headers: getHeaders(cookie),
            });
            
            const {error} = isObject(data) ? data : getOldResponseError(data);

            if (error && (error === 6 || error === 19)) {
                await getCookies.load();
                console.log('Файлы cookie были обновлены');
            }
            
            return data;
        } catch (error) {
            return error?.response?.data;
        }
    };

export default post({
    axios,
    getHeaders,
    console,
});