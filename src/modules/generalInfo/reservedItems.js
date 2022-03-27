import {ws} from '../senders/index.js';
import {defaultSetting} from '../../helpers/index.js';

const reservedItems = {
    items: [],
    
    isReserved(itemId) {
        return this.items.includes(itemId);
    },
    
    load(cookie, accountId = defaultSetting.getAccountIds()[0]) {
        const callback = response => {
            if (response.event === 'reserve_skins') {
                this.items.push(...response.data);
            } else if (response.event === 'delete_items') {
                this.items = this.items.filter(id => response.data.id !== id);
            }
        };
        
        ws(cookie?.[accountId] || {oldCsm: true, accountId}, callback,
            () => console.log('Открыт WS для проверки предметов в резерве...'))
            .finally(() =>
                setTimeout(() =>
                    this.load({cookie, accountId}), defaultSetting.delayReconnectWS));
    },
};

export default reservedItems;