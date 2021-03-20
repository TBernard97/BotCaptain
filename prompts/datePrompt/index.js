const { DateTimePrompt } = require('botbuilder-dialogs');
const { fileIO } = require('../../fileIO')
const { log } = require('../../logger')
// var Recognizers = require('@microsoft/recognizers-text-suite');
// var myCulture = Recognizers.Culture.English;

var today = new Date();

//Need this to declare proper lower bound

let date = ("0" + today.getDate()).slice(-2);
let month = ("0" + (today.getMonth() + 1)).slice(-2);
let year = today.getFullYear();


current_date = year + '-' +  month + '-' + date

const DATE_LOW_BOUNDS = new Date(current_date);

const DATE_HIGH_BOUNDS = new Date('2022, 01, 01');


module.exports.DatePrompt = class DatePrompt extends DateTimePrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            var dialogUser = fileIO.checkDialog(prompt.context.activity.channelId,prompt.context.activity.from.id);
            if(dialogUser === false){
                await prompt.context.sendActivity("Command is currently in session. Please allow the student to complete requests.")
                log.debug(`Student attempted to talk during dialog.`);
                return false;
                } else{
                        try {

                            if (!prompt.recognized.succeeded) {
                                log.error(`No date was found in entry.`);
                                throw new Error('No date found.');
                            }
                            
                            const values = prompt.recognized.value;
                        
                            if (!Array.isArray(values) || values.length < 0) { 
                                log.error(`No time was found in entry.`);
                                throw new Error('Missing time.'); 
                            }
                            
                            if ((values[0].type !== 'datetime') && (values[0].type !== 'date')) { 
                                log.error(`Bad data type entered.`);
                                throw new Error('Unsupported type.'); 
                            }
                            
                            const value = new Date(values[0].value);

                            if (value.getTime() < DATE_LOW_BOUNDS.getTime()) {
                                await prompt.context.sendActivity("You cannot set a reminder for the past...");
                                log.error(`Student attempted to set a reminder for the past.`);
                                throw new Error('Date too low.');
                            } else if (value.getTime() > DATE_HIGH_BOUNDS.getTime()) {
                                await prompt.context.sendActivity(`The Date ${value} is too far away`);
                                log.error(`Student attempted to set a reminder too far ahead.`);
                                throw new Error('Date too high.');
                            }

                            return true;
                        } catch (err) {
                            await prompt.context.sendActivity(`Answer with a date like 1978-01-25 or say "cancel".`);
                            return false;
                        }
                    }
                });
            }
        };
