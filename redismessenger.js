const redis = require('redis');
const clc = require('cli-color');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
});

const user = {
    name: '',
    isActive: false,
    _id: crypto.randomBytes(12).toString('hex')
};

const colors = [
    9, 10, 226, 12, 13, 14, 3, 2, 1, 55, 130, 200, 166, 20
];

colors.sort((a, b) => a - b);

const rlQuestionPromisify = (rl, rlquestion) => (question) => new Promise((resolve, reject) => {
    rlquestion.call(rl, question, resolve);
});

rl.question = rlQuestionPromisify(rl, rl.question);

const subscriber = redis.createClient({
    host: "92.63.98.195",
    password: "121e5362bdbeeeb15ac9c693b8c0671e8221c1c8808b131e6d90e33ecce258cd"
});

const publisher = subscriber.duplicate();

subscriber.subscribe('communication', async () => {
    console.log('Вы успешно подключились к чату!');
    const name = await rl.question('Введите ник: ');
    user.name = name;
    for (let i = 0; i < colors.length; i++) {
        console.log(clc.bgXterm(colors[i]).xterm(0)(colors[i].toString().padEnd(process.stdout.columns)));
    }
    let color = +(await rl.question('Выберите цвет: ')) || colors[Math.random() * colors.length ^ 0];
    if (!colors.includes(color)) {
        color = colors[Math.random() * colors.length ^ 0];
    }
    user.color = color;
    user.isActive = true;
    const { _id } = user;
    publisher.publish('communication', JSON.stringify({
        text: await rl.question(''),
        name,
        color,
        _id
    }));
});

subscriber.on('message', async (channel, message) => {
    const data = JSON.parse(message);
    if (!user.isActive) {
        return;
    }
    const { name, color, _id } = user;
    if (data._id !== _id) {
        rl.prompt();
        console.log(`${clc.bold(clc.xterm(data.color)(data.name))}: ${data.text}`);
    }
    publisher.publish('communication', JSON.stringify({
        text: await rl.question(''),
        name,
        color,
        _id
    }));
});
