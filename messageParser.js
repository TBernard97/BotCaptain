const { fileIO } = require('./fileIO');
const jsonfile = require('jsonfile');
const fs = require('fs');
const { ActivityTypes, MessageFactory, TurnContext } = require('botbuilder');

// cassandra database
const CassandraService = require('./service/CassandraService');
const cassandra = require('cassandra-driver');

// for hashing userId for cassandra database
var crypto = require('crypto');

//data structure for chat messages
const MessageQueue = require("./service/MessageQueue");
const Message = require("./model/messageByUser");

// config file
const config = require('./config.json')

//Dialog modules and properties
const { DialogSet, WaterfallDialog, Dialog, DialogTurnStatus } = require('botbuilder-dialogs');
const DIALOG_STATE_PROPERTY = 'dialogState';

//Email Dialog !Only for testing really. Trying to phase out
const { EmailDialog } = require('./emailDialog');
//Profile Dialog
const { ProfileDialog } = require('./profileDialog');
//Task Dialog
const { TaskDialog } = require('./taskDialog');
//Reminder Dialog 
const { ReminderDialog } = require('./reminderDialog');
//Module for pushing xAPI statements
const { xAPI_Statements } = require('./xAPI_Statements');


//Userinfo property
const USER_INFO_PROPERTY = 'userInfoPropertyAccessor';


//Message parser will be the bots main turn handler.
class messageParser {

    constructor(conversationState, userState){
        // //Call super before referencing this
        // super();

        //Create states
        this.conversationState = conversationState;
        this.userState = userState;

        //Create state property accessors
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userInfoAccessor = this.userState.createProperty(USER_INFO_PROPERTY);  
        
        //Init database connection
        this.cassandraService = new CassandraService();
        this.cassandraService.connect();

        //Init queue for all messages
        this.messageQueue = new MessageQueue(this.cassandraService);

        //Add dialogs here 
        this.dialogs = new DialogSet(this.dialogState)
            
            //Email Reminder
            .add(new EmailDialog('emailDialog'))

            //Welcome and Build Profile 
            .add(new ProfileDialog('profileDialog'))
        
            //Displays User Selected tasks  
            .add(new TaskDialog('taskDialog'))

            //Reminder 
            .add(new ReminderDialog('remindDialog'));
    }
        
    async onTurn(turnContext) {
        //Store required information
        let channelID = turnContext.activity.channelId;
        let name = turnContext.activity.from.name;
        let userID = turnContext.activity.from.id;
        const xAPI_Handler = new xAPI_Statements(); 

        if (turnContext.activity.type === ActivityTypes.Message) {
            //Create user object
            const user = await this.userInfoAccessor.get(turnContext, {});
            
            //Create dialog controller
            const dc = await this.dialogs.createContext(turnContext);
            const dialogTurnResult =  await dc.continueDialog();
            
            //If user profile does not exist in memory start dialog
            if(!user.profile) {

                if ((config.cassandra.enabled === true) && (dialogTurnResult.status === DialogTurnStatus.empty)) {
                    // create hash object to create UUID for a user on a channel
                    let hash = crypto.createHash('md5');
                    let hash_update = hash.update(`${name} + ${channelID}`, 'utf8');
                    let generated_hash = Buffer.from(hash_update.digest('hex'), 'hex');

                    let user_profile = await this.cassandraService.get_profile_by_email_dao().get_user_profile_by_channel(channelID, generated_hash);
                    
                    try {
                        var profileComparison = Buffer.compare(generated_hash, user_profile.userId);
                    }
                    catch {
                        var profileComparison = -1;
                        jsonfile.writeFileSync('./dialogID.json', userID, {flag: 'w'});
                        await dc.beginDialog('profileDialog');
                    }

                    if (profileComparison == 0) {
                        user.profile = user_profile;
                        await turnContext.sendActivity(`Welcome back ${user.profile.nick}`);
                    }
                }

                else if(dialogTurnResult.status === DialogTurnStatus.empty) {
                    jsonfile.writeFileSync('./dialogID.json', userID, {flag: 'w'});
                    await dc.beginDialog('profileDialog');
                } 
                else if(dialogTurnResult.status === DialogTurnStatus.complete) {
                    user.profile = dialogTurnResult.result;
                    user.profile.name = turnContext.activity.from.name;
                    fileIO.buildDB(user.profile.class);
                    this.userInfoAccessor.set(turnContext, user);
                    fileIO.insertProfile(user.profile);

                    if (config.cassandra.enabled === true) {
                        let hash = crypto.createHash('md5');
                        let hash_update = hash.update(`${name} + ${channelID}`, 'utf8');
                        let generated_hash = Buffer.from(hash_update.digest('hex'), 'hex');
                        // write profile to cassandraDB
                        this.cassandraService.get_profile_by_email_dao().insert(generated_hash, user.profile.email, user.profile.class, user.profile.team, user.profile.nick, channelID);
                    }

                    await turnContext.sendActivity('Your profile has been stored.');
                    await xAPI_Handler.recordLogin(user.profile.email);
                }                      
            } 
            
            //If user profile is present grant access to full functionality
            else {

                //Check for the existence of previous messages and process accordingly
                var utterance = (turnContext.activity.text || '').trim().toLowerCase();

                //Make new message by user object for message queue
                let user_message = new Message(userID, user.profile.email, new Date(), utterance,
                                                channelID);
                
                //List of BotCaptains available function plugins
                let commands = ['task', 'remind']

                if(utterance[0] === "!" && commands.includes(utterance.slice(1)) && dialogTurnResult.status === DialogTurnStatus.empty){
                    //Start appropriate dialog
                    let command = utterance.slice(1);
                    let dialog = command.concat('Dialog');
                    jsonfile.writeFileSync('./dialogID.json', userID, {flag: 'w'});
                    await dc.beginDialog(`${dialog}`, user);
                        
                } 

                
                // //Allow user to cancel or start any dialog
                if (utterance === 'cancel') {
                    if (dc.activeDialog) {
                        await dc.cancelAllDialogs();
                        await dc.context.sendActivity(`Ok... canceled.`);
                    } else {
                        await dc.context.sendActivity('Nothing to cancel.');
                    }
                }
            
                //Make directories
                fileIO.makeDirectory(`./logs/channels/${channelID}`);
                fileIO.makeDirectory(`./logs/channels/${channelID}/${name}`);

                //Record turnContext data
                fileIO.logContext(turnContext, user.profile);

                if (config.cassandra.enabled === true) {

                    console.log(`Enqueued the message object`);
                    console.log(user_message);
                    //Enqueue message by user object
                    this.messageQueue.enqueue(user_message);
                }
            }
  
            
        }  else if(turnContext.activity.type === ActivityTypes.ConversationUpdate){    
                //Create dialog controller
               const dc = await this.dialogs.createContext(turnContext);
             
               //Begin profileDialog
               jsonfile.writeFileSync('./dialogID.json', userID, {flag: 'w'});
               await dc.beginDialog('profileDialog')
        }
        
        //Save changes
        await this.userState.saveChanges(turnContext);
        await this.conversationState.saveChanges(turnContext);
    }

}

module.exports.messageParser = messageParser;
