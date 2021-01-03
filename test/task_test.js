const { ConversationState, MemoryStorage, TestAdapter, UserState } = require("botbuilder");
const{ DialogSet, DialogTurnStatus } = require("botbuilder-dialogs");
const { TaskDialog } = require('../taskDialog.js');

describe("TaskDialog test cases", function(){
    this.timeout(5000);

        it("should fail on incorrect task", async() => {
            const conversationState = new ConversationState(new MemoryStorage());
            const userState = new UserState(new MemoryStorage());
            const DIALOG_STATE_PROPERTY = 'dialogState';
            const USER_INFO_PROPERTY = 'userInfoPropertyAccessor'
            const dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
            const userInfoAccessor = userState.createProperty(USER_INFO_PROPERTY);
            const dialogs = new DialogSet(dialogState);
            dialogs.add(new TaskDialog("prompt"));
            const adapter = new TestAdapter(async (context) => {
                const dc = await dialogs.createContext(context);
                const results = await dc.continueDialog();
                const user = await userInfoAccessor.get(context, {});
                user.profile = {
                    "Name":"User1",
                    "team":"Team1",
                    "class":"MA441",
                    "Email":"darby.bernard@gmail.com",
                    "Nick":"Tim"
                }
                if(context.activity.text === '!task'){
                    await dc.beginDialog("prompt", user)      
                } else if(results.status === DialogTurnStatus.complete){
                    const reply = results.result.toString();
                    await context.sendActivity(reply);
                }
                await conversationState.saveChanges(context);
        });
        await adapter.test("!task", "What task would you like to see? (1) week1 or (2) tutorial")
            .send("Blah")
            .assertReply(`Sorry, the task "Blah" is not on my list.`)
    });
});