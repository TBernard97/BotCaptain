const { fileIO } = require('./fileIO');
var jsonfile = require('jsonfile');
const { messageParser } = require('./messageParser');
const { TurnContext } = require('botbuilder');

class profileAccessor{
    static profileRead(profile){
        let profilePath = `Resources/Classes/${profile.class}/profiles.json`;
        var contents = jsonfile.readFileSync(profilePath);
        let profileInfo=contents[`${profile.name}`];
        return profileInfo;
    }

    static profileUpdate(profile,key,val){
        //Update profile in Dialog memory
        let user = {...profile};
        user[`${key}`]=val;
        
        console.log(user);
        //Update profile in profiles.json
        fileIO.insertProfile(user);
        //Update profile in messageParser memory
        return user;

    }
}

module.exports.profileAccessor= profileAccessor;