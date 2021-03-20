const profileByEmail = require("../model/profileByEmail");

class ProfileByEmailDAO {

    _session = null;
    mapper = null;

    constructor(_session, mapper) {
        this._session = _session;
        this.mapper = mapper.forModel('Profile');
    };

    insert(the_user_id, the_email, the_class, the_team, the_nickname, the_channel) {
        let row = new profileByEmail(the_user_id, the_email, the_class, the_team, the_nickname, the_channel);
        return this.mapper.insert(row);
    };

    get_user_profile_by_channel(channel, userId) {
        return this.mapper.get({ channel, userId });
    };


}

module.exports = ProfileByEmailDAO;