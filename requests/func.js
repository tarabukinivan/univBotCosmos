const shell = require('shelljs');
module.exports = function(commd, txdata =''){
    try {
        tmp = shell.exec(commd, {silent: true, shell: '/bin/bash'}).stdout;
    } catch (e) {
        console.log(e);
        tmp = 'Error get logs';
    }
    return tmp
}
