import SteamCommunity from 'steamcommunity';
import axios from 'axios';

import {createDetails, getCookieCSM, createHeaders} from './CsMoneyAuthorization/index.js';
import {defaultSetting} from '../../helpers/index.js';
import {sortCookie} from './sortCookie.js';


const steam = new SteamCommunity;


const url = {
    oldCsm: 'https://old.cs.money',
    newCsm: 'https://cs.money'
};


const getCookies = {
    accounts: {},
    set(cookies) {
        this.accounts[cookies];
    },
    
    /**
     * Приводим объект с cookie в строку. key=value
     * @param {String | Number} accountId - Id аккаунта Steam.
     * @param {Object} [cfg] - Если не передать аргумент, то будет возвращена строка cookie файлов Steam.
     * @param {Boolean} cfg.oldCsm - Получить строку cookie файлов, для старой версии CSM.
     * @param {Boolean} cfg.newCsm - Получить строку cookie файлов, для новой версии CSM.
     * @returns {String} - За один запрос, восвращает строку файлов cookie для одного сайта и для одного аккаунта.
     */
    getStrCookie({accountId, oldCsm, newCsm}) {

        const site = oldCsm ? 'oldCsm' : (newCsm) ? 'newCsm' : 'steam';

        return Object.entries(this.accounts[accountId][site]).reduce((strCookie, [typeCookie, cookie]) => {
            return strCookie ? `${strCookie}${typeCookie}=${cookie};` : `${typeCookie}=${cookie};`;
        }, undefined);
    },
    /**
     * Проверка cookie файлов.
     * @param {{oldCsm: Boolean?, newCsm: Boolean?, accountId: (Number | String)?}} cookies - Для проверки в обьекте надо указать oldCsm/newCsm (можно передать куки сразу для обеих версий сайта), значения которых должно быть true | false. Или пережать [accountId], тогда проверка будет сразу для обеих версий сайта, для конкретного аккаунта.
     * @returns {Promise<Boolean | undefined>}
     */
    async checkCookie(cookies) {
        try {
            if (cookies.accountId) {
                cookies = {
                    oldCsm: this.getStrCookie(cookies.accountId, {oldCsm: true}),
                    newCsm: this.getStrCookie(cookies.accountId, {newCsm: true})
                };
            }

            for (const site in cookies) {
     
                const {headers} = await axios(
                    createHeaders({
                        url: url[site],
                        cookie: cookies[site],
                        maxRedirects: 2
                    })
                );
                
                const setCookie = headers['set-cookie'].join('');
                const isLoggedIn = setCookie.includes('sLoggedIn=true') || setCookie.includes('registered_user=true');

                if (isLoggedIn) {
                    return true;
                }

                await this.load();
                console.log('Файлы cookie были обновлены');
            }
        } catch (error) {
            console.log('Отсутствуют файлы cookie');
        }
    },

    /**
     * Загрузка cookie файлов для CSM.
     * @param {Array} detailsList - Массив объектов details, с данными Steam аккаунтов.
     * @param {Object} receiveСookie - Объект с парраметрами для какой версии CSM нужно плучать cookie.
     */
    async load(detailsList = defaultSetting.getAccountDetails(), receiveСookie = defaultSetting.receiveСookie) {

        for (const details of detailsList) {

            // Получаем cookie файлы и записываем в переменную SteamId.
            const accountId = await this.loadCookieSteam(details);
            
            if (receiveСookie.oldCsm) {
                await this.loadCookieOldCsm(accountId);
            }

            if (receiveСookie.newCsm) {
                await this.loadCookieNewCsm(accountId);
            }
        }
    },

    /**
     * Авторизация в Steam, для получения cookie файлов.
     * @param {Object} details
     * @param {Object} details.accountName - Логин.
     * @param {Object} details.password - Пароль.
     * @param {Object} details.twoFactorCode - "shared_secret" из maFiles.
     * @param {Object} [details.disableMobile] - Нужно для получения всех cookie.
     * @returns {Promise<Number>} - Возвращает Id аккаунта Steam.
     */

    async loadCookieSteam(details) {

        return await new Promise(reslove => {
            steam.login(createDetails(details), (err, sessionID, cookie) => {

                if (err) {
                    throw new Error('Не удалось полчить cookie файлы Steam. Проверьте правильно ли был заполнен парамет details и попробуйте ещё раз.');
                }

                steam.getClientLogonToken((err, {steamID}) => {

                    if (!defaultSetting.steamAuthorizationData[steamID]) {
                        defaultSetting.set({
                            steamAuthorizationData: {
                                [steamID]: details
                            }
                        });
                    }

                    if (!this.accounts[steamID]) {
                        this.accounts[steamID] = {};
                    }

                    this.accounts[steamID].steam = sortCookie(
                        ['steamMachineAuth', 'steamRememberLogin', 'sessionid', 'steamLoginSecure'],
                        cookie 
                    );

                    reslove(steamID);
                });
            });
        });
    },
    /**
     * Получение cookie для старой версии CSM.
     * @param {String | Number} [accountId] - Id аккаунта Steam, для проверки авторизации.
     * @param {String} [cookie] - Cookie файлы Steam.
     */
    async loadCookieOldCsm(accountId, cookie = null) {
        try {
            this.accounts[accountId].oldCsm = sortCookie(
                ['username', 'csgo_ses', 'steamid', 'thirdparty_token', 'csrf', 'sellerid', 'isLoggedIn'],
                await getCookieCSM({
                    urlAuth: 'https://auth.dota.trade/login?redirectUrl=https://old.cs.money&callbackUrl=https://old.cs.money/login', 
                    urlSite: 'https://old.cs.money/', 
                    accountId,
                    steamCookie: cookie || this.getStrCookie({accountId}),
                    siteCookie: 'currency=USD;pro_version=true;language=en;'
                })
            );
        } catch (error) {
            console.log('Ошибка при получении Cookie файлов old.cs.money!', error.message);
        }
    },
    /**
     * Получение cookie для новой версии CSM.
     * @param {String | Number} [accountId] - Id аккаунта Steam, для проверки авторизации.
     * @param {String} [cookie] - Cookie файлы Steam.
     */
    async loadCookieNewCsm(accountId, cookie = null) {
        try {
            this.accounts[accountId].newCsm = sortCookie(
                ['csgo_ses', 'username', 'support_token', 'steamid', 'visitor_id', 'registered_user'],
                await getCookieCSM({
                    urlAuth: 'https://auth.dota.trade/login?redirectUrl=https://cs.money/ru/csgo/trade&callbackUrl=https://cs.money/login', 
                    urlSite: 'https://cs.money/', 
                    accountId: accountId,
                    steamCookie: cookie || this.getStrCookie({accountId}),
                    siteCookie: 'currency=USD;pro_version=true;language=en;'
                })
            );
        } catch (error) {
            console.log('Ошибка при получении Cookie файлов cs.money!', error.message);
        }
    }
};

export default getCookies;

