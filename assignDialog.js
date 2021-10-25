const { ComponentDialog, TextPrompt, WaterfallDialog, DialogTurnStatus} = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');
const taskId = 'taskDialog';
const jsonfile = require('jsonfile');
const xAPI = require('./xAPI_Statements.js');
//Prompt for Task
const { TaskPrompt } = require('./prompts/taskPrompt');
const GET_TASK_PROMPT = 'taskPrompt';
//Import a card template
const TaskCard = require('./cards/TaskCard.json');
const { fileIO } = require('./fileIO.js');

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
        
        //Need to read profiles to get proper vote count
        step.values.profileTable = jsonfile.readFileSync(`Resources/Classes/${step.options.profile.class}/profiles.json`);
        step.values.profile = step.values.profileTable[`${step.options.profile.name}`];

        var tasks = jsonfile.readFileSync(`Resources/Classes/${step.values.profile.class}/Teams/${step.values.profile.team}/tasks.json`);
        let task_list = Object.keys(tasks);
        return await step.prompt(GET_TASK_PROMPT, 'What task would you like to assign?',task_list);
    }

    async captureTask(step){
        var tasks = jsonfile.readFileSync(`Resources/Classes/${step.values.profile.class}/Teams/${step.values.profile.team}/tasks.json`);
        step.values.task_id = step.result.value;
        step.values.task = tasks[`${step.result.value}`];

        //If student already voted for a leader, don't even bother with remaining portions of dialog
        if(step.values.profile.votes[`${step.values.task_id}`] === true){
            await step.context.sendActivity("You already voted for someone to lead this task");
            return await step.endDialog(); 
        } else{
            return await step.next();
        }

    }

    async buildCard(step){
        var task = step.values.task;
        var task_id = step.values.task_id;
        var profiles = jsonfile.readFileSync(`Resources/Classes/${step.values.profile.class}/profiles.json`);
        TaskCard["body"][0].id = task_id;
        TaskCard["body"][3].text = task.description;
        let profiles_list = Object.keys(profiles);
        
        
        for (var user in profiles_list){
            var choices = TaskCard["body"][5].choices
            let equal = step.values.profile.team == profiles[profiles_list[user]].team;
            if(equal == true){
                if(choices[user] != undefined){
                    choices[user] = {"title": "", "value": ""};
                    choices[user].title = profiles[profiles_list[user]].nick;  
                    choices[user].value = profiles[profiles_list[user]].nick;
                } else {
                    var choiceObject = {"title": "", "value": ""};
                    choiceObject.title = profiles[profiles_list[user]].nick; 
                    choiceObject.value = profiles[profiles_list[user]].nick; 
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
        var profiles = jsonfile.readFileSync(`Resources/Classes/${step.values.profile.class}/profiles.json`);
        let profiles_list = Object.keys(profiles);
        
        var user_nicks = [];
        for (var user in profiles_list){
            let equal = step.values.profile.team == profiles[profiles_list[user]].team;
            if(equal == true){
                user_nicks.push(profiles[profiles_list[user]].nick);
            }
      
        }

        //If use enters text instead of using card, ensure user is valid
        if(step.context.activity.value != undefined){
            step.values.vote = step.context.activity.value;
            return await step.next();
        } else if(step.context.activity.text != undefined && user_nicks.includes(step.context.activity.text)){
            step.values.vote = {"leaderSelection": `${step.context.activity.text}`};
            return await step.next();
        } else {
            await step.context.sendActivity("Need a valid user.");
            return await step.endDialog();
        }
    
    }

    async recordVote(step){

        var votePath = `Resources/Classes/${step.values.profile.class}/Teams/${step.values.profile.team}/votes.json`;
        var votes = jsonfile.readFileSync(votePath);
        let student = step.values.vote.leaderSelection;
        let leaderVoteObject = {votes:0};
        let voteTaskId = votes[`${step.values.task_id}`];
        let xAPI_Handler = new xAPI.xAPI_Statements;
        

        if(voteTaskId != undefined && voteTaskId[`${student}`] != undefined){
            voteTaskId[`${student}`].votes = voteTaskId[`${student}`].votes + 1; 
            jsonfile.writeFileSync(votePath, votes, {flags:'w'});

        } else if(voteTaskId != undefined && voteTaskId[`${student}`] === undefined) {
            
            leaderVoteObject.votes = 1;
            voteTaskId[`${student}`] = leaderVoteObject;
            jsonfile.writeFileSync(votePath, votes, {flags:'w'});

        } else {

            votes[`${step.values.task_id}`] = {};
            leaderVoteObject.votes = 1;
            votes[`${step.values.task_id}`][`${student}`] = leaderVoteObject;
            jsonfile.writeFileSync(votePath, votes, {flags:'w'});

        }
        
        //Remove current user from choices when completed (workaround due to state being held on card import)
        for(var choice in TaskCard["body"][5].choices){
            TaskCard["body"][5].choices.pop(choice);
        }

        xAPI_Handler.recordRoleAssignment(step.options.profile.email, step.options.profile.nick, student, step.values.task_id);
        step.values.profile.votes[`${step.values.task_id}`] = true;
        fileIO.insertProfile(step.values.profile);
        await step.context.sendActivity(`Voted for ${student} to lead ${step.values.task_id}`);
        
        return await step.endDialog();
    }
   
    
    createAdaptiveCard() {
        return CardFactory.adaptiveCard(TaskCard);
    }



}


exports.AssignDialog=AssignDialog;