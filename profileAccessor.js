const { fileIO } = require('./fileIO');
var jsonfile = require('jsonfile');

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
        
        
        //Update profile in profiles.json
        fileIO.insertProfile(user);
        //Used to update messageParser's profile through returning step.values.profile in dialogs
        return user;
    }
    static profileVoteUpdate(profile,task,val){
        //Update profile in Dialog memory
        let user = {...profile};
        user.votes[`${task}`]=val;
        
        
        //Update profile in profiles.json
        fileIO.insertProfile(user);
        //Used to update messageParser's profile through returning step.values.profile in dialogs
        return user;

    }
    
}

module.exports.profileAccessor= profileAccessor;