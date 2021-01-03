const { TextPrompt } = require('botbuilder-dialogs');
const jsonfile = require ('jsonfile');
const { messageLock} = require('../../messageLock');
module.exports.NickPrompt = class NickPrompt extends TextPrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            var dialogUser = messageLock.checkUser(prompt.context.activity.from.id);
            if(dialogUser === false){
                await prompt.context.sendActivity("Command is currently in session. Please allow the student to complete requests.")
                return false;
            } else{
                    if (!prompt.recognized.succeeded) {
                        await prompt.context.sendActivity('Please tell me your nick name.');
                        return false;
                    } else {
                        const value = prompt.recognized.value;
                        if (value.length < 1) {
                            await prompt.context.sendActivity('Your name has to include at least one character.');
                            return false;
                        } else if (value.length > 50) {
                            await prompt.context.sendActivity(`Sorry, but I can only handle names of up to 50 characters. Yours was ${ value.length }.`);
                            return false;
                        } else {
                            return true;
                        }
                    }
            }
        });
    }
};
