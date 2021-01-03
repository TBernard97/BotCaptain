const { ConversationState, MemoryStorage, TestAdapter } = require("botbuilder");
const{ DialogSet, DialogTurnStatus } = require("botbuilder-dialogs");
const { ProfileDialog } = require('../profileDialog');
const jsonfile = require('jsonfile');

describe("ProfileDialog tests cases", function (){
    this.timeout(5000);
    it("should call ProfileDialog when wake word comes up", async () => {
        const conversationState = new ConversationState(new MemoryStorage());
        const dialogState = conversationState.createProperty("dialogState");
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new ProfileDialog("prompt"));
        const adapter = new TestAdapter(async (context) => {
            const dc = await dialogs.createContext(context);
            let activityId = context.activity.from.id
            jsonfile.writeFileSync('./dialogID.json', activityId, {flag: 'w'})
            const results = await dc.continueDialog();
            if(results.status === DialogTurnStatus.empty){
                await dc.prompt("prompt", "Hello User1. Please answer the following questions to setup your profile.")
            }
             else if(results.status === DialogTurnStatus.complete){
                 const reply = results.result.toString();
                 await context.sendActivity(reply);
             }
             await conversationState.saveChanges(context);
        });
        await adapter.test("Hello", "Hello User1. Please answer the following questions to setup your profile.")
            .assertReply("What class are you in?")
            .send("MA441")
            .assertReply('Welcome to MA441');
    });
    it("should fail on incorrect class", async () => {
        const conversationState = new ConversationState(new MemoryStorage());
        const dialogState = conversationState.createProperty("dialogState");
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new ProfileDialog("prompt"));
        const adapter = new TestAdapter(async (context) => {
            const dc = await dialogs.createContext(context);
            const results = await dc.continueDialog();
            if(results.status === DialogTurnStatus.empty){
                await dc.prompt("prompt", "Hello User1. Please answer the following questions to setup your profile.")
            }
             else if(results.status === DialogTurnStatus.complete){
                 const reply = results.result.toString();
                 await context.sendActivity(reply);
             }
             await conversationState.saveChanges(context);
        });
        await adapter.test("Hello", "Hello User1. Please answer the following questions to setup your profile.")
            .assertReply("What class are you in?")
            .send("MA442")
            .assertReply('The class MA442 does not exist.');
    });

    it("should fail on incorrect team", async () => {
        const conversationState = new ConversationState(new MemoryStorage());
        const dialogState = conversationState.createProperty("dialogState");
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new ProfileDialog("prompt"));
        const adapter = new TestAdapter(async (context) => {
            const dc = await dialogs.createContext(context);
            const results = await dc.continueDialog();
            if(results.status === DialogTurnStatus.empty){

                await dc.prompt("prompt", "Hello User1. Please answer the following questions to setup your profile.")
            }
             else if(results.status === DialogTurnStatus.complete){
                 const reply = results.result.toString();
                 await context.sendActivity(reply);
             }
             await conversationState.saveChanges(context);
        });
        await adapter.test("Hello", "Hello User1. Please answer the following questions to setup your profile.")
            .assertReply("What class are you in?")
            .send("MA441")
            .assertReply("Welcome to MA441")
            .assertReply("What team are you in? (1) Team1 or (2) Team2")
            .send("Team0")
            .assertReply('Sorry, "Team0" is not on my list.')
    });

    it("should fail on incorrect email", async () => {
        const conversationState = new ConversationState(new MemoryStorage());
        const dialogState = conversationState.createProperty("dialogState");
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new ProfileDialog("prompt"));
        const adapter = new TestAdapter(async (context) => {
            const dc = await dialogs.createContext(context);
            const results = await dc.continueDialog();
            if(results.status === DialogTurnStatus.empty){
                await dc.prompt("prompt", "Hello User1. Please answer the following questions to setup your profile.")
            }
             else if(results.status === DialogTurnStatus.complete){
                 const reply = results.result.toString();
                 await context.sendActivity(reply);
             }
             await conversationState.saveChanges(context);
        });
        await adapter.test("Hello", "Hello User1. Please answer the following questions to setup your profile.")
            .assertReply("What class are you in?")
            .send("MA441")
            .assertReply("Welcome to MA441")
            .assertReply("What team are you in? (1) Team1 or (2) Team2")
            .send("Team1")
            .assertReply('Confirmed. You will recieve tasks for Team1.')
            .assertReply("What is your email?")
            .send("blah.com")
            .assertReply("Please enter a valid email address.")
    });


    
});