import {defaultSetting} from '../../helpers/index.js';

const countBadQueries = {
    accounts: {},
    
    canSend (accountId) {
        if (!this.accounts[accountId] || Date.now() - this.accounts[accountId].startTime >= defaultSetting.badQueriesTime) {
            this.accounts[accountId].count = 0;
            this.accounts[accountId].startTime = Date.now();
        }
        
        if (this.accounts[accountId].count >= defaultSetting.maxBadQueriesByTime) {
            console.log(`Достигнут порог отправки запросов за ${(defaultSetting.badQueriesTime / 60000).toFixed(2)} минут (${defaultSetting.maxBadQueriesByTime})`);
            return false;
        }
        
        return true;
    },
    
    increase (accountId) {
        if (!this.accounts[accountId]) {
            this.accounts[accountId].count = 0;
            this.accounts[accountId].startTime = Date.now();
        }
        
        this.accounts[accountId].count++;
    },
};

export default countBadQueries;