const { ChoicePrompt } = require('botbuilder-dialogs');
const { log } = require('../../logger');
const { fileIO } = require('../../fileIO')


// This is a custom choice prompt that will emit an error if the user
// types an invalid choice.
module.exports.TeamPrompt = class TeamPrompt extends ChoicePrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            var dialogUser = fileIO.checkDialog(prompt.context.activity.channelId,prompt.context.activity.from.id);
            if(dialogUser === false){
                await prompt.context.sendActivity("Command is currently in session. Please allow the student to complete requests.");
                log.debug(`Student attempted to talk during dialog.`);
                return false;
            } else{
                if (!prompt.recognized.succeeded) {
                    // An invalid choice was received, emit an error.
                    await prompt.context.sendActivity(`Sorry, "${ prompt.context.activity.text }" is not on my list.`);
                    log.error(`Student selected non-existent team.`);
                    return false;
                } else {
                    return true;
                }
            }
        });
    }
};
