import axios from 'axios';
import {createOpenID, createHeaders} from './createData.js';

/**
 * Получение cookie файлов для CSM. Подходит как для новой версии, так и для старой.
 * @param {Object} param 
 * @param {String} param.urlAuth - Ссылка для начала авторизации на сайте.
 * @param {String} param.urlSite - Ссылка на сам сайт.
 * @param {String} param.steamCookie - Файлы cookie steam.
 * @param {String} [param.siteCookie] - Дополнительные cookie при авторизации.
 * @returns {Promise <String>} - Строка cookie файлов, разделённых ";".
 */

export const getCookieCSM = async({urlAuth, urlSite, steamCookie, siteCookie}) => {

    const steamOpenidLogin = await axios(
        createHeaders({
            url: urlAuth,
            cookie: steamCookie,
            referrer: urlSite,
            method: 'get',
            maxRedirects: 2
        })
    );

    const openidInfo = createOpenID(steamOpenidLogin.data);

    // Авторизация на CSM.
    const csmOpenidLogin = await axios(
        createHeaders({
            url: 'https://steamcommunity.com/openid/login',
            cookie: `${steamCookie}sessionidSecureOpenIDNonce=${openidInfo.nonce}`,
            referrer: steamOpenidLogin.request.res.responseUrl,
            method: 'post',
            data: openidInfo
        })
    ); 

    urlAuth = csmOpenidLogin.headers.location;
    
    // Максимальное количество редиректов в цикле
    for (let maxRedirects = 0; maxRedirects < 10; maxRedirects++) {
        const response = await axios(
            createHeaders({
                url: urlAuth,
                cookie: siteCookie
            })
        );
        
        siteCookie = response.headers['set-cookie'] ? siteCookie + response.headers['set-cookie'].join(';') : siteCookie;

        if (response.headers.location) {
            urlAuth = response.headers.location;
        }

        if (response.status === 200) {
            const isLoggedIn = siteCookie.includes('registered_user=true') || siteCookie.includes('isLoggedIn=true');

            if (isLoggedIn) {
                return siteCookie;
            }

            throw new Error(`Не удалось авторизоваться на ${urlSite}. Cookie которые удалось получить: ${siteCookie}`);
        } 
    }

};