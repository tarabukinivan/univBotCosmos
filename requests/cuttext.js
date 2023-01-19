module.exports = function(tmp=''){
    if(tmp.length>3900){
        //ограничение 4096
        tmp=tmp.slice(0, 3900)
    }
    return tmp
}
