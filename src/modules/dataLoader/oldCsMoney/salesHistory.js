import {get} from '../../senders/index.js';
import chalk from 'chalk';

/**
 * Список названий предметов
 */
export const salesHistory = ({
    console,
    get,
    Date,
}) => ({
    730: {},
    570: {},
    
    /**
     * Получение названий предметов
     * @param {number} appId - Id игры
     * @param {number} itemNameId - Id названия предмета
     * @returns {Promise<Object[]>} - История продаж
     */
    async get (appId, itemNameId) {
        return this[appId][itemNameId] && this[appId][itemNameId].timeLoad >= Date.now() - 24 * 60 * 60000
            ? this[appId][itemNameId].history
            : (await this.load(appId, itemNameId));
    },
    
    /**
     * Получение истории продаж с сервера
     * @param {number} appId - Id игры
     * @param {number} itemNameId - Id названия предмета
     * @returns {Promise<Object[]>}
     */
    async load (appId, itemNameId) {
        try {
            console.log(`Загрузка истории покупок для предмета с id названия ${itemNameId} игры ${appId}`);
            // Получение названий предмета
            const history = await get('https://old.cs.money/market_sales', {
                appId,
                nameId: itemNameId,
                start_time: parseInt(String(Date.now() / 1000 - 30 * 24 * 60 * 60)),
            });
            
            // Не удалось получить названия предметов
            if (!Array.isArray(history)) {
                console.log(chalk.red.underline(`Не удалось получить историю покупок для предмета с id названия ${itemNameId} игры ${appId}`), history);
                return [];
            }
            
            this[appId][itemNameId] = {
                timeLoad: Date.now(),
                history,
            };
            
            return history;
        } catch (error) {
            console.log(chalk.red.underline(`Ошибка при получении истории покупок appId: ${appId} itemNameId: ${itemNameId}`), error);
            return [];
        }
    },
});

export default salesHistory({
    console,
    get,
    Date,
});