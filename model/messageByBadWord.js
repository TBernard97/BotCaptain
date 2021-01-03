
class messageByBadWord {

    constructor(the_user_id, the_email, the_bad_word_count, the_bad_words, the_message, the_channel, the_date) {
        this.user_id = the_user_id;
        this.email = the_email;
        this.badWordCount = the_bad_word_count;
        this.badWords = the_bad_words;
        this.message = the_message;
        this.channel = the_channel;
        this.date = the_date;
    }

}

module.exports = messageByBadWord;