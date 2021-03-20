const { TextPrompt } = require('botbuilder-dialogs');
const { log } = require('../../logger');
const { fileIO } = require('../../fileIO')

module.exports.NickPrompt = class NickPrompt extends TextPrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            var dialogUser = fileIO.checkDialog(prompt.context.activity.channelId,prompt.context.activity.from.id);
            if(dialogUser === false){
                await prompt.context.sendActivity("Command is currently in session. Please allow the student to complete requests.")
                log.debug(`Student attempted to talk during dialog.`);
                return false;
            } else{
                    if (!prompt.recognized.succeeded) {
                        await prompt.context.sendActivity('Please tell me your nick name.');
                        return false;
                    } else {
                        const value = prompt.recognized.value;
                        if (value.length < 1) {
                            await prompt.context.sendActivity('Your name has to include at least one character.');
                            log.error(`Student attempted to enter blank nickname.`);
                            return false;
                        } else if (value.length > 50) {
                            await prompt.context.sendActivity(`Sorry, but I can only handle names of up to 50 characters. Yours was ${ value.length }.`);
                            log.error(`Student attempted to enter nickname that is too long.`);
                            return false;
                        } else {
                            return true;
                    }
                }
            }
        });
    }
};
