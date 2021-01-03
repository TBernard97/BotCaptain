const profileByTask = require("../model/profileByTask");

class ProfileByTaskDAO {

    _session = null;
    mapper = null;

    constructor(_session, mapper) {
        this._session = _session;
        this.mapper = mapper.forModel('Profile');
    };

    insert(the_user_id, the_task_id, the_email, the_task_name, the_due_date, the_task_description) {
        let row = new profileByTask(the_user_id, the_task_id, the_email, the_task_name, the_due_date, the_task_description);
        return this.mapper.insert(row);
    };

    get_all_profiles_by_task(taskId) {
        // taskId should be a UUID
        return this.mapper.find({ taskId });
    };


}

module.exports = ProfileByTaskDAO;