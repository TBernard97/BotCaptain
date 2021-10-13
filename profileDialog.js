const { ComponentDialog, TextPrompt, WaterfallDialog} = require('botbuilder-dialogs');
const profileId = 'profileDialog';
const fs = require('fs');

//Prompt for class
const { ClassPrompt } = require('./prompts/classPrompt');
const GET_CLASS_PROMPT = 'classPrompt';

//Prompt for team
const { TeamPrompt } = require('./prompts/teamPrompt')
const GET_TEAM_PROMPT = 'teamPrompt'

//Prompt for email
const { EmailPrompt } = require('./prompts/emailPrompt')
const GET_EMAIL_PROMPT = 'emailPrompt';



//Prompt for nick
const { NickPrompt } = require('./prompts/nickPrompt');
const { channelValidation } = require('./channelValidation');
const GET_NICK_PROMPT = 'nickPrompt';

class ProfileDialog extends ComponentDialog {
    constructor(id){
        super(id);
        this.initialDialogId = profileId;

        this.addDialog(new TextPrompt('textPrompt'));

        this.addDialog(new WaterfallDialog(profileId, [
            this.promptForClass.bind(this),
            this.promptForTeam.bind(this),
            this.captureTeam.bind(this),
            this.promptForEmail.bind(this),
            this.promptForNick.bind(this),
            this.completeProfile.bind(this)
         ]));

         //Add Prompts
         //GET_CLASS_PROMPT Will validate that the class actually exists
         this.addDialog(new ClassPrompt(GET_CLASS_PROMPT));
         
         //GET_TEAM_PROMPT Will validate the correct team is selected
         this.addDialog(new TeamPrompt(GET_TEAM_PROMPT));

         //GET_EMAIL_PROMPT Will validate user email
         this.addDialog(new EmailPrompt(GET_EMAIL_PROMPT));

         //GET_NICK_PROMPT Will validate users nick name
         this.addDialog(new NickPrompt(GET_NICK_PROMPT));

    }

    async promptForClass(step){
        step.values.user = {}
        await step.context.sendActivity(`Hello ${step.context.activity.from.name}. Please answer the following questions to setup your profile.`);
        return await step.prompt(GET_CLASS_PROMPT, 'What class are you in?');
    }

    async promptForTeam(step){
        step.values.user.class = step.result;
        await step.context.sendActivity(`Welcome to ${step.values.user.class}`);
        const teams = fs.readdirSync(`./Resources/Classes/${step.values.user.class}/Teams`)
        return await step.prompt(GET_TEAM_PROMPT, 'What team are you in?', teams)
    }

    async captureTeam(step){
        step.values.user.team = step.result.value;
        return await step.next();
    }

    async promptForEmail(step){
        await step.context.sendActivity(`Confirmed. You will recieve tasks for ${step.values.user.team}.`);
        return await step.prompt(GET_EMAIL_PROMPT, 'What is your email?');
    }

    async promptForNick(step){
        step.values.user.email = step.result;
        step.values.user.email = channelValidation.validateChannel(step.context);
        await step.context.sendActivity(`All future emails will be sent to ${step.values.user.email}`);
        return await step.prompt(GET_NICK_PROMPT, 'What would you like your nickname to be?')
    }

    async completeProfile(step){
        step.values.user.nick = step.result;
        step.values.user.votes = {};
        return await step.endDialog(step.values.user);
    }



}

exports.ProfileDialog = ProfileDialog;