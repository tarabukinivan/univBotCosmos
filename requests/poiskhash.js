module.exports = function(text){
    let tmp = text.match(/[A-Z0-9]{64}/gm)
    return tmp
}
