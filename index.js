const TelegramApi = require('node-telegram-bot-api')
require('dotenv').config()

const bot = new TelegramApi(process.env.BOT_TOKEN, {polling: true})
const chatId = process.env.CHATID
const valoper = process.env.VALOPER
const rport = process.env.RPC_PORT
const binf = process.env.BIN
const cron = require("node-cron");
const shellexe = require('./requests/func.js')
bot.setMyCommands([
    {command: '/df', description: 'Hard disk information'},
    {command: '/free', description: 'RAM Information'}, 
    {command: '/status', description: 'node status'}, 
    {command: '/logs', description: 'last logs'},
    {command: '/proposals', description: 'proposal list'}, 
    {command: '/peers', description: 'number of peers'},
    {command: '/infoval', description: 'Validator Info'},  
  ])
const start = () => {
    bot.on('message', async msg => {
      const text = msg.text;
      if(text === '/start'){
        return bot.sendMessage(chatId, `Welcome to bot!\nyour node ${binf}`)
      }
      
      if(text === '/infoval'){      
        let tmp = shellexe(`${binf} query staking validator -o json --node tcp://0.0.0.0:${rport} ${valoper} |jq`)
        //neutrond query staking validator -o json neutronvaloper1x9hshettlcuc2ms5p97n65tn029hu6dhjcj9tl
        return bot.sendMessage(chatId, 'Validator Info:\n\n' + tmp);
      }
// .id иногда бывает proposal_id
      if(text === '/proposals'){      
        let tmp = shellexe(`${binf} query gov proposals -o json --limit=1000 --node tcp://0.0.0.0:${rport} | jq '.proposals[]' | jq -r  '.id + " " + .status'`)
        return bot.sendMessage(chatId, 'Validator Info:\n\n' + tmp);
      }

      if(text === '/df'){      
        let tmp = shellexe('df -h')
        return bot.sendMessage(chatId, 'Disk info:\n\n' + tmp);
      }
  
      if(text === '/free'){      
        let tmp = shellexe('free -h')
        return bot.sendMessage(chatId, 'RAM Information:\n\n' + tmp);
      }
      if(text === '/status'){ 
       let tmp = shellexe(`${binf} status --node tcp://0.0.0.0:${rport} | jq`)
        return bot.sendMessage(chatId, 'Status:\n\n' + tmp);
      }
      
      if(text === '/logs'){
        let tmp = shellexe(`journalctl -u ${binf} -n 5 -o cat | sed -r "s/\x1B\\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g"`)
        return bot.sendMessage(chatId, 'Last 5 line Logs:\n\n' + tmp);
      }

      if(text === '/peers'){
        let tmp = shellexe(`curl -s http://0.0.0.0:${rport}/net_info | jq | grep n_peers`)
        return bot.sendMessage(chatId, 'number of peers:\n\n' + tmp);
      }

      return bot.sendMessage(chatId, `Unknown command trht`)
    })
  }
  start()
  let tmp=0;
  cron.schedule('*/2 * * * * *', async () => {    
    tmp = shellexe(`curl -s http://0.0.0.0:${rport}/net_info |jq '.result .n_peers'  | xargs`)      
      if(tmp < 2){
        bot.sendMessage(chatId, 'Peers not found. Check the node');
      }
      tmp = shellexe(`${binf} query staking validator -o json --node tcp://0.0.0.0:${rport} ${valoper} |jq .jailed`)
      
      if(tmp.trim() == "true"){
        bot.sendMessage(chatId, 'Node jailed');
      }
      
});
