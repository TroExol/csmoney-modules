import {get} from '../../senders/index.js';

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
            // Получение названий предмета
            const items = await get(`https://old.cs.money/${appId}/load_bots_inventory`);
            
            // Не удалось получить названия предметов
            if (!Array.isArray(items)) {
                console.log(`Не удалось получить данные инвентаря бота игры ${appId}`, items);
                return [];
            }
            
            return items;
        } catch (error) {
            console.log(`Ошибка при получении предметов бота игры ${appId}`, error);
            return [];
        }
    };

export default botInventoryLoader({
    get,
    console,
});