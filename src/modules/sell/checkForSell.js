import {sell} from './index.js';
import {purchases} from '../dataLoader/index.js';

// TODO: вынести в отдельный файл, тк используется не только здесь
const sellingItemIds = [];

/**
 * Проверка предметов на продажу
 * @param {string} cookie - Куки аккаунта
 * @param {string} accountId - Ключ к нужному аккаунту
 * @param {number} recursivelyDuration - Длительность отправки запросов (в миллисекундах)
 * @param {number} recursivelyFrequency - Периодичность отправки запросов (в миллисекундах)
 * @returns {Promise<boolean>} - Результат продажи
 */
const checkForSell = async ({
    cookie,
    accountId,
}) => {
    //TODO: проверять не определенный аккаунт, а все
    try {
        const items = purchases.getItemsInInventory(accountId);
        
        for (const item of items) {
            //TODO: проверять откуда-то, что предмет не в оверстоке (checkStatuses?)
            
            // Добавление предмета в список продаваемых
            sellingItemIds.push(item.current_assetid);
            
            //TODO: перевести формат предмета из старого в новый
            
            await sell({
                items: [item],
                isVirtual: true,
                cookie,
                accountId,
            });
    
            // Удаление предмета из списка продаваемых
            sellingItemIds.splice(sellingItemIds.indexOf(item.current_assetid), 1);
        }
    } catch (error) {
        console.log('checkForSell unexpected error:', error);
        return false;
    }
};

export default checkForSell;