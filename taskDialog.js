const { ComponentDialog, TextPrompt, WaterfallDialog} = require('botbuilder-dialogs');
const taskId = 'taskDialog';
const fs = require('fs');
const jsonfile = require('jsonfile');

//Prompt for Task
const { TaskPrompt } = require('./prompts/taskPrompt')
const GET_TASK_PROMPT = 'taskPrompt';




class TaskDialog extends ComponentDialog {
    
    constructor(id){
        super(id);
        this.initialDialogId = taskId;

        this.addDialog(new TextPrompt('textPrompt'));

        this.addDialog(new WaterfallDialog(taskId, [
            this.promptForTask.bind(this),
            this.captureTask.bind(this),
            this.returnTask.bind(this)
         ]));

         //Add Prompts
         //GET_TASK_PROMPT Will validate user tasks
         this.addDialog(new TaskPrompt(GET_TASK_PROMPT));

    }

    async promptForTask(step){
        step.values.task = {};
        step.values.profile = {};
        step.values.profile = step.options.profile;
        var tasks = jsonfile.readFileSync(`./Resources/Classes/${step.values.profile.class}/Teams/${step.values.profile.team}/tasks.json`);
        let task_list = Object.keys(tasks);
        return await step.prompt(GET_TASK_PROMPT, 'What task would you like to see?',task_list);
    }

    async captureTask(step){;
        var tasks = jsonfile.readFileSync(`./Resources/Classes/${step.values.profile.class}/Teams/${step.values.profile.team}/tasks.json`);
        step.values.task = tasks[`${step.result.value}`]
        return await step.next();
    }

    async returnTask(step){
        await step.context.sendActivity(`The description of the task is "${step.values.task.description}". The status of the task states "${step.values.task.status}". The task is due ${step.values.task.date}.`)
        return await step.endDialog(step.values.task);
    }



}


exports.TaskDialog=TaskDialog;