const TelegramApi = require('node-telegram-bot-api')
require('dotenv').config()
const bot = new TelegramApi(process.env.BOT_TOKEN, {polling: true})
const chatId = '416844240'
const binf = process.env.BIN
const valoper = process.env.VALOPER
let lastprop = parseInt(process.env.LASTPROPOSAL)
const cron = require("node-cron");
const settime = require('./requests/settime')
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
console.log('бинарник=' +binf)
const nodestatus = shellexe(`${binf} status |jq`)

if(nodestatus==false){
  bot.sendMessage(chatId, 'Node not working:  ' + `${binf} status |jq`);
}

const nosst = JSON.parse(nodestatus)
const rpc=nosst.NodeInfo.other.rpc_address;

const httprpc = rpc.replace("tcp", "http")
console.log("rpc="+rpc)
console.log("hrpc="+httprpc)
console.log("valoper="+valoper)
const propcol = shellexe(`${binf} query gov proposals -o json --limit=1 | jq '.proposals[]' | jq -r `)
const propkey = Object.keys(JSON.parse(propcol))[0]
console.log("proposalkey="+propkey)
const start = () => {
    bot.on('message', async msg => {
      const text = msg.text;
      if(text === '/start'){
        return bot.sendMessage(chatId, `Welcome to bot!\nyour node ${binf}`)
      }
      
      if(text === '/infoval'){      
        let tmp = shellexe(`${binf} query staking validator -o json ${valoper} |jq`)        
        return bot.sendMessage(chatId, 'Validator Info:\n\n' + tmp);
      }

      if(text === '/proposals'){      
        let tmp = shellexe(`${binf} query gov proposals -o json --limit=1000 | jq '.proposals[]' | jq -r  '.${propkey} + " " + .status'`)
        return bot.sendMessage(chatId, 'Proposals:\n\n' + tmp);
      }

      if(text === '/df'){      
        let tmp = shellexe('df -h')
        return bot.sendMessage(chatId, 'Disk info:\n\n' + tmp);
      }
  
      if(text === '/free'){      
        let tmp = shellexe(`free -h | column -c 110`)
        return bot.sendMessage(chatId, 'RAM Information:\n\n' + tmp);
      }
      if(text === '/status'){ 
       let tmp = shellexe(`${binf} status --node ${rpc} | jq`)
        return bot.sendMessage(chatId, 'Status:\n\n' + tmp);
      }
      
      if(text === '/logs'){
        let tmp = shellexe(`journalctl -u ${binf} -n 30 -o cat | sed -r "s/\x1B\\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g"`)
        return bot.sendMessage(chatId, 'Last 5 line Logs:\n\n' + tmp);
      }

      if(text === '/peers'){
        let tmp = shellexe(`curl -s ${httprpc}/net_info | jq | grep n_peers`)
        return bot.sendMessage(chatId, 'number of peers:\n\n' + tmp);
      }

      return bot.sendMessage(chatId, `Unknown command trht`)
    })
  }
  start()
  let tmp=0;
  cron.schedule('*/2 * * * * *', async () => {    
    //console.log('tmpprop')
    //console.log(rport)
      tmp = shellexe(`curl -s ${httprpc}/net_info |jq '.result .n_peers'  | xargs`)  
      //console.log(tmp) 
      if(tmp < 2){
        bot.sendMessage(chatId, 'Peers not found. Check the node');
      }
      
      tmp = shellexe(`${binf} query staking validator -o json --node ${rpc} ${valoper} |jq .jailed`)
      if(tmp.trim() == "true"){
        bot.sendMessage(chatId, 'Node jailed');
      }
      
      let tmpprop = shellexe(`${binf} query gov proposals -o json --limit=1000 --node ${rpc} | jq '.proposals[]' | jq -r  '.${propkey} + " %@@@@@% " + .status + " %@@@@@% " + .metadata'`)
      
      
      let tmpproparray = tmpprop.split('\n')
      tmpproparray.pop()
      let tmpproparraylast=tmpproparray[tmpproparray.length-1].split('%@@@@@%')
      //console.log(tmpproparraylast)
      let tmpproparraylastInt = parseInt(tmpproparraylast[0])
      if(tmpproparraylastInt > lastprop){
        lastprop = tmpproparraylastInt
        //сообщение о новом пропозале
        bot.sendMessage(chatId, `New propozal ${tmpproparraylastInt} : ${tmpproparraylast[2]}`);
        settime(tmpproparraylastInt,'prop')
      }
});
