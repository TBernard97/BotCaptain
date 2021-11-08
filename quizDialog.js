const { ComponentDialog, TextPrompt, WaterfallDialog} = require('botbuilder-dialogs');
const quizId = 'quizDialog';
const fs = require('fs');
const jsonfile = require('jsonfile');
//Module for starting a quiz
//const {quiz} = require('./quiz.js');
//Prompt for Date
const { QuizPrompt } = require('./prompts/quizPrompt');
const GET_QUIZ_PROMPT = 'quizPrompt';

//Module for recording xAPI statements
const { xAPI_Statements } = require('./xAPI_Statements');


class QuizDialog extends ComponentDialog {
    
    constructor(id){
        super(id);
        this.initialDialogId = quizId; //*** Not needed? */

        this.addDialog(new TextPrompt('textPrompt')); 

        this.addDialog(new WaterfallDialog(quizId, [
            this.promptForQuiz.bind(this),
            this.captureQuiz.bind(this),
            this.promptForQuestion.bind(this),
            this.completeQuiz.bind(this),
            //this.completeReminder.bind(this)
         ]));

        //Create xAPI_Handler Object
        this.xAPI_Handler = new xAPI_Statements();
        
        //Add Prompts
        //GET_TASK_PROMPT Will validate user tasks
        this.addDialog(new QuizPrompt(GET_QUIZ_PROMPT));

    }

    async promptForQuiz(step){
        step.values.quiz = {};
        step.values.profile = {};
        step.values.profile = step.options.profile;
        var quizzes = jsonfile.readFileSync(`./Resources/Classes/${step.values.profile.class}/quizzes.json`);
        let quiz_list = Object.keys(quizzes);
        return await step.prompt(GET_QUIZ_PROMPT, 'What Quiz would you like to see?',quiz_list);
    }

    async captureQuiz(step){
        var quizzes = jsonfile.readFileSync(`./Resources/Classes/${step.values.profile.class}/quizzes.json`);
        step.values.quiz = quizzes[`${step.result.value}`]
        return await step.next();
    }

    async promptForQuestion(step){
     //   var quizzes = jsonfile.readFileSync(`./Resources/Classes/${step.values.profile.class}/quizzes.json`);
     //  let quiz_list = Object.keys(quizzes['step.values.quiz']);
     //   step.values.question = step.value.quiz.
     await step.context.sendActivity(`Please choose the appropriate answer ${step.values.quiz.question}` )
     return await step.prompt(GET_QUIZ_PROMPT, 'Please choose your answer from the options', step.values.quiz.answers );
    }

    async completeQuiz(step){
        step.values.useranswer = step.result.value;
        console.log(step.values.useranswer);
        console.log(step.values.quiz.correctAnswer);
        if(step.values.useranswer == step.values.quiz.correctAnswer){
        await step.context.sendActivity("correct")
        this.xAPI_Handler.recordQuiz(step.values.profile.email);
        await step.context.sendActivity(`Quiz result will be sent to:  ${step.values.profile.email}`);
        }
        
        else
        await step.context.sendActivity(`wrong, correct answer = ${step.values.quiz.correctAnswer}`  );
        //step.values.time = {}
        return await step.endDialog();


    }

 /*   async completeQuiz(step){
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