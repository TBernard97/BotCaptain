var schedule = require('node-schedule');
var nodemailer = require('nodemailer');
var jsonfile = require('jsonfile');
const { log } = require('./logger');
const config = jsonfile.readFileSync('./config.json')
class scheduler {
    
    //Schedule email reminders
    static email(address, date, time, message) {

        //Submited Dates must adhere to TimeEx format
        var date_array =  date.split("-").map(val => Number(val));
        var trigger_year = date_array[0];
        var trigger_month = date_array[1]-1;
        var trigger_day = date_array[2];

        //Submited times must adhere to 24-hour format
        var time_array = time.split(":").map(val => Number(val));
        var trigger_hour = time_array[0];
        var trigger_minute = time_array[1];
        
        var trigger = new Date(trigger_year,trigger_month,trigger_day,trigger_hour, trigger_minute);
        
        schedule.scheduleJob(trigger, function(){      
            //Email logic
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
                    to: `${address}`,
                    subject: 'BotCaptain',
                    text: `${message}`
                };
                
                
                
                transporter.sendMail(HelperOptions, (error, info) => {
                    if (error) {
                    log.error(`[ERROR] Error occurred while sending mail: ${error}.`)
                    }
                    log.info(`[INFO] Email sent to ${address}.`)
                    log.info(info)
                });
     
            }
        );
    }
}

exports.scheduler = scheduler;