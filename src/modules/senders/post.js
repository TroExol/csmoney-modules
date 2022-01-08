import axios from 'axios';
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
            const {data} = await axios.post(path, params, {
                headers: getHeaders(cookie),
            });
            
            if (data.error === 6) {
                console.log('Необходимо поменять куки cs.money');
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