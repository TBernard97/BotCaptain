const { ComponentDialog, TextPrompt, WaterfallDialog} = require('botbuilder-dialogs');
const quizId = 'quizDialog';
const fs = require('fs');
const jsonfile = require('jsonfile');
const { fileIO } = require('./fileIO');
//Module for sending out emails
const {scheduler} = require('./scheduler.js');



//Module for starting a quiz
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
           
         ]));

        //Create xAPI_Handler Object
        this.xAPI_Handler = new xAPI_Statements();
        
        //Add Prompts
        //GET_TASK_PROMPT Will validate user tasks
        this.addDialog(new QuizPrompt(GET_QUIZ_PROMPT));

    }

    async promptForQuiz(step){
        step.values.quiz = {};
        step.values.profileTable= jsonfile.readFileSync(`./Resources/Classes/${step.options.profile.class}/profiles.json`);
        //get current date
        var today = new Date();
        let date = ("0" + today.getDate()).slice(-2);
        let month = ("0" + (today.getMonth() + 1)).slice(-2);
        let year = today.getFullYear();
        step.values.current_date = year + '-' +  month + '-' + date

        //get current time
        var hours = today.getHours() < 10 ? "0" + today.getHours() : today.getHours();
        var minutes = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
        var seconds = today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds();
        step.values.time = hours + ":" + (minutes+1) + ":" + seconds;
        console.log(step.values.time);
        
        step.values.profile = {};
        step.values.profile = step.values.profileTable[`${step.options.profile.name}`];
        console.log(step.values.profile);
        var quizzes = jsonfile.readFileSync(`./Resources/Classes/${step.values.profile.class}/quizzes.json`);
        let quiz_list = Object.keys(quizzes);
        return await step.prompt(GET_QUIZ_PROMPT, 'What Quiz would you like to see?',quiz_list);
    }

    async captureQuiz(step){
        var quizzes = jsonfile.readFileSync(`./Resources/Classes/${step.values.profile.class}/quizzes.json`);
        step.values.quizName= step.result.value;
        step.values.quiz = quizzes[`${step.result.value}`]
        console.log(step.values.quiz)
        if(step.values.profile.quizzes[`${step.values.quizName}`] == true){
            await step.context.sendActivity("You already completed the quiz");
            return await step.endDialog(); 
        } else{
            return await step.next();
        return await step.next();
    } }

    async promptForQuestion(step){

     await step.context.sendActivity(`Please choose the appropriate answer ${step.values.quiz.question}` )
     return await step.prompt(GET_QUIZ_PROMPT, 'Please choose your answer from the options', step.values.quiz.answers );
    }

    async completeQuiz(step){
        step.values.useranswer = step.result.value;
        console.log(step.values.useranswer);
        console.log(step.values.quiz.correctAnswer);
        if(step.values.useranswer == step.values.quiz.correctAnswer){
        await step.context.sendActivity("correct")
        this.xAPI_Handler.recordQuizPass(step.values.profile.email);
        await step.context.sendActivity(`Quiz result will be sent to:  ${step.values.profile.email}`);
        step.values.message=`${step.values.quizName} Quiz result: Congrats! you studied!`;
        }
        
        else{
        await step.context.sendActivity(`wrong response, correct answer = ${step.values.quiz.correctAnswer}`  );
        this.xAPI_Handler.recordQuizFail(step.values.profile.email);
        step.values.message=`${step.values.quizName} Quiz result: I am disappointed in you. Study harder`;
        }
        console.log(step.values.quiz);

        step.values.profile.quizzes[`${step.values.quizName}`] = true;
        fileIO.insertProfile(step.values.profile);

        scheduler.email(`${step.values.profile.email}`,`${step.values.current_date}`, `${step.values.time}`, `${step.values.message}`);
        
        console.log(step.values.profile.quizzes);
        return await step.endDialog();


    }

 

}


exports.QuizDialog=QuizDialog;