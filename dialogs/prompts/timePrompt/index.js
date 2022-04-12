const { TextPrompt } = require('botbuilder-dialogs');
const { log } = require('../../../src/logger');
const { fileIO } = require('../../../src/fileIO')
module.exports.TimePrompt = class TimePrompt extends TextPrompt {

    constructor(dialogId){
        super(dialogId, async(prompt) => {
            var dialogUser = fileIO.checkDialog(prompt.context.activity.channelId,prompt.context.activity.from.id);
            if(dialogUser === false){
                await prompt.context.sendActivity("Command is currently in session. Please allow the student to complete requests.");
                log.debug(`Student attempted to talk during dialog.`);
                return false;
            } else{
                if(!prompt.recognized.succeeded){
                    await prompt.context.sendActivity('Please enter a valid time based off 24-hour clock.');
                    return false;
                } else {
                    const timeValidator = new RegExp('^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
                    var time = prompt.context.activity.text;
                    if(timeValidator.test(time) == false){
                        await prompt.context.sendActivity(`The time ${time} is not valid. Please send a time based of 24-hour clock like 17:30 or 05:30.`);
                        log.error(`Student input wrong time.`);
                        return false;
                    } 
                     else {
                        return true;
                    }

                }
            }
        })
    }

}