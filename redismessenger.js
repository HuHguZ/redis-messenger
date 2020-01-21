const redis = require('redis');
const clc = require('cli-color');
const readline = require('readline');
const crypto = require('crypto');

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
});

const Dateformatter = new Intl.DateTimeFormat("ru", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  });

const user = {
    name: '',
    isActive: false,
    _id: crypto.randomBytes(12).toString('hex'),
    room: ''
};

const rlQuestionPromisify = (rl, rlquestion) => (question) => new Promise((resolve, reject) => {
    rlquestion.call(rl, question, resolve);
});

rl.question = rlQuestionPromisify(rl, rl.question);

const subscriber = redis.createClient({
    host: process.argv[2],
    port: process.argv[3],
    password: process.argv[4]
});

const publisher = subscriber.duplicate();

(async () => {
    const name = await rl.question('Введите ник: ');
    user.name = name;
    for (let i = 0; i < 256; i++) {
        console.log(clc.bgXterm(i).xterm(0)(i.toString().padEnd(process.stdout.columns)));
    }
    let color = +(await rl.question('Выберите цвет: ')) || Math.random() * 256 ^ 0;
    if (color < 0 || color > 255) {
        color = Math.random() * 256 ^ 0;
    }
    user.color = color;
    let textColor = +(await rl.question('Выберите цвет текста: ')) || 255;
    if (textColor < 0 || textColor > 255) {
        textColor = 255;
    }
    user.textColor = textColor;
    const room = await rl.question('Введите название комнаты: ');
    user.room = room;
    subscriber.subscribe(user.room, async () => {
        console.log(`Вы успешно подключились к комнате ${user.room}`);
        user.isActive = true;
        const { _id } = user;
        publisher.publish(user.room, JSON.stringify({
            action: 'connected',
            name,
            color,
            _id,
        }));
        publisher.publish(user.room, JSON.stringify({
            text: await rl.question(''),
            name,
            color,
            _id,
            textColor
        }));
    });
})();

let quested = false;

subscriber.on('message', async (channel, message) => {
    const data = JSON.parse(message);
    const { name, color, _id, textColor } = user;
    if (data.action) {
        switch (data.action) {
            case 'connected':
                rl.prompt();
                console.log(`${clc.bold(clc.xterm(data.color)(data.name))} подключился к комнате!`);
                if (data._id !== user._id) {
                    publisher.publish(user.room, JSON.stringify({
                        action: 'exists',
                        name,
                        color,
                        _id,
                        _whom: data._id
                    }));
                }
                break;
            case 'exists':
                if (data._whom == user._id) {
                    rl.prompt();
                    console.log(`${clc.bold(clc.xterm(data.color)(data.name))} находится в комнате!`);
                }
                break;
        }
        return;
    }
    if (!user.isActive) {
        return;
    }
    if (data._id !== _id) {
        rl.prompt();
        console.log(`${clc.bold(clc.xterm(data.color)(data.name))} ${clc.bold(`[${Dateformatter.format(new Date())}]`)}: ${clc.xterm(data.textColor)(data.text)}`.padEnd(process.stdout.columns));
    }
    const { line } = rl;
    rl.close();
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ''
    });
    rl.question = rlQuestionPromisify(rl, rl.question);
    rl.write(line);
    const text = await new Promise(resolve => {
        rl.once('line', resolve);
    });
    publisher.publish(user.room, JSON.stringify({
        text,
        name,
        color,
        _id,
        textColor
    }));
});
