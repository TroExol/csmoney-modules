import SteamTotp from 'steam-totp';
import {generateBoundary, formDataBody} from './createBody.js';

/**
 * Получаем Steam Guard для входа в стим.
 * @param {Object} cfg - Объект с данными Steam аккаунта.
 * @param {String} accountName - Логин от Steam аккаунта.
 * @param {String} password - Пароль от Steam аккаунта.
 * @param {String} twoFactorCode - Код для генирации кода для входа в аккаунт. (Можно взять в папке maFiles в SDA)
 * @param {boolean} [disableMobile] - Нужна для получения всех куки.
 * @returns {{accountName: String, password: String, twoFactorCode: String, disableMobile: boolean}}
 */
const createDetails = ({accountName, password, twoFactorCode, disableMobile}) => {
    return {
        accountName, 
        password,
        twoFactorCode: SteamTotp.getAuthCode(twoFactorCode),
        disableMobile: disableMobile || true
    };
};
/**
 * Создаем объект, для создания body. 
 * @param {String} data - html в текстовом формате.
 * @returns {Object}
 */
const createOpenID = data => {
    return {
        'action': 'steam_openid_login',
        'openid.mode': 'checkid_setup',
        'openidparams': data.match(/(?<=openidparams"\s+value=").*(?=")/)?.[0], 
        'nonce': data.match(/(?<=nonce"\s+value=").*(?=")/)?.[0]
    };
};
/**
 * Создаем заголовки, для запроса на CSM.
 * @param {Object} params - Объект с параметрами, для заполнения заголовков.
 * @param {String} params.url - URL на который нужно сделать запрос.
 * @param {String} params.cookie - Строка всех нужных куки файлов.
 * @param {String} [params.referrer] - Объект с параметрами, для заполнения заголовков.
 * @param {String} [params.method] - Метод запроса. По умолчанию: 'get'.
 * @param {Object | String} [params.data] - Тело запроса.
 * @param {Number} [params.maxRedirects] - Допустимое количество редиректов. По умолчанию: 0.
 * @returns {Object} 
 */
const createHeaders = params => {
    const config = {
        'baseURL': params.url,
        'headers': {
            'Connection': 'keep-alive',
            'Referrer': params.referrer ? params.referrer : 'https://steamcommunity.com/',
            'Cookie': params.cookie
        },
        'maxRedirects': params.maxRedirects ? params.maxRedirects : 0,
        'validateStatus': status => status < 400,
        'method': params.method ? params.method : 'get',
    };

    if (params.data) {
        const boundary = generateBoundary();
        config.data = formDataBody(params.data, boundary);
        config.headers['Content-Length'] = Buffer.byteLength(config.data);
        config.headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
    }

    return config;
};

export {
    createDetails, 
    createHeaders,
    createOpenID,
};

