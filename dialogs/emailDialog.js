const { ComponentDialog, TextPrompt, WaterfallDialog} = require('botbuilder-dialogs');
const emailId = 'email'
const nodemailer = require('nodemailer');
const jsonfile = require('jsonfile');
const config = require('../config');
const { log } = require('../src/logger');

//Class extends the CompenetDialog from botbuilder and will request an address and message and then email to an address
class EmailDialog extends ComponentDialog {
    constructor(id){
        super(id);

        this.initialDialogId = emailId;

        this.addDialog(new TextPrompt('textPrompt'));

        this.addDialog(new WaterfallDialog (emailId, [
            //Request an address
            async function (step){
                step.values.option = {};
                return await step.prompt('textPrompt', 'What address would you like to email?')
            },

            //Request message
            async function (step){
                step.values.option.address = step.result;
                return await step.prompt('textPrompt', `I have the address as ${step.result}. What message would you like to send?`)
            },

            //Send email and end dialog
            async function(step){
                step.values.option.text = step.result;
                await step.context.sendActivity('Ok sending email');

                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    secure: false,
                    port: 25,
                    auth: {
                        user: config.email.address,
                        pass: config.email.password
                    },
                    tls: {
                        rejectUnauthorized: false 
                    }
                    });
                    
                    //We need a dialog that builds this
                    let HelperOptions = {
                    from: `BotCaptain <${config.email.address}>`,
                    to: `${step.values.option.address}`,
                    subject: 'BotCaptain',
                    text: `${step.values.option.text}`
                    };
                    
                    
                    
                    transporter.sendMail(HelperOptions, (error, info) => {
                        if (error) {
                        log.error(`[ERROR] ${error}.`);
                        return console.log(`[ERROR] ${error}`);
                        }
                        console.log("The message was sent!");
                        console.log(info);
                    });
                    return await step.endDialog(step.values.option);
            }
            
        ]));
    }

}

exports.EmailDialog=EmailDialog;