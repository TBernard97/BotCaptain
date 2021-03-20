class taskByTeam {
    
    constructor(the_user_id, the_task_id, the_team_id, the_task_name, the_due_date, the_task_description, the_task_team) {
        this.userId = the_user_id;
        this.taskId = the_task_id;
        this.teamId = the_team_id;
        this.taskName = the_task_name;
        this.dueDate = the_due_date;
        this.taskDescription = the_task_description;
        this.taskTeam = the_task_team;
    }

}

module.exports = taskByTeam;