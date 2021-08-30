const { ConversationState, MemoryStorage, TestAdapter, UserState } = require("botbuilder");
const{ DialogSet, DialogTurnStatus } = require("botbuilder-dialogs");
const { ReminderDialog } = require('../reminderDialog.js');

describe("ReminderDialog test cases", function(){
    this.timeout(5000);

    it("should fail on incorrect task", async() => {
        const conversationState = new ConversationState(new MemoryStorage());
        const userState = new UserState(new MemoryStorage());
        const DIALOG_STATE_PROPERTY = 'dialogState';
        const USER_INFO_PROPERTY = 'userInfoPropertyAccessor'
        const dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        const userInfoAccessor = userState.createProperty(USER_INFO_PROPERTY);
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new ReminderDialog("prompt"));
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
            if(context.activity.text === '!remind'){
                await dc.beginDialog("prompt", user)      
            } else if(results.status === DialogTurnStatus.complete){
                const reply = results.result.toString();
                await context.sendActivity(reply);
            }
            await conversationState.saveChanges(context);
        });
        await adapter.test("!remind", "What task would you like to see? (1) week1 or (2) tutorial")
        .send("Blah")
        .assertReply(`Sorry, the task "Blah" is not on my list.`)
    });


    it("should fail on date to low", async() => {
        const conversationState = new ConversationState(new MemoryStorage());
        const userState = new UserState(new MemoryStorage());
        const DIALOG_STATE_PROPERTY = 'dialogState';
        const USER_INFO_PROPERTY = 'userInfoPropertyAccessor'
        const dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        const userInfoAccessor = userState.createProperty(USER_INFO_PROPERTY);
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new ReminderDialog("prompt"));
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
            if(context.activity.text === '!remind'){
                await dc.beginDialog("prompt", user)      
            } else if(results.status === DialogTurnStatus.complete){
                const reply = results.result.toString();
                await context.sendActivity(reply);
            }
            await conversationState.saveChanges(context);
        });
        await adapter.test("!remind", "What task would you like to see? (1) week1 or (2) tutorial")
        .send("week1")
        .assertReply("What date would you like this reminder to be sent?")
        .send("2005-10-14")
        .assertReply("You cannot set a reminder for the past...")
        .assertReply('Answer with a date like 1978-01-25 or say "cancel".')
    });

    it("should fail on date to high", async() => {
        const conversationState = new ConversationState(new MemoryStorage());
        const userState = new UserState(new MemoryStorage());
        const DIALOG_STATE_PROPERTY = 'dialogState';
        const USER_INFO_PROPERTY = 'userInfoPropertyAccessor'
        const dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        const userInfoAccessor = userState.createProperty(USER_INFO_PROPERTY);
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new ReminderDialog("prompt"));
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
            if(context.activity.text === '!remind'){
                await dc.beginDialog("prompt", user)      
            } else if(results.status === DialogTurnStatus.complete){
                const reply = results.result.toString();
                await context.sendActivity(reply);
            }
            await conversationState.saveChanges(context);
        });
        await adapter.test("!remind", "What task would you like to see? (1) week1 or (2) tutorial")
        .send("week1")
        .assertReply("What date would you like this reminder to be sent?")
        .send("2022-10-29")
        .assertReply('The Date Fri Oct 28 2022 20:00:00 GMT-0400 (Eastern Daylight Time) is too far away')
        .assertReply('Answer with a date like 1978-01-25 or say "cancel".')
    });

    it("should fail on date with characters", async() => {
        const conversationState = new ConversationState(new MemoryStorage());
        const userState = new UserState(new MemoryStorage());
        const DIALOG_STATE_PROPERTY = 'dialogState';
        const USER_INFO_PROPERTY = 'userInfoPropertyAccessor'
        const dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        const userInfoAccessor = userState.createProperty(USER_INFO_PROPERTY);
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new ReminderDialog("prompt"));
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
            if(context.activity.text === '!remind'){
                await dc.beginDialog("prompt", user)      
            } else if(results.status === DialogTurnStatus.complete){
                const reply = results.result.toString();
                await context.sendActivity(reply);
            }
            await conversationState.saveChanges(context);
        });
        await adapter.test("!remind", "What task would you like to see? (1) week1 or (2) tutorial")
        .send("week1")
        .assertReply("What date would you like this reminder to be sent?")
        .send("blah")
        .assertReply('Answer with a date like 1978-01-25 or say "cancel".')
    });
        
    it("should fail on incorrect time", async() => {
        const conversationState = new ConversationState(new MemoryStorage());
        const userState = new UserState(new MemoryStorage());
        const DIALOG_STATE_PROPERTY = 'dialogState';
        const USER_INFO_PROPERTY = 'userInfoPropertyAccessor'
        const dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        const userInfoAccessor = userState.createProperty(USER_INFO_PROPERTY);
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new ReminderDialog("prompt"));
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
            if(context.activity.text === '!remind'){
                await dc.beginDialog("prompt", user)      
            } else if(results.status === DialogTurnStatus.complete){
                const reply = results.result.toString();
                await context.sendActivity(reply);
            }
            await conversationState.saveChanges(context);
        });
        await adapter.test("!remind", "What task would you like to see? (1) week1 or (2) tutorial")
        .send("week1")
        .assertReply("What date would you like this reminder to be sent?")
        .send("2021-12-20")
        .assertReply("What time would you like this reminder to be sent?")
        .send("7:30")
        .assertReply("The time 7:30 is not valid. Please send a time based of 24-hour clock like 17:30 or 05:30.")
    });


    

});