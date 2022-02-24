const { ComponentDialog, TextPrompt, WaterfallDialog, DialogTurnStatus} = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');
const taskId = 'taskDialog';
const jsonfile = require('jsonfile');
//Prompt for Task
const { TaskPrompt } = require('./prompts/taskPrompt');
const GET_TASK_PROMPT = 'taskPrompt';
//Import a card template
const TaskCard = require('./cards/TaskCard.json');
const { fileIO } = require('./fileIO.js');
const { xAPI_Statements } = require('./xAPI_Statements.js');
const { profileAccessor } = require('./profileAccessor');
const xAPI_Handler = new xAPI_Statements();

class AssignDialog extends ComponentDialog {
    
    constructor(id){
        super(id);
        this.initialDialogId = taskId;

        this.addDialog(new TextPrompt('textPrompt'));

        this.addDialog(new WaterfallDialog(taskId, [
            this.promptForTask.bind(this),
            this.captureTask.bind(this),
            this.buildCard.bind(this),
            this.showCardStep.bind(this),
            this.captureStudent.bind(this),
            this.recordVote.bind(this)
         ]));

         //Add Prompts
         //GET_TASK_PROMPT Will validate user tasks
         this.addDialog(new TaskPrompt(GET_TASK_PROMPT));

    }

    async promptForTask(step){
        step.values.task = {};
        
        //Need to read profiles to get proper vote count. Profile passed to function may not have proper vote count.
        step.values.profileTable = jsonfile.readFileSync(`Resources/Classes/${step.options.profile.class}/profiles.json`);
        step.values.profile = step.values.profileTable[`${step.options.profile.name}`];

        //Used for indexing based on user count
        step.values.profileNamesList = Object.keys(step.values.profileTable);
        
        step.values.tasksTable = jsonfile.readFileSync(`Resources/Classes/${step.values.profile.class}/Teams/${step.values.profile.team}/tasks.json`);
        step.values.tasksList = Object.keys(step.values.tasksTable);

        step.values.voteTable = jsonfile.readFileSync(`Resources/Classes/${step.values.profile.class}/Teams/${step.values.profile.team}/votes.json`);

        

        return await step.prompt(GET_TASK_PROMPT, 'What task would you like to assign?',step.values.tasksList);
    }

    async captureTask(step){
       
        step.values.task_id = step.result.value;
        step.values.task = step.values.tasksTable[`${step.result.value}`];

        //If student already voted for a leader, don't even bother with remaining portions of dialog
        if(step.values.profile.votes[`${step.values.task_id}`] === true){
            await step.context.sendActivity("You already voted for someone to lead this task");
            return await step.endDialog(step.values.profile); 
        } else{
            return await step.next();
        }

    }

    async buildCard(step){

        TaskCard["body"][0].id = step.values.task_id;
        TaskCard["body"][3].text = step.values.task.description;
        // Remove users from old state (accommodation for card import)
        TaskCard["body"][5].choices.length = 0;
        
        // Enumerate over each user in callers team and add to choices in card
        for (var user in step.values.profileNamesList){
            var choices = TaskCard["body"][5].choices;
            if(step.values.profile.team == step.values.profileTable[step.values.profileNamesList[user]].team){
                if(choices[user] != undefined){
                    choices[user] = {"title": "", "value": ""};
                    choices[user].title = step.values.profileTable[step.values.profileNamesList[user]].nick;  
                    choices[user].value = step.values.profileTable[step.values.profileNamesList[user]].nick;
                } else {
                    var choiceObject = {"title": "", "value": ""};
                    choiceObject.title = step.values.profileTable[step.values.profileNamesList[user]].nick; 
                    choiceObject.value = step.values.profileTable[step.values.profileNamesList[user]].nick; 
                    choices.push(choiceObject);
                }
                
           
            }
      
        }

        return await step.next();
    }

    async showCardStep(step) {
        await step.context.sendActivity({
            attachments: [
                this.createAdaptiveCard()
            ],
        });
        return { status: DialogTurnStatus.waiting };
    }

    async captureStudent(step){
        
        var user_nicks = [];
        for (var user in step.values.profileNamesList){
            if(step.values.profile.team == step.values.profileTable[step.values.profileNamesList[user]].team){
                user_nicks.push(step.values.profileTable[step.values.profileNamesList[user]].nick);
            }
      
        }

        //If user enters text instead of using card, ensure user is valid (i.e. User is present in the )
        if(step.context.activity.value != undefined){
            step.values.vote = step.context.activity.value;
            return await step.next();
        } else if(step.context.activity.text != undefined && user_nicks.includes(step.context.activity.text)){
            step.values.vote = {"leaderSelection": `${step.context.activity.text}`};
            return await step.next();
        } else {
            await step.context.sendActivity("Need a valid user. Ending dialog.");
        
            return await step.endDialog();
        }
    
    }

    async recordVote(step){

        const votePath = `Resources/Classes/${step.values.profile.class}/Teams/${step.values.profile.team}/votes.json`;

        var leaderVoteObject = {votes:0};
        
        // If vote table has student entry, simply add one.  
        // Else need to compensate for student not present or task table entry itself not being present
        if(step.values.voteTable[`${step.values.task_id}`] != undefined && step.values.voteTable[`${step.values.task_id}`][`${step.values.vote.leaderSelection}`] != undefined){
            step.values.voteTable[`${step.values.task_id}`][`${step.values.vote.leaderSelection}`].votes = step.values.voteTable[`${step.values.task_id}`][`${step.values.vote.leaderSelection}`].votes + 1; 
            jsonfile.writeFileSync(votePath, step.values.voteTable, {flags:'w'});

        } else if(step.values.voteTable[`${step.values.task_id}`] != undefined && step.values.voteTable[`${step.values.task_id}`][`${step.values.vote.leaderSelection}`] === undefined) {
            leaderVoteObject.votes = 1;
            step.values.voteTable[`${step.values.task_id}`][`${step.values.vote.leaderSelection}`] = leaderVoteObject;
            jsonfile.writeFileSync(votePath, step.values.voteTable, {flags:'w'});

        } else {

            step.values.voteTable[`${step.values.task_id}`] = {};
            leaderVoteObject.votes = 1;
            step.values.voteTable[`${step.values.task_id}`][`${step.values.vote.leaderSelection}`] = leaderVoteObject;
            jsonfile.writeFileSync(votePath, step.values.voteTable, {flags:'w'});

        }
        
        // Remove current user from choices when completed (workaround due to state being held on card import)
        TaskCard["body"][5].choices.length = 0;
        
        let task_id=step.values.task_id;

        xAPI_Handler.recordRoleAssignment(step.options.profile.email, step.options.profile.nick, step.values.vote.leaderSelection, step.values.task_id);
        
        var voteValue= {};
        voteValue[`${task_id}`]=true;
        let key='votes';
        //profileUpdate returns the modified profile,
        // which we again return into message parser to keep things consistent
        step.values.profile=profileAccessor.profileUpdate(step.values.profile, key , voteValue) ;
        await step.context.sendActivity(`Voted for ${step.values.vote.leaderSelection} to lead ${step.values.task_id}`);
        
        return await step.endDialog(step.values.profile);
    }
   
    
    createAdaptiveCard() {
        return CardFactory.adaptiveCard(TaskCard);
    }



}


exports.AssignDialog=AssignDialog;