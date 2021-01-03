const taskByTeam = require("../model/taskByTeam");

class TaskByTeamDAO {

    _session = null;
    mapper = null;

    constructor(_session, mapper) {
        this._session = _session;
        this.mapper = mapper.forModel('Task');
    };

    insert(the_user_id, the_task_id, the_team_id, the_task_name, the_due_date, the_task_description, the_task_team) {
        let row = new taskByTeam(the_user_id, the_task_id, the_team_id, the_task_name, the_due_date, the_task_description, the_task_team);
        return this.mapper.insert(row);
    };

    // fix the data model for this table - currently has three partition keys
    get_all_tasks_by_team(teamId) {
        // taskId should be a UUID
        return this.mapper.find({ teamId });
    };


}

module.exports = TaskByTeamDAO;