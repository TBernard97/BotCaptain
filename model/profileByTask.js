class profileByTask {
    
    constructor(the_user_id, the_task_id, the_email, the_task_name, the_due_date, the_task_description) {
        this.userId = the_user_id;
        this.taskId = the_task_id;
        this.email = the_email;
        this.taskName = the_task_name;
        this.dueDate = the_due_date;
        this.taskDescription = the_task_description;
    }

}

module.exports = profileByTask;