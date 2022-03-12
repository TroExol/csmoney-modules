import {sell} from './index.js';
import {purchases, itemStatus} from '../dataLoader/index.js';
import {defaultSetting, formatItemFromOldToNew} from '../../helpers/index.js';
import {sellingProcesses} from '../generalInfo/index.js';

/**
 * Проверка предметов на продажу
 * @param {Object<string, string>} cookie - Куки
 * @param {array?} requiredAccounts - Массив с ключами ко всем аккаунтам нужных игр
 * @param {object?} repeatLoad - Обновлять ли повторно
 * @param {boolean} repeatLoad.status - Обновлять ли повторно
 * @param {number} repeatLoad.delay - Таймаут перед обновлением списка
 */
const checkForSell = ({
    cookie,
    requiredAccounts = defaultSetting.getAccountIds(),
    repeatLoad = defaultSetting.repeatLoad.checkForSell,
}) => {
    // Повторный запуск обновления
    const startReload = () => repeatLoad.status &&
        setTimeout(() => checkForSell({cookie, requiredAccounts, repeatLoad}), repeatLoad.delay);
    
    try {
        for (const accountId of requiredAccounts) {
            const items = purchases.getItemsInInventory(accountId);
            
            for (const item of items) {
                const formattedItem = formatItemFromOldToNew(Number(item.appid), {
                    id: [item.user_skin_id],
                    // eslint-disable-next-line id-length
                    o: item.name_id,
                    vi: [1],
                    // eslint-disable-next-line id-length
                    p: item.price,
                });
                
                if (!formattedItem.fullName) {
                    console.log(`Не удалось найти название предмета с nameId ${formattedItem.nameId}`);
                    continue;
                }
                
                if (!itemStatus.check(formattedItem.fullName, formattedItem.appId, 1)) {
                    continue;
                }
                
                if (sellingProcesses.countProcesses(accountId) >= defaultSetting.maxCountParallelsSelling) {
                    console.log(`Превышено кол-во одновременных процессов продажи (${sellingProcesses.countProcesses(accountId)})`);
                    break;
                }
    
                if (sellingProcesses.isSelling(accountId, formattedItem.id)) {
                    console.log(`Предмет ${formattedItem.fullName} уже в продаже`);
                    continue;
                }
    
                const processId = Symbol();
                
                // Добавление процесса продажи
                sellingProcesses.add(accountId, processId, [formattedItem.id]);
                
                //TODO: смотреть в файле, что предмет куплен ботом
    
                // Замыкание для того, чтобы по окончании продажи удалились правильные id
                (() => {
                    const innerProcessId = processId;
                    const innerItemIds = [formattedItem.id];
                    
                    sell({
                        items: [formattedItem],
                        isVirtual: true,
                        cookie: cookie[accountId],
                        accountId,
                    }).then(() =>
                        // Удаление процесса продажи
                        sellingProcesses.remove(accountId, innerProcessId, innerItemIds));
                })();
            }
        }
    } catch (error) {
        console.log('checkForSell unexpected error:', error);
    } finally {
        startReload();
    }
};

export default checkForSell;