import {get} from '../senders/index.js';

/**
 * Список названий предметов
 * @param {number} appId - Id приложения
 * @return {Object[]} - Массив предметов
 */
const botInventoryLoader = async appId => {
    try {
        // Получение названий предмета
        const items = await get(`https://old.cs.money/${appId}/load_bots_inventory`);
        
        // Не удалось получить названия предметов
        if (!Array.isArray(items)) {
            console.log('Не удалось получить данные инвентаря бота', items);
            return [];
        }
        
        return items;
    } catch (error) {
        console.log(`Ошибка при получении предметов бота приложения ${appId}`, error);
        return [];
    }
};

export default botInventoryLoader;