import readline from 'readline';

export const input = ({
    readline,
    process,
}) =>
    /**
     *
     * @param {string} question - Строка, которая будет выводиться в консоль.
     * @returns {Promise<void>}
     */
    async question => {
        return new Promise(resolve => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question(question, content => {
                rl.close();
                if (content === null || content === undefined || !/\S/.test(content)) {
                    resolve(null);
                } else {
                    resolve(content.trim());
                }
            });
        });
    };

export default input({
    readline,
    process,
});