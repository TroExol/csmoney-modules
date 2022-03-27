import {get} from '../../senders/index.js';
import {defaultSetting} from '../../../helpers/index.js';
import chalk from 'chalk';

/**
 * Список названий предметов.
 */
export const itemNamesLoader = ({
    setTimeout,
    console,
    get,
    defaultSetting,
}) => ({
    nameId: {
        730: {},
        570: {},
    },
    
    /**
     * Получение названий предметов.
     * @param {number | string} [appId] - Id нужной игры.
     * @param {number} [nameId] - Id названия предмета.
     * @returns {{730: Object<string, {m: string}> | undefined, 570: Object<string, {m: string}> | undefined} | Object<string, {m: string}> | string | undefined}
     */
    get (appId, nameId) {
        return appId
            ? nameId
                ? this.nameId[appId][nameId]?.m
                : this.nameId[appId]
            : this.nameId;
    },
    
    /**
     * Обновление названий предметов с сервера.
     *
     * @param {('ru' | 'en')?} language - Выбор языка для предметов.
     *
     * @param {object?} repeatLoad - Обновлять ли повторно.
     * @param {boolean} repeatLoad.status - Обновлять ли повторно.
     * @param {number} repeatLoad.delay - Таймаут перед обновлением списка.
     *
     * @param {array?} appIdList - Массив с id нужных игр.
     *
     * @returns {Promise<void>}
     */
    async load (language = defaultSetting.languageName, repeatLoad = defaultSetting.repeatLoad.itemNames,
        appIdList = defaultSetting.appIdList) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad.status &&
            setTimeout(() => this.load(language, repeatLoad, appIdList), repeatLoad.delay);
        
        try {
            for (const appId of appIdList) {
                console.log(`Загрузка названий предметов для игры ${appId}`);
                // Получение названий предмета
                const response = await get(`https://old.cs.money/js/database-skins/library-${language}-${appId}.js`);
                this.nameId[appId] = typeof response === 'string' ? JSON.parse(response.split(' = ')[1]) : {};
            }
        } catch (error) {
            console.log(chalk.red.underline('Ошибка при получении списка названий предметов CS:GO / DOTA2'), error);
        } finally {
            startReload();
        }
    },
});

export default itemNamesLoader({
    setTimeout,
    console,
    get,
    defaultSetting,
});