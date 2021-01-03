var bunyan = require('bunyan');


//Logger constructor
var bunlogger = bunyan.createLogger({
    name: 'LogGenerator' ,
    streams : [
        {
            level: 20,
            path: './logs/debug/debug.log'
        },

        {
            level: 30,
            path: './logs/info/info.log'
        },

        {
            level: 50,
            path: './logs/errors/error.log'
        },

    ]
    
});

exports.bunlogger = bunlogger;