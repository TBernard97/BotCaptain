const prompt = require('prompt');
const { fileIO } = require('./fileIO');
const jsonfile = require('jsonfile');


var schema = {
    properties: {
      ClassNumber: {
        hidden: false,
        message: "A class number is required to build the database",
        required: true
      },

      TeamName: {
        hidden: false,
        message: "Team name for the class.",
        required: false
      }

    }
}

prompt.start();

prompt.get(schema, function (err, result) {
    if (err) { return onErr(err); }

    fileIO.buildDB(result.ClassNumber);
    fileIO.makeDirectory(`./Resources/Classes/${result.ClassNumber}`)
    fileIO.makeDirectory(`./Resources/Classes/${result.ClassNumber}/Teams/`)

    try {
        fileIO.makeDirectory(`./Resources/Classes/${result.ClassNumber}/Teams/${result.TeamName}`)
        jsonfile.writeFileSync(`./Resources/Classes/${result.ClassNumber}/Teams/${result.TeamName}/tasks.json`, {}, {flag: 'w'})
    }

    catch{
        console.log("[INFO] It appears no team name was specified for the class")
    }

    console.log(`Database built for ${result.ClassNumber}`)

})


function onErr(err) {
    console.log(err);
    return 1;
}