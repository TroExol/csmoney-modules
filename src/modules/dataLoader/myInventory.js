import {get} from '../senders/index.js';
import {defaultSetting, unstackItems} from '../../helpers/index.js';
/**
 * Мой инвентарь
 */
const myInventory = {

    accounts: {},
    /**
     * Добавление предмета в мой инвентарь.
     * @param {string} keyAccounts - Ключ к нужному аккаунту.
     * @param {object} itemInfo - Объект с данными предмета, который был получен через WS.
     * @param {string | number} [appId] - id необходимой игры. 
     */
    //TODO Изменить на 
    add (keyAccount, itemInfo, appId) {
        if (!this.accounts[keyAccount][itemInfo.appId || appId][itemInfo.o]) {
            this.accounts[keyAccount][itemInfo.appId || appId][itemInfo.o] = [];
        }
        this.accounts[keyAccount][itemInfo.appId || appId].itemsCsm[itemInfo.o].push(itemInfo);
    },
    
    /**
     * Удаление предмета из моего инвентаря
     * 
     * @param {string} keyAccounts - Ключ к нужному аккаунту.
     * @param {object} itemInfo - Объект с данными предмета, который был получен через WS.
     * @param {string | number} [appId] - id необходимой игры. 
     */
    remove (keyAccount, itemInfo, appId) {
        this.accounts[keyAccount][itemInfo.appId || appId].itemsCsm[itemInfo.o] = 
            this.accounts[keyAccount][itemInfo.appId || appId].itemsCsm[itemInfo.o].filter(value => value.id[0] !== itemInfo.id[0]);
    },
    
    /**
     * Получение инвентаря для всех аккаунтов.
     * @param {string} [keyAccounts] - Ключ к нужному аккаунту..
     * @returns {{keyAccount:{730: {}, 570: {}}}} - 
     */
    get (keyAccount, appId) {
        return appId ? this.accounts[keyAccount][appId] : 
            (keyAccount) ? this.accounts[keyAccount] :
                this.accounts;
    },

    getAll () {
        return Object.values(this.accounts).reduce((allInventory, accountData, index) => {
            if (index === 0) {
                const appIds = new Set(Object.values(this.accounts).map(Object.keys).flat());
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
     * @param {string} cookie - Куки файлы новой версии CSM.
     * 
     * @param {object} repeatLoad - Обновлять ли повторно.
     * @param {boolean} repeatLoad.status - Обновлять ли повторно.
     * @param {number} repeatLoad.delay - Таймаут перед обновлением инвентаря.
     * 
     * @param {array} appIdList - Массив с id нужных игр.
     * 
     * @param {array} requiredAccounts - Массив с ключами ко всем аккаунтам. .
     * 
     * @returns {Promise<void>}
     */
    async load (cookie, repeatLoad = defaultSetting.repeatLoad.myinventory, appIdList = defaultSetting.appIdList, requiredAccounts = defaultSetting.keyAccounts) {
        // Повторный запуск обновления
        const startReload = () => repeatLoad.status &&
            setTimeout(() => this.load(cookie, repeatLoad, appIdList), repeatLoad.delay);
        
        try {
            for (const keyAccount of requiredAccounts) {
                // Проверка на существования данных для нужного аккаунта.
                if (!this.accounts[keyAccount]) {
                    this.accounts[keyAccount] = {};
                }

                for (const appId of appIdList) {
                    const getMyinventory = await get(`https://old.cs.money/${appId}/load_user_inventory`, null, cookie[keyAccount]);
                    if (!Array.isArray(getMyinventory)) {
                        // Обработка ошибки. //TODO Надо доработать
                        if (getMyinventory.error) {
                            console.log(getMyinventory.error);
                            this.accounts[keyAccount][appId].error = getMyinventory.error;
                            return;
                        }
                    }

                    // Обнуляем инвентарь
                    this.accounts[keyAccount][appId] = {
                        itemsCsm: {},
                        itemsSteam: {},
                        error: false
                    };
                    // Инвентарь пуст.
                    if (getMyinventory.length === 0) {
                        return;
                    }
                    
                    for (const item of getMyinventory) {
                        
                        for (const itemsUnstack of unstackItems(item, appId)) {
                            
                            if (itemsUnstack.vi) {
                                if (!this.accounts[keyAccount][appId].itemsCsm[itemsUnstack.o]) {
                                    this.accounts[keyAccount][appId].itemsCsm[itemsUnstack.o] = []; 
                                }
                                this.accounts[keyAccount][appId].itemsCsm[itemsUnstack.o].push(itemsUnstack);
                            } else {
                                if (!this.accounts[keyAccount][appId].itemsSteam[itemsUnstack.o]) {
                                    this.accounts[keyAccount][appId].itemsSteam[itemsUnstack.o] = []; 
                                }
                                this.accounts[keyAccount][appId].itemsSteam[itemsUnstack.o].push(itemsUnstack);
                            }
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
};


export default myInventory;
