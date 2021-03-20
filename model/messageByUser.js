class messageByUser {
    
    constructor(the_user_id, the_email, the_date, the_message, the_channel) {
        this.userId = the_user_id;
        this.email = the_email;
        this.date = the_date;
        this.message = the_message;
        this.channel = the_channel;
    }

}

module.exports = messageByUser;