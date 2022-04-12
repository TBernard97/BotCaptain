const { CardFactory } = require('botbuilder');
const { ComponentDialog,  WaterfallDialog } = require('botbuilder-dialogs');
const AdaptiveCard = require('../cards/TestCard.json');

const ROLE_WATERFALL_DIALOG = 'roleWaterfallDialog';

class RoleDialog extends ComponentDialog {
    constructor(id) {
        super(id);

        // Define the main dialog and its related components.
        this.addDialog(new WaterfallDialog(ROLE_WATERFALL_DIALOG, [
            this.showCardStep.bind(this)
        ]));

        // The initial child Dialog to run.
        this.initialDialogId = ROLE_WATERFALL_DIALOG;
    }

    async showCardStep(stepContext) {
        await stepContext.context.sendActivity({
            attachments: [
                this.createAdaptiveCard()
            ],
        });
        return await stepContext.endDialog();
    }
   
    
    createAdaptiveCard() {
        return CardFactory.adaptiveCard(AdaptiveCard);
    }

}

module.exports.RoleDialog = RoleDialog;