const { TextPrompt } = require('botbuilder-dialogs');
const jsonfile = require('jsonfile');
const { messageLock } = require('../../messageLock');

var today = new Date();

//Need this to declare proper lower bound
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = yyyy + '-' +  mm + '-' + dd  

const DATE_LOW_BOUNDS = new Date(today);

module.exports.TimePrompt = class TimePrompt extends TextPrompt {

    constructor(dialogId){
        super(dialogId, async(prompt) => {
            var dialogUser = messageLock.checkUser(prompt.context.activity.from.id);
            if(dialogUser === false){
                await prompt.context.sendActivity("Command is currently in session. Please allow the student to complete requests.")
                return false;
            } else{
                if(!prompt.recognized.succeeded){
                    await prompt.context.sendActivity('Please enter a valid time based off 24-hour clock.')
                    return false;
                } else {
                    const timeValidator = new RegExp('^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$')
                    var time = prompt.context.activity.text;
                    if(timeValidator.test(time) == false){
                        await prompt.context.sendActivity(`The time ${time} is not valid. Please send a time based of 24-hour clock like 17:30 or 05:30.`)
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