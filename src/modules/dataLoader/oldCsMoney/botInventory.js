import {get} from '../../senders/index.js';
import chalk from 'chalk';

export const botInventoryLoader = ({
    get,
    console,
}) =>
    /**
     * Список названий предметов
     * @param {number} appId - Id игры
     * @return {Promise<Object[]>} - Массив предметов
     */
    async appId => {
        try {
            console.log(`Загрузка инвентаря cs.money игры ${appId}`);
            // Получение названий предмета
            const items = await get(`https://old.cs.money/${appId}/load_bots_inventory`);
            
            // Не удалось получить названия предметов
            if (!Array.isArray(items)) {
                console.log(chalk.red.underline(`Не удалось получить данные инвентаря бота игры ${appId}`), items);
                return [];
            }
            
            return items;
        } catch (error) {
            console.log(chalk.red.underline(`Ошибка при получении предметов бота игры ${appId}`), error);
            return [];
        }
    };

export default botInventoryLoader({
    get,
    console,
});