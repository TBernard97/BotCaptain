const prompt = require('prompt');
const { fileIO } = require('../src/fileIO');



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
    fileIO.buildDB(result.ClassNumber, result.TeamName);
    console.log(`Database built for ${result.ClassNumber}`)

})


function onErr(err) {
    console.log(err);
    return 1;
}