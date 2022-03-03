// [!]
// [!] Consider switching to use ES6 modules whenever possible for Node.js version 10+
// [!] import something from './something'; var something1 = new something(); instead of var something = require('./something');
// [!] Reason, pre-parsing modules makes ES6 faster than CommonJs
// [!]
var restify = require('restify');
var path = require('path');
var fs = require('fs');
const { logger } = require('./logger');
var { messageParser } = require('./messageParser'); //Need to finish this before it is used

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');
const { BotConfiguration } = require('botframework-config'); // Import required bot configuration.
const { scheduler } = require('./scheduler');
const { fileIO } = require('./fileIO');
// Read botFilePath and botFileSecret from .env file
const ENV_FILE = path.join(__dirname, '.env'); // Note: Ensure you have a .env file and include botFilePath and botFileSecret.
const env = require('dotenv').config({path: ENV_FILE});
// See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.
const DEV_ENVIRONMENT = 'development'; // bot endpoint name as defined in .bot file
const BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT); // bot name as defined in .bot file
const BOT_FILE = path.join(__dirname, (process.env.botFilePath || '')); // .bot file path



// Create HTTP server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open BotCaptain.bot file in the Emulator`);
});


//Using AppID and AppPassword set in the .env
const adapter = new BotFrameworkAdapter({
    
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword

}); // Create adapter.

// See https://aka.ms/about-bot-state to learn more about bot state.
const memoryStorage = new MemoryStorage(); // Define state store for your bot.

// Create conversation and user state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Local file path for the bot to save data.
const dir = path.join(__dirname, "\\users");
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

// Create messageHandler is the main context handler.
const messageHandler = new messageParser(conversationState, userState);

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${error}`);
    // Send a message to the user
    context.sendActivity(`Oops. Something went wrong!`);
    // Clear out state
    await conversationState.load(context);
    await conversationState.clear(context);
    // Save state changes.
    await conversationState.saveChanges(context);
};

// Automatic functionalities here
const classList = fileIO.readDirectories('Resources/Classes')
for ( var i in classList ){
    let classNumber = classList[i]
    let classDirectory = `Resources/Classes/${classNumber}/messages.json`
    scheduler.uploadSchedule({ minutes: 1, }, classDirectory, classDirectory, 'messages.json' )
}


// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to appropriate handler
        try {
            await messageHandler.onTurn(context)
         } // permission denied, do nothing
        catch (err) {
            // catch all unhandled errors
            console.log(err);
            logger.error(`Unknown error has occured: ${err}`)
        }
    });
});