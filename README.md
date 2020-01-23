# Redis messenger
Данный мессенджер для своей работы использует библиотеку Redis. Для запуска необходима Node.js.
# Установка
Клонируем репозиторий
~~~~
git clone https://github.com/HuHguZ/redis-messenger.git
~~~~
Или скачиваем, используя утилиту curl:
~~~~
curl https://raw.githubusercontent.com/HuHguZ/redis-messenger/master/redismessenger.js > redismessenger.js
~~~~
Устаналиваем необходимые зависимости:
~~~~
> npm i cli-color redis
~~~~
# Запуск
~~~~
node redismessenger.js <ip> <port> <password>
~~~~
<ip> - ip сервера, на котором запущен Redis.
<port> - порт, на котором запущен Redis.
<password> - пароль для авторизации, если есть.
