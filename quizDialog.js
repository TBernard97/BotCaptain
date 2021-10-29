const { ComponentDialog, TextPrompt, WaterfallDialog} = require('botbuilder-dialogs');
const quizId = 'quizDialog';
const fs = require('fs');
const jsonfile = require('jsonfile');
//Module for starting a quiz
//const {quiz} = require('./quiz.js');
//Prompt for Date
const { DatePrompt } = require('./prompts/quizPrompt');

//Module for recording xAPI statements
const { xAPI_Statements } = require('./xAPI_Statements');


class QuizDialog extends ComponentDialog {
    
    constructor(id){
        super(id);
        this.initialDialogId = quizID; //*** Not needed? */

        this.addDialog(new TextPrompt('textPrompt')); 

        this.addDialog(new WaterfallDialog(reminderId, [
            this.promptForTask.bind(this),
            this.captureTask.bind(this),
            this.promptForDate.bind(this),
            this.promptForTime.bind(this),
            this.completeReminder.bind(this)
         ]));

        //Create xAPI_Handler Object
        this.xAPI_Handler = new xAPI_Statements();
        
        //Add Prompts
        //GET_TASK_PROMPT Will validate user tasks
        this.addDialog(new QuizPrompt(GET_TASK_PROMPT));

    }

    async promptForTask(step){
        step.values.task = {};
        step.values.profile = {};
        step.values.profile = step.options.profile;
        var tasks = jsonfile.readFileSync(`./Resources/Classes/${step.values.profile.class}/Teams/${step.values.profile.team}/quizes.json`);
        let task_list = Object.keys(tasks);
        return await step.prompt(GET_TASK_PROMPT, 'What Quiz would you like to see?',task_list);
    }

    async captureTask(step){
        var tasks = jsonfile.readFileSync(`./Resources/Classes/${step.values.profile.class}/Teams/${step.values.profile.team}/quizes.json`);
        step.values.task = tasks[`${step.result.value}`]
        return await step.next();
    }

    /*async promptForDate(step){
        step.values.date = {}
        return await step.prompt(GET_DATE_PROMPT, 'What date would you like this reminder to be sent?');
    }

    async promptForTime(step){
        step.values.date = step.result;
        step.values.time = {}
        return await step.prompt(GET_TIME_PROMPT, 'What time would you like this reminder to be sent?');
    }
*/
  /*  async completeQuiz(step){
        //step.values.time = step.result;
        //step.values.schedule = {};
        //step.values.schedule.date = step.values.date[0].value;
        //step.values.schedule.task = step.values.task.description;
        //scheduler.email(`${step.values.profile.email}`,`${step.values.schedule.date}`, `${step.values.time}`, `${step.values.schedule.task}`);
        //this.xAPI_Handler.recordSchedule(step.values.profile.email);
        await step.context.sendActivity(`Reminder will be sent to ${step.values.profile.email}, on ${step.values.schedule.date}, at ${step.values.time}.`)
        return await step.endDialog(step.values.schedule);
    }
*/


}


exports.QuizDialog=QuizDialog;