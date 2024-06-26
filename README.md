нужно добавить mute, остановить отправку сообщений
если установили раньше, чем 19.01.23 нужно переустановить. Были обнаружены ошибки.
Испытан на haqq, gitopiad, mars, lava, niniru
## Порядок установки:

1. обновляем пакеты
```
sudo apt update && sudo apt upgrade -y
```
2. скачиваем репозиторий
```
sudo apt update && sudo apt install jq -y && sudo apt install npm -y && sudo npm install pm2 -g && pm2 update
cd
git clone https://github.com/tarabukinivan/univBotCosmos.git
если нужно переименовать папку univBotCosmos в другую можно например, так:
git clone https://github.com/tarabukinivan/univBotCosmos.git marsbot
второй бот
git clone https://github.com/tarabukinivan/univBotCosmos.git nibidbot
и т.д.
```
3. Устанавливаем nodejs и npm, если не установлено
```
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash - && \
sudo apt-get install nodejs -y && \
echo -e "\nnodejs > $(node --version).\nnpm  >>> v$(npm --version).\n"
```
> результат выполнения должен быть примерно такой:

> ![resultatnpm](https://user-images.githubusercontent.com/56988566/195841827-4764e964-0a8a-4ebd-b867-1cd641280008.png)

4. переходим в папку проекта (если не переимоновали)
```
cd /$USER/univBotCosmos
```
5. устанавливаем необходимые модули
```
npm i
```
6. создаем файл .env 
```
nano .env
```
и вводим необходимые данные для работы бота в файл .env
```
BOT_TOKEN=<TOKEN>
CHATID=<chat_id>
BIN=neutrond
VALOPER=<valoper_address>
LASTPROPOSAL=0
```
> TOKEN - телеграм токен (для каждого бота нужен новый)<br>
> valoper_address - валопер адрес <br>
> chat_id - id чата (куда будут приходить уведомления)<br>
> bin - бинарный файл ноды

>> где взять TOKEN и chat_id можете посмотреть в статье [Настройка телеграм бота](https://tarabukinivan.medium.com/%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D1%82%D1%8C-%D1%82%D0%BE%D0%BA%D0%B5%D0%BD-%D0%B4%D0%BB%D1%8F-%D1%82%D0%B5%D0%BB%D0%B5%D0%B3%D1%80%D0%B0%D0%BC-%D0%B1%D0%BE%D1%82%D0%B0-%D1%83%D0%B7%D0%BD%D0%B0%D1%82%D1%8C-id-chat-eddb844c6126)
7. устанавливаем pm2 глобально для запуска бота в фоне (если уже устанавливали не устанавливайте)
```
npm i pm2 -g
```
8. запуск бота (обязательно выполняется в папке бота)
```
pm2 start index.js
```
> ![npm_start](https://user-images.githubusercontent.com/56988566/195844549-5aaae4d7-af1a-44d2-acb0-eaeb207d14a6.png)
> статус online говорит о том, что бот запущен
9. для остановки бота выполняется команда: (расширение файла .js необязательна)
```
pm2 stop index
```
> ![npm_st](https://user-images.githubusercontent.com/56988566/195845413-1b9281d9-df54-4e59-9a0e-0a2a9a85c914.png)
> бот остановлен

## Что умеет бот

Бот каждые 2 секунд проверяет пиры ноды, и состояние jailed, новые пропозалы и уведомляет пользователя. <br>

А также имеет команды для проверки вручную:
```
 '/df' - место на сервере
 '/free' - Информация об ОЗУ
 '/status' - статус ноды
 '/logs' - последние 5 строк лога
 '/proposals' - список пропозалов и их состояние
 '/peers' - количество пиров
 '/infoval' - информация о операторе
```
Примечание:
На warden NodeInfo поменять на node_info в 2-3 местах
SyncInfo на sync_info
query gov proposals -o json --limit=1 на query gov proposals -o json --page-limit=1

if('content' in propobj){
    proptitle='.content.title'
  }else{
    proptitle='.messages[0].content.title'
  } na proptitle=propobj.title


 let tmp = shellexe(`${binf} query gov proposals -o json --page-limit=1000 | jq \'.proposals[]\' | jq -r  \'.${propkey} + " " + .status +"   "+${proptitle}\' `)
 na
 let tmp = shellexe(`${binf} query gov proposals -o json --page-limit=1000 | jq \'.proposals[]\' | jq -r  .title`)
  
