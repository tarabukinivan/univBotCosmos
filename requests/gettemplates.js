const fs = require('fs')

module.exports = function(rpc='',httprpc='',chainid='',valoper='',wallet='<wallet>',denom='<denom>'){
  let fileContent =''
  try{
    fileContent = fs.readFileSync("templates.txt", "utf8");    
  }
  catch (error) {
    return false
  }
  let totalcontent = "переменные: \n\n"
  totalcontent+="{rpc}=" +rpc + "\n\n"
  totalcontent+="{httprpc}=" +httprpc + "\n\n"
  totalcontent+="{chainid}=" +chainid + "\n\n"
  totalcontent+="{valoper}=" +valoper + "\n\n"
  totalcontent+="{denom}=" +denom + "\n\n"
  totalcontent+="{wallet}=" +wallet + "\n\n\n"
  let replacing=fileContent.replace(/{rpc}/gi, rpc)
  replacing=fileContent.replace(/{httprpc}/gi, httprpc)
  replacing=replacing.replace(/{chainid}/gi, chainid)
  replacing=replacing.replace(/{valoper}/gi, valoper)
  replacing=replacing.replace(/{wallet}/gi, wallet)
  return  totalcontent +"\n"+ replacing 
}
