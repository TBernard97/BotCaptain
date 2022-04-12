const messageByUser = require("../model/messageByUser");

class MessageByUserDAO {

    _session = null;
    mapper = null;

    constructor(_session, mapper) {
        this._session = _session;
        this.mapper = mapper.forModel('Message');
    };

    insert(the_user_id, the_email, the_date, the_message, the_channel) {
        let row = new messageByUser(the_user_id, the_email, the_date, the_message, the_channel);
        return this.mapper.insert(row);
    };


    get_all_messages_by_user(userId) {

        return this.mapper.find({ userId });
    };


}

module.exports = MessageByUserDAO;