const fs = require('fs')
module.exports = function(){
  let fileContent =''
  try{
    fileContent = fs.readFileSync("templates.txt", "utf8");    
  }
  catch (error) {
    return false
  }  
  return fileContent 
}
