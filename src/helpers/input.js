import readline from 'readline';

export const input = ({
    readline,
    process,
}) =>
    /**
     * Ввод в консоль
     * @param {String} question - Строка, которая будет выводиться в консоль.
     * @param {Boolean} hideInput - Прятать ли ввод за звездочками.
     * @returns {Promise<void>}
     */
    async (question, hideInput = false) => {
        return new Promise(resolve => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            if (hideInput) {
                rl.input.on('keypress', () => {
                    const inputLength = rl.line.length;
                    readline.moveCursor(rl.output, -inputLength, 0);
                    // Очищение всего справа от курсора
                    readline.clearLine(rl.output, 1);
                    // Замена текста на звездочки
                    for (let indexLetter = 0; indexLetter < inputLength; indexLetter++) {
                        rl.output.write('*');
                    }
                });
            }
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