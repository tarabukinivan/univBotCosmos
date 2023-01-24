const TelegramApi = require('node-telegram-bot-api')
require('dotenv').config()
const bot = new TelegramApi(process.env.BOT_TOKEN, {polling: true})
const chatId = process.env.CHATID
const binf = process.env.BIN
const valoper = process.env.VALOPER
const wallet = process.env.WALLET
const custom_rpc = process.env.CUSTOM_RPC
const denom = process.env.DENOM
const pass = process.env.PASSWORD
let lastprop = parseInt(process.env.LASTPROPOSAL)
const cron = require("node-cron");
const settime = require('./requests/settime')
const shellexe = require('./requests/func.js')
const poiskhash = require('./requests/poiskhash.js')
const cuttext = require('./requests/cuttext.js')
const templ = require('./requests/gettemplates.js')
var sound = true;

bot.setMyCommands([
    {command: '/df', description: 'Hard disk information'},
    {command: '/free', description: 'RAM Information'}, 
    {command: '/mute', description: 'disable notifications'},
    {command: '/unmute', description: 'enable notifications'},
    {command: '/status', description: 'node status'},
    {command: '/template', description: 'show templates'},  
    {command: '/logs', description: 'last logs'},
    {command: '/proposals', description: 'proposal list'}, 
    {command: '/peers', description: 'number of peers'},
    {command: '/infoval', description: 'Validator Info'},
  ])
console.log('binary=' +binf)
try {
  var nodestatus = shellexe(`${binf} status 2>&1 | jq`)
} catch (e) {  
  console.log(chatId, 'node not configured,\n\n error:  ' + e);
  process.exit(1)
}
console.log("nodestatus:")
console.log(nodestatus)
if(nodestatus==false){
  console.log("nodestatus="+nodestatus)
  console.log(chatId, `node not configured,\n check status: \n  ${binf} status 2>&1 | jq`);
  bot.sendMessage(chatId, 'Node not working:  ' + `${binf} status |jq`);
  process.exit(1)
}

const rpc = JSON.parse(nodestatus).NodeInfo.other.rpc_address;
//const rpc=nosst.NodeInfo.other.rpc_address;
const chainid=JSON.parse(nodestatus).NodeInfo.network;
console.log(chainid)
const httprpc = rpc.replace("tcp", "http")
console.log("rpc="+rpc)
console.log("hrpc="+httprpc)
const hashrpc=custom_rpc ? custom_rpc : rpc
console.log("hashrpc="+hashrpc)
console.log("valoper="+valoper)
const propcol = shellexe(`${binf} query gov proposals -o json --limit=1 | jq '.proposals[]' | jq -r `)
const propobj=JSON.parse(propcol)
const propkey = Object.keys(propobj)[0]
let proptitle='';
if('content' in propobj){
  proptitle='.content.title'
}else{
  proptitle='.messages[0].content.title'
}
console.log("proptitle="+proptitle)
console.log("proposalkey="+propkey)

const publkey = shellexe(`${binf} debug pubkey $(${binf} tendermint show-validator) 2>&1`)
const addrval = publkey.split('\n')

if(addrval[0].indexOf("Address:")==-1){
  const rezindex=addrval[0].indexOf("0x")
  var HexAddr=addrval[0].substr(rezindex+2).toUpperCase();  
}else{
  var HexAddr=addrval[0].replace("Address:","").trim();
}
console.log("Hex="+HexAddr)
const template=templ(rpc,httprpc,chainid,valoper,wallet,denom);

function sleep(ms) {
  return new Promise((resolve) => {
      setTimeout(resolve, ms);
  });
}


