const shell = require('shelljs');
module.exports = function(commd, txdata =''){
    try {
        tmp = shell.exec(commd, {silent: true, shell: '/bin/bash'}).stdout;
    } catch (e) {
        console.log(e);
        tmp = 'Error get logs';
    }
    //console.log("kolvo slov:" +tmp.length)
    if(tmp.length>3900){
        //ограничение 4096
        tmp=tmp.slice(0, 3900)
    }
    return tmp
}
