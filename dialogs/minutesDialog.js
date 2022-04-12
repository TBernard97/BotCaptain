const { ComponentDialog, TextPrompt, WaterfallDialog} = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');
const minutesId = 'minutesDialog';

const jsonfile = require('jsonfile');


const MinutesCard = require('../cards/MinutesCard.json');


class MinutesDialog extends ComponentDialog {

    constructor(id){
        super(id);
        this.initialDialogId = minutesId;

        this.addDialog(new WaterfallDialog(minutesId, [
            this.buildCard.bind(this),
            this.showCardStep.bind(this)
        ]));
    }

    async buildCard(step){
      
        var tasks = jsonfile.readFileSync(`Resources/Classes/${step.options.profile.class}/Teams/${step.options.profile.team}/tasks.json`);
        let tasks_list = Object.keys(tasks);
        
        
        for (var task in tasks_list){
            var choices = MinutesCard["body"][2].choices
            var choiceObject = {"title": "", "value": ""};
        
            choiceObject.title = tasks_list[task];  
            choiceObject.value = tasks_list[task];
            
            choices.push(choiceObject);
        }

        return await step.next();
    }

    async showCardStep(stepContext) {
        await stepContext.context.sendActivity({
            attachments: [
                this.createAdaptiveCard()
            ],
        });
        
        //Remove current choices in task form (workaround due to state being held on card import)
         MinutesCard["body"][2].choices.length = 0;
        
        
        return await stepContext.endDialog();
    }

    createAdaptiveCard() {
        return CardFactory.adaptiveCard(MinutesCard);
    }
}

module.exports.MinutesDialog = MinutesDialog;