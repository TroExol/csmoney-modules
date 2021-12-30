import WebSocket from 'ws';

/**
 * Подключение к websocket old.cs.money
 * @param {string} cookie - Куки
 * @param {(string) => void} callback - Обработка сообщений от WS
 * @returns {Promise<any>} - Результат подключения (происходит при закрытии подключения)
 */
const connectWS = (cookie, callback) => new Promise((resolve, reject) => {
    try {
        // Открытие WS
        const ws = new WebSocket('wss://ws.cs.money/ws', {
            headers: {
                Origin: 'https://old.cs.money/',
                Cookie: cookie,
            },
        });
        
        ws.on('open', () => console.log('WS открыт...'));
        ws.on('error', reject);
        ws.on('close', resolve);
        
        ws.on('message', async message => {
            const response = JSON.parse(message);
            
            callback(response);
        });
    } catch (error) {
        console.log(`Произошла непредвиденная ошибка: ${error.message}`);
        reject(error);
    }
});

export default connectWS;