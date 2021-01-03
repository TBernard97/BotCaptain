const jsonfile = require('jsonfile');
const fs = require('fs');


class messageLock{
    /* EDIT 11/12 Lock mechanism is not feasible replacing with lock design */
    static checkUser(userID){
        let currentID = jsonfile.readFileSync('./dialogID.json');
        if(currentID != userID){
            return false
        } else{
            return true
        }
    }
}

module.exports.messageLock = messageLock;
