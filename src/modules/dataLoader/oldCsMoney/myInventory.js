import {get} from '../../senders/index.js';
import {defaultSetting, unstackItems} from '../../../helpers/index.js';
import getOldResponseError from '../../../helpers/getOldResponseError.js';
import {countBadQueries} from '../../generalInfo/index.js';

/**
 * Мой инвентарь
 */
export const myInventory = ({
    console,
    get,
    setTimeout,
    defaultSetting,
    unstackItems,
    getOldResponseError,
}) => ({
    accounts: {},
    
    /**
     * Добавление предмета в мой инвентарь.
     * @param {string} accountId - Ключ к нужному аккаунту.
     * @param {object} itemInfo - Объект с данными предмета, который был получен через WS.
     * @param {string | number} [appId] - id необходимой игры.
     */
    add (accountId, itemInfo, appId) {
        if (!this.accounts[accountId][itemInfo.appId || appId].itemsCsm[itemInfo.o]) {
            this.accounts[accountId][itemInfo.appId || appId].itemsCsm[itemInfo.o] = [];
        }
        this.accounts[accountId][itemInfo.appId || appId].itemsCsm[itemInfo.o].push(itemInfo);
    },
    
    /**
     * Удаление предмета из моего инвентаря
     *
     * @param {string} accountId - Ключ к нужному аккаунту.
     * @param {object} itemInfo - Объект с данными предмета, который был получен через WS.
     * @param {string | number} [appId] - id необходимой игры.
     */
    remove (accountId, itemInfo, appId) {
        this.accounts[accountId][itemInfo.appId || appId].itemsCsm[itemInfo.o] =
            this.accounts[accountId][itemInfo.appId || appId].itemsCsm[itemInfo.o].filter(value => value.id[0] !== itemInfo.id[0]);
        
        if (this.accounts[accountId][itemInfo.appId || appId].itemsCsm[itemInfo.o].length === 0) {
            delete this.accounts[accountId][itemInfo.appId || appId].itemsCsm[itemInfo.o];
        }
    },
    
    /**
     * Получение инвентаря для всех аккаунтов.
     * @param {string} [accountId] - Ключ к нужному аккаунту.
     * @param {number | string} [appId] - Id игры.
     * @returns {{730: Object, 570: Object} | Object<string, {730: Object, 570: Object} | Object>}
     */
    get (accountId, appId) {
        return appId
            ? this.accounts[accountId][appId]
            : (accountId)
                ? this.accounts[accountId]
                : this.accounts;
    },
    
    /**
     * Получение предметов на всех аккаунтах
     * @returns {{730?: Object<string, Object<string, Object[]>>, 570?: Object<string, Object<string, Object[]>>}}
     */
    getAll () {
        return Object.values(this.accounts).reduce((allInventory, accountData, index) => {
            if (index === 0) {
                const appIds = new Set(Object.values(this.accounts).map(Object.keys)
                    .flat());
                appIds.forEach(appId => allInventory[appId] = {
                    itemsCsm: {},
                    itemsSteam: {},
                });
            }
            
            Object.entries(accountData).forEach(([appId, data]) => {
                Object.entries(data).forEach(([itemsKey, itemsData]) => {
                    if (itemsKey !== 'error') {
                        Object.entries(itemsData).forEach(([nameId, nameIdData]) => {
                            allInventory[appId][itemsKey][nameId] = allInventory[appId][itemsKey][nameId] || [];
                            allInventory[appId][itemsKey][nameId].push(...nameIdData);
                        });
                    }
                });
            });
            
            return allInventory;
        }, {});
    },
    
    /**
     * Обновление инвентаря с сервера.
     * @param {Object<string, string>} cookie - Куки файлы старой версии CSM.
     *
     * @param {object?} repeatLoad - Обновлять ли повторно.
     * @param {boolean} repeatLoad.status - Обновлять ли повторно.
     * @param {number} repeatLoad.delay - Таймаут перед обновлением инвентаря.
     *
     * @param {array?} appIdList - Массив с id нужных игр.
     *
     * @param {array?} requiredAccounts - Массив с ключами ко всем аккаунтам.
     *
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad = defaultSetting.repeatLoad.myInventory, appIdList = defaultSetting.appIdList,
        requiredAccounts = defaultSetting.getAccountIds()) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad.status &&
            setTimeout(() => this.load(cookie, repeatLoad, appIdList, requiredAccounts), repeatLoad.delay);
        
        try {
            for (const accountId of requiredAccounts) {
                if (!countBadQueries.canSend(accountId)) {
                    continue;
                }
                
                // Проверка на существования данных для нужного аккаунта.
                if (!this.accounts[accountId]) {
                    this.accounts[accountId] = {};
                }
                
                for (const appId of appIdList) {
                    const myInventory = await get(`https://old.cs.money/${appId}/load_user_inventory`, null, cookie || {oldCsm: true, accountId});
                    
                    !this.accounts[accountId][appId] && (this.accounts[accountId][appId] = {
                        itemsCsm: {},
                        itemsSteam: {},
                        error: false,
                    });
                    
                    if (!Array.isArray(myInventory)) {
                        const {error} = getOldResponseError(myInventory);
                        
                        if (error) {
                            console.log(error);
                            this.accounts[accountId][appId].error = error;
                            countBadQueries.increase(accountId);
                        }
                        continue;
                    }
                    
                    // Обнуляем инвентарь
                    this.accounts[accountId][appId] = {
                        itemsCsm: {},
                        itemsSteam: {},
                        error: false,
                    };
                    // Инвентарь пуст.
                    if (myInventory.length === 0) {
                        continue;
                    }
                    
                    for (const item of myInventory) {
                        const unstackedItems = unstackItems(item, appId);
                        
                        if (unstackedItems[0].vi?.[0]) {
                            if (!this.accounts[accountId][appId].itemsCsm[unstackedItems[0].o]) {
                                this.accounts[accountId][appId].itemsCsm[unstackedItems[0].o] = [];
                            }
                            this.accounts[accountId][appId].itemsCsm[unstackedItems[0].o].push(...unstackedItems);
                        } else {
                            if (!this.accounts[accountId][appId].itemsSteam[unstackedItems[0].o]) {
                                this.accounts[accountId][appId].itemsSteam[unstackedItems[0].o] = [];
                            }
                            this.accounts[accountId][appId].itemsSteam[unstackedItems[0].o].push(...unstackedItems);
                        }
                    }
                }
            }
        } catch (error) {
            console.log('Ошибка при обновлении инвентаря', error);
        } finally {
            startReload();
        }
    },
});

export default myInventory({
    console,
    get,
    setTimeout,
    defaultSetting,
    unstackItems,
    getOldResponseError,
});
