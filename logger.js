var Logger = require('bunyan');


//Logger constructor
var log = new Logger({
    name: 'LogGenerator' ,
    streams : [
        {
            level: 'debug',
            path: './logs/debug/debug.log'
        },

        {
            level: 'info',
            path: './logs/info/info.log'
        },

        {
            level: 'error',
            path: './logs/errors/error.log'
        },

    ]
    
});

exports.log = log;