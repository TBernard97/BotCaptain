const { TextPrompt } = require('botbuilder-dialogs');
const fs = require('fs');
const { fileIO } = require('../../../src/fileIO')
const { log } = require('../../../src/logger')

module.exports.ClassPrompt = class ClassPrompt extends TextPrompt {
    constructor(dialogId){
        super(dialogId, async(prompt) => {
            let path = `./Resources/Classes/${prompt.recognized.value}`
            var dialogUser = fileIO.checkDialog(prompt.context.activity.channelId,prompt.context.activity.from.id);
            if(dialogUser === false){
                await prompt.context.sendActivity("Command is currently in session. Please allow the student to complete requests.")
                log.debug(`Student attempted to talk during dialog.`);
                return false;
            } else{
                if(!prompt.recognized.succeeded){
                    await prompt.context.sendActivity('Please enter a valid class.');
                    log.error(`Student entered invalid dialog.`);
                    return false;
                } else if(fs.existsSync(path) === false) {
                    await prompt.context.sendActivity(`The class ${prompt.recognized.value} does not exist.`);
                    await prompt.context.sendActivity('Here is a list of the classes.');
                    var classes = fs.readdirSync('./Resources/Classes');
                    for (var i in classes ){
                        await prompt.context.sendActivity(`${classes[i]}`);
                    } 
                    log.error(`Student entered non-existent class.`);               
                    return false;
                }
                else {
                    return true;
                }

            }
            
        });
    }
}

