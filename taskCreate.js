const prompt = require('prompt');
const jsonfile = require('jsonfile');

var schema = {
    properties:{
        ClassNumber: {
            hidden: false,
            message: "A class number is required to build the database",
            required: true
          },
    
        TeamName: {
            hidden: false,
            message: "Team name for the class.",
            required: true
          },
          
        TaskName: {
            hidden: false,
            message: "Tasks name for the team.",
            required: true
          },
    
        TaskDueDate: {
            hidden: false,
            message: "Task due date.",
            required: true
          },
    
        TaskDescription: {
            hidden: false,
            message: "A description of the task.",
            required: true
          },
    
        TaskStatus: {
            hidden: false,
            message: "Whether or not the task is completed.",
            required: true
          }
    }
}

prompt.start();

prompt.get(schema, function (err, result) {
    var taskObject = {
        date: "",
        description: "",
        status: ""
    }

    if (err) { return onErr(err); }
    tasks = jsonfile.readFileSync(`./Resources/Classes/${result.ClassNumber}/Teams/${result.TeamName}/tasks.json`)
    taskObject.date = result.TaskDueDate;
    taskObject.description = result.TaskDescription;
    taskObject.status = result.TaskStatus;
    tasks[result.TaskName] = taskObject;
    jsonfile.writeFileSync(`./Resources/Classes/${result.ClassNumber}/Teams/${result.TeamName}/tasks.json`, tasks, {flag: 'w'})
})

function onErr(err) {
    console.log(err);
    return 1;
}