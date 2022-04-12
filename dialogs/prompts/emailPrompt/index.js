const vaildator = require('email-validator');
const { TextPrompt } = require('botbuilder-dialogs');
const { fileIO } = require('../../../src/fileIO')
const { channelValidation } = require('../../../src/channelValidation');
const { log } = require('../../../src/logger');

module.exports.EmailPrompt = class EmailPrompt extends TextPrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            var dialogUser = fileIO.checkDialog(prompt.context.activity.channelId,prompt.context.activity.from.id);
            if(dialogUser === false){
                await prompt.context.sendActivity("Command is currently in session. Please allow the student to complete requests.")
                log.debug(`Student attempted to talk during dialog.`);
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