var TinCan = require('tincanjs')
var jsonfile = require('jsonfile')
const config = jsonfile.readFileSync('./config.json')
const { log } = require('./logger')
//Class for pushing statements into the LRS
class xAPI_Statements {
    constructor(){
        try {
            this.lrs = new TinCan.LRS(
                {
                    endpoint: config.xAPI.endpoint,
                    username: config.xAPI.username,
                    password: config.xAPI.password,
                    allowFail: false
                }
            );
        } catch (ex) {
            log.debug("Failed to setup LRS object: ", ex);
        }
    }

    async recordLogin(email){
        if(config.xAPI.enabled == true){
            var statement = new TinCan.Statement(
                {
                    actor: {
                        objectType: "Agent",
                        mbox: `mailto:${email}`,
                    },
                    verb: {
                        id: "http://adlnet.gov/expapi/verbs/attended"
                    },
                    object: {
                        id: config.xAPI.objectID,
                        definition: { 
                            name: {
                                "en-US": "Team Meeting"
                            },
                            description: {
                                "en-US": "Meeting occured with a specific team in the class."
                            },
                            type: "http://adlnet.gov/expapi/activities/meeting"
                        },
                        objectType: "Activity"    
                    }
            
                }
            );

            this.lrs.saveStatement(
                statement,
                {
                    callback: function (err, xhr) {
                        if (err !== null) {
                            if (xhr !== null) {
                                log.debug(`Failed to save statement: ${xhr.responseText} ${xhr.status }.`);
                                return;
                            }
            
                            log.debug(`Failed to save statement: ${err}.`);
                            return;
                        }
            
                        log.info("xAPI statment saved.")
                    }
                }
            );
        } else {
            log.debug("xAPI Disabled in configuration.");
        }
    }

    async recordSchedule(email){
        if(config.xAPI.enabled == true){
            var statement = new TinCan.Statement(
                {
                    actor: {
                        objectType: "Agent",
                        mbox: `mailto:${email}`,
                    },
                    verb: {
                        id: "http://activitystrea.ms/schema/1.0/schedule",                
                        display: {
                            "en-US": "Scheduled"
                        }, 
                    },

                    object: {
                        id: config.xAPI.objectID,
                        definition: { 
                            name: {
                                "en-US": "Email Reminder"
                            },
                            description: {
                                "en-US": "Student scheduled an email reminder for a task."
                            },
                            type: "http://id.tincanapi.com/activitytype/email"
                        },
                        objectType: "Activity"    
                    }
            
                }
            );

            this.lrs.saveStatement(
                statement,
                {
                    callback: function (err, xhr) {
                        if (err !== null) {
                            if (xhr !== null) {
                                log.debug(`Failed to save statement: ${xhr.responseText} ${xhr.status }`);
                                return;
                            }
            
                            log.debug(`Failed to save statement: ${err}`);
                            return;
                        }
            
                        log.info("xAPI statment saved.")
                    }
                }
            );
        } else {
            log.debug("xAPI Disabled in configuration.");
        }
    }


async recordSchedule(email){
    if(config.xAPI.enabled == true){
        var statement = new TinCan.Statement(
            {
                actor: {
                    objectType: "Agent",
                    mbox: `mailto:${email}`,
                },
                verb: {
                    id: "http://activitystrea.ms/schema/1.0/schedule",                
                    display: {
                        "en-US": "Scheduled"
                    }, 
                },

                object: {
                    id: config.xAPI.objectID,
                    definition: { 
                        name: {
                            "en-US": "Email Reminder"
                        },
                        description: {
                            "en-US": "Student scheduled an email reminder for a task."
                        },
                        type: "http://id.tincanapi.com/activitytype/email"
                    },
                    objectType: "Activity"    
                }
        
            }
        );

        this.lrs.saveStatement(
            statement,
            {
                callback: function (err, xhr) {
                    if (err !== null) {
                        if (xhr !== null) {
                            log.debug(`Failed to save statement: ${xhr.responseText} ${xhr.status }`);
                            return;
                        }
        
                        log.debug(`Failed to save statement: ${err}`);
                        return;
                    }
        
                    log.info("xAPI statment saved.")
                }
            }
        );
    } else {
        log.debug("xAPI Disabled in configuration.");
    }
}

async recordQuiz(email){
    
    if(config.xAPI.enabled == true){
        var statement = new TinCan.Statement(
            {
                actor: {
                    objectType: "Agent",
                    mbox: `mailto:${email}`,
                },
                verb: {
                    id: "https://w3id.org/xapi/dod-isd/verbs/passed",                
                    display: {
                        "en-US": "Passed"
                    }, 
                },

                object: {
                    id: config.xAPI.objectID,
                    definition: { 
                        name: {
                            "en-US": "Quiz Passed"
                        },
                        description: {
                            "en-US": "Student passed the quiz."
                        },
                        type: "http://adlnet.gov/expapi/activities/assessment"
                    },
                    objectType: "Activity"    
                }
        
            }
        );

        this.lrs.saveStatement(
            statement,
            {
                callback: function (err, xhr) {
                    if (err !== null) {
                        if (xhr !== null) {
                            log.debug(`Failed to save statement: ${xhr.responseText} ${xhr.status }`);
                            return;
                        }
        
                        log.debug(`Failed to save statement: ${err}`);
                        return;
                    }
        
                    log.info("xAPI statment saved.")
                }
            }
        );
    } else {
        log.debug("xAPI Disabled in configuration.");
    }
}
}

module.exports.xAPI_Statements = xAPI_Statements;