const start = () => {
    bot.on('message', async msg => {
      const text = msg.text;
      //console.log(msg)
      if(text === '/start'){
        return bot.sendMessage(chatId, `Welcome to bot!\nyour node ${binf}`)
      }
      
      if(text === '/infoval'){      
        let tmp = shellexe(`${binf} query staking validator -o json ${valoper} |jq`)        
        return bot.sendMessage(chatId, 'Validator Info:\n\n' + cuttext(tmp));
      }

      if(text === '/proposals'){        
        let tmp = shellexe(`${binf} query gov proposals -o json --limit=1000 | jq '.proposals[]' | jq -r  '.${propkey} + " " + .status +"   "+${proptitle}' `)
        return bot.sendMessage(chatId, 'Proposals:\n\n' + cuttext(tmp,true));
      }

      if(text === '/df'){      
        let tmp = shellexe('df -h')
        return bot.sendMessage(chatId, 'Disk info:\n\n' + cuttext(tmp));
      }

      if(text === '/mute'){      
        sound=false
        return bot.sendMessage(chatId, 'notifications are disabled');
      }

      if(text === '/unmute'){      
        sound=true
        return bot.sendMessage(chatId, 'notifications enabled');
      }
  
      if(text === '/free'){      
        let tmp = shellexe(`free -h | column -c 110`)
        return bot.sendMessage(chatId, 'RAM Information:\n\n' + cuttext(tmp));
      }
      if(text === '/status'){ 
       let tmp = shellexe(`${binf} status --node ${rpc} 2>&1 | jq`)
        return bot.sendMessage(chatId, 'Status:\n\n' + cuttext(tmp));
      }
      
      if(text === '/logs'){
        let tmp = shellexe(`journalctl -u ${binf} -n 30 -o cat | sed -r "s/\x1B\\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g"`)
        return bot.sendMessage(chatId, 'Last Logs:\n\n' + cuttext(tmp,true));
      }

      if(text === '/template'){
        if(template){
          console.log('выполнить template')
          const arrtemplate = template.split("@@@@@")
          let i=0;
          (async function() {
              while (i<arrtemplate.length) {                 
              await sleep(100 * 1);              
              if(arrtemplate[i].trim()!=false){bot.sendMessage(chatId, cuttext(arrtemplate[i],true))} 
              i++;
              }
          })();
          return
        }else{
          console.log('false')
          return bot.sendMessage(chatId, 'template not found');
        }
      }

      if(text === '/peers'){
        let tmp = shellexe(`curl -s ${httprpc}/net_info | jq | grep n_peers`)
        return bot.sendMessage(chatId, 'number of peers:\n\n' + tmp);
      }
      if(/^\/bin\s/.test(text)){
        var shtext=text.replace("/bin ", "").trim();        
          console.log("shtext="+shtext)
          let tmp = shellexe(`echo -e ${pass}"\\ny\\n" | ${binf} ${shtext} 2>&1`)
          if (tmp) {
            let hasharr=poiskhash(tmp);
            console.log(hasharr)
            if(hasharr){
              bot.sendMessage(chatId, cuttext(tmp));
              return bot.sendMessage(chatId, hasharr[hasharr.length-1]);
            }else{
              return bot.sendMessage(chatId, cuttext(tmp));
            }
          }else{
            return bot.sendMessage(chatId, 'request returned no response');
          } 
      }

      if((/^[A-Z0-9]{64}$/gm).test(text)){
        let tmp = shellexe(`${binf} q tx ${text} --node ${hashrpc} 2>&1`)        
        return bot.sendMessage(chatId, cuttext(tmp));
      }

      return bot.sendMessage(chatId, `Unknown command`)
      
    })
  }
  
  start()
  let tmp=0;
  let lasttmp=0;
  let comfirmblock=2;
  let propuski=0;
  cron.schedule('*/4 * * * * *', async () => {   
    if(sound){     
      tmp = shellexe(`curl -s ${httprpc}/net_info |jq '.result .n_peers'  | xargs`)  
      if(tmp < 2){
        bot.sendMessage(chatId, 'Peers not found. Check the node');
      }
      tmp = shellexe(`${binf} query staking validator -o json --node ${rpc} ${valoper} |jq .jailed 2>&1`)
      if(tmp.trim() == "true"){
        bot.sendMessage(chatId, 'Node jailed');
      }
      let tmpprop = shellexe(`${binf} query gov proposals -o json --limit=1000 | jq '.proposals[]' | jq -r  '.${propkey} + " %@@@@@% " + .status + " %@@@@@% " + ${proptitle}' 2>&1`)
      let tmpproparray = tmpprop.split('\n')
      
      //console.log(tmpproparray)
      let tmpproparraylast=tmpproparray[tmpproparray.length-1].split('%@@@@@%')
      //console.log(tmpproparraylast)
      let tmpproparraylastInt = parseInt(tmpproparraylast[0])
      if(tmpproparraylastInt > lastprop){
        lastprop = tmpproparraylastInt
        //сообщение о новом пропозале
        bot.sendMessage(chatId, `New propozal ${tmpproparraylastInt} : ${tmpproparraylast[2]}`);
        settime(tmpproparraylastInt,'prop')
      }
      
      let last=shellexe(`${binf} status 2>&1 |jq '.SyncInfo .latest_block_height' | xargs`)
      if(last>lasttmp && HexAddr){
        lasttmp=last
        comfirmblock=shellexe(`curl -s ${httprpc}/block?height=${last}  | jq '.result .block .last_commit .signatures[] | select(.validator_address=="${HexAddr}")'.block_id_flag 2>&1`)
        console.log("lastblock="+last)
        if(comfirmblock!=2){
          propuski++
          console.log("codeblock: "+comfirmblock)
        }else{
          propuski=0
          console.log("comfirm")
        }        
        if(propuski>4){
          bot.sendMessage(chatId, `Node does not sign blocks`);
        }
      }
    }
  });
