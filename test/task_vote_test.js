const { ConversationState, MemoryStorage, TestAdapter, UserState } = require("botbuilder");
const{ DialogSet, DialogTurnStatus } = require("botbuilder-dialogs");
const { AssignDialog } = require('../assignDialog');
const { fileIO } = require('../fileIO');
describe("Task Assign test cases", function(){
    this.timeout(5000);

        it("should fail on incorrect task", async() => {
            const conversationState = new ConversationState(new MemoryStorage());
            const userState = new UserState(new MemoryStorage());
            const DIALOG_STATE_PROPERTY = 'dialogState';
            const USER_INFO_PROPERTY = 'userInfoPropertyAccessor'
            const dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
            const userInfoAccessor = userState.createProperty(USER_INFO_PROPERTY);
            const dialogs = new DialogSet(dialogState);
            dialogs.add(new AssignDialog("prompt"));
            const adapter = new TestAdapter(async (context) => {
                const dc = await dialogs.createContext(context);
                const results = await dc.continueDialog();
                const user = await userInfoAccessor.get(context, {});
                user.profile = {

                        "class":"MA441",
                        "team":"Team1",
                        "email":"bernart1@my.erau.edu",
                        "nick":"Tim",
                        "votes":{},
                        "name":"User"
                }
                fileIO.insertProfile(user.profile);
                if(context.activity.text === '!assign'){
                    await dc.beginDialog("prompt", user)      
                } else if(results.status === DialogTurnStatus.complete){
                    const reply = results.result.toString();
                    await context.sendActivity(reply);
                }
                await conversationState.saveChanges(context);
        });
        await adapter.test("!assign", "What task would you like to assign? (1) week1 or (2) tutorial")
            .send("Blah")
            .assertReply(`Sorry, the task "Blah" is not on my list.`)
    });

    it("should fail if student voted before", async() => {
        const conversationState = new ConversationState(new MemoryStorage());
        const userState = new UserState(new MemoryStorage());
        const DIALOG_STATE_PROPERTY = 'dialogState';
        const USER_INFO_PROPERTY = 'userInfoPropertyAccessor'
        const dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        const userInfoAccessor = userState.createProperty(USER_INFO_PROPERTY);
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new AssignDialog("prompt"));
        const adapter = new TestAdapter(async (context) => {
            const dc = await dialogs.createContext(context);
            const results = await dc.continueDialog();
            const user = await userInfoAccessor.get(context, {});
            user.profile = {

                    "class":"MA441",
                    "team":"Team1",
                    "email":"bernart1@my.erau.edu",
                    "nick":"Tim",
                    "votes":{
                        "week1":true
                    },
                    "name":"User"
            }
            fileIO.insertProfile(user.profile);
            if(context.activity.text === '!assign'){
                await dc.beginDialog("prompt", user)      
             }
            await conversationState.saveChanges(context);
    });
    
    await adapter.test("!assign", "What task would you like to assign? (1) week1 or (2) tutorial")
        .send("week1")
        .assertReply(`You already voted for someone to lead this task`)
    });


    it("should fail if student user not valid", async() => {
        const conversationState = new ConversationState(new MemoryStorage());
        const userState = new UserState(new MemoryStorage());
        const DIALOG_STATE_PROPERTY = 'dialogState';
        const USER_INFO_PROPERTY = 'userInfoPropertyAccessor'
        const dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        const userInfoAccessor = userState.createProperty(USER_INFO_PROPERTY);
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new AssignDialog("prompt"));
        const adapter = new TestAdapter(async (context) => {
            const dc = await dialogs.createContext(context);
            const results = await dc.continueDialog();
            const user = await userInfoAccessor.get(context, {});
            user.profile = {
                
                "team":"Team1",
                "class":"MA441",
                "Email":"darby.bernard@gmail.com",
                "Nick":"Tim",
                "votes":{},
                "name":"User"
            }
            fileIO.insertProfile(user.profile);
            if(context.activity.text === '!assign'){
                await dc.beginDialog("prompt", user)      
            } 
            await conversationState.saveChanges(context);
    });
    
    await adapter.test("!assign", "What task would you like to assign? (1) week1 or (2) tutorial")
        .send("week1")
        .assertReply(undefined)
        .send('Blah')
        .assertReply('Need a valid user. Ending dialog.')
    });

});