const messageByBadWord = require("../model/messageByBadWord");

class MessageByBadWordDAO {

    _session = null;
    mapper = null;

    constructor(_session, mapper) {
        this._session = _session;
        this.mapper = mapper.forModel('Message');
    };

    insert(the_user_id, the_email, the_bad_word_count, the_bad_words, the_message, the_channel, the_date) {
        let row = new messageByBadWord(the_user_id, the_email, the_bad_word_count, the_bad_words, the_message, the_channel, the_date);
        return this.mapper.insert(row);
    };

    // fix the data model for this table - currently has three partition keys
    get_all_messages_by_bad_word(badWords, userId) {
        // taskId should be a UUID
        return this.mapper.find({ badWords, userId });
    };


}

module.exports = MessageByBadWordDAO;