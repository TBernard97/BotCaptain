const { DateTimePrompt } = require('botbuilder-dialogs');
const { messageLock } = require('../../messageLock');
// var Recognizers = require('@microsoft/recognizers-text-suite');
// var myCulture = Recognizers.Culture.English;

var today = new Date();

//Need this to declare proper lower bound
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = yyyy + '-' +  mm + '-' + dd  

const DATE_LOW_BOUNDS = new Date(today);

const DATE_HIGH_BOUNDS = new Date('2022, 01, 01');


module.exports.DatePrompt = class DatePrompt extends DateTimePrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            var dialogUser = messageLock.checkUser(prompt.context.activity.from.id);
            if(dialogUser === false){
                await prompt.context.sendActivity("Command is currently in session. Please allow the student to complete requests.")
                return false;
                } else{
                        try {

                            if (!prompt.recognized.succeeded) {
                                throw new Error('No date found.');
                            }
                            
                            const values = prompt.recognized.value;
                        
                            if (!Array.isArray(values) || values.length < 0) { throw new Error('Missing time.'); }
                            if ((values[0].type !== 'datetime') && (values[0].type !== 'date')) { throw new Error('Unsupported type.'); }
                            
                            const value = new Date(values[0].value);

                            if (value.getTime() < DATE_LOW_BOUNDS.getTime()) {
                                await prompt.context.sendActivity("You cannot set a reminder for the past...")
                                throw new Error('Date too low.');
                            } else if (value.getTime() > DATE_HIGH_BOUNDS.getTime()) {
                                await prompt.context.sendActivity(`The Date ${value} is too far away`)
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
