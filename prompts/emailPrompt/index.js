const vaildator = require('email-validator');
const { TextPrompt } = require('botbuilder-dialogs');
const jsonfile = require ('jsonfile');
const { messageLock } = require('../../messageLock')
const { channelValidation } = require('../../channelValidation');

module.exports.EmailPrompt = class EmailPrompt extends TextPrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            var dialogUser = messageLock.checkUser(prompt.context.activity.from.id);
            if(dialogUser === false){
                await prompt.context.sendActivity("Command is currently in session. Please allow the student to complete requests.")
                return false;
            } else{
                if (!prompt.recognized.succeeded) {
                    await prompt.context.sendActivity('Please tell me your email.');
                    return false;
                } else {
                    const email = channelValidation.validateChannel(prompt.context);
                    var value = email;
                    
                    if(vaildator.validate(value) === false){
                        await prompt.context.sendActivity('Please enter a valid email address.')
                        return false;
                    } else{
                        return true;
                    }
                }
        }
        });
    }
};