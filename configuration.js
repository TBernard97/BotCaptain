const prompt = require('prompt');
const jsonfile = require('jsonfile');


var schema = {
    properties: {

      botEmail: {
        pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$/,
        message: "The Bot's email must be a valid email address.",
        required: true
      },

      botEmailPassword: {
        hidden: true,
        message: "A password is required for the Bot's email.",
        required: true
      },

      cassandraUsername: {
        hidden: false,
        message: "Username for cassandraDB",
        required: false
      },

      cassandraPassword: {
        hidden: true,
        message: "Password for cassandraDB",
        required: false
      },

      cassandraKeySpace: {
        hidden: false,
        message: "Keyspace for cassandraDB (Astra)",
        required: false
      },

      cassandraSecureConnectBundle: {
        hidden: false,
        message: "Secure connect bundle for cassandraDB (Astra)",
        required: false
      },

      cassandraContactPoint: {
        hidden: false,
        message: "ContactPoint for cassandraDB (Azure)",
        required: false
      },
    
      encryptionAlgorithm: {
          required: false,
          message: "Algorithm for file encryption"
      },

      encryptionPassword: {
          required: false,
          message: "Password for file encryption",
          hidden:  true
      },

      xAPIEndpoint: {
          pattern:/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
          message: 'xAPI Endpoint must be a valid URL',
          required: false
      },

      xAPIUsername: {
          required: false,
          message: 'xAPI LRS Username'
      },

      xAPIPassword: {
          required: false,
          message: 'xAPI LRS Password',
          hidden: true
      },

      xAPIObjectID:{
        pattern:/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
        message: 'xAPI ObjectID must be a valid URL',
        required: false
      },

      kuduAPI: {
        pattern:/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
        message: 'Kudu API endpoint must a valid URL',
        required: false
      },

      kuduUsername: {
          required: false,
          message: 'Kudu API Username'
      },

      kuduPassword: {
          required: false,
          message: 'Kudu API password',
          hidden: true
      }
    }
  };


prompt.start();

prompt.get(schema, function (err, result) {
    if (err) { return onErr(err); }
    var config = {};
    
    config.email = {
        address: "",
        password: ""
    }

    config.cassandra = {
        username: "",
        password: "",
        keyspace: "",
        secureConnectBundle: "",
        contactPoint: ""
    }

    config.encryption = {
        algorithm: "",
        password: ""
    }

    config.xAPI = {
        endpoint: "",
        username: "",
        password: "",
        objectID: ""
    }

    config.kudu = {
        kuduAPI: "",
        userName: "",
        password: ""
    }


    config.email.address = result.botEmail;
    config.email.password = result.botEmailPassword;

    if(result.cassandraUsername != null && result.cassandraPassword != null){
        config.cassandra.username = result.cassandraUsername;
        config.cassandra.password = result.cassandraPassword;

        try {
            config.cassandra.keyspace = result.cassandraKeySpace;
            config.cassandra.secureConnectBundle = result.cassandraSecureConnectBundle;
        } catch {
            console.log("[INFO] It appears one or more of the Astra parameters were not specified")
        }

        try {
            config.cassandra.contactPoint = result.cassandraContactPoint;
        } catch {
            console.log("[INFO] It appears no contact point was specified for Azure")
        }

    } 

    try {
        config.encryption.algorithm = result.encryptionAlgorithm;
        config.encryption.password = result.encryptionPassword;
    }

    catch {
        console.log("[INFO] It seems that one or more encryption parameters were not specified.");
    }
 
    try {
        config.xAPI.endpoint = result.xAPIEndpoint;
        config.xAPI.username = result.xAPIUsername;
        config.xAPI.password = result.xAPIPassword;
        config.xAPI.objectID = result.xAPIObjectID;
    }
    catch {
        console.log("[INFO] It seems that one or more xAPI parameters were not specified.");
    }

    try {
        config.kudu.kuduAPI = result.kuduAPI;
        config.kudu.userName = result.kuduUsername;
        config.kudu.password = result.kuduPassword;
    }
    
    catch {
        console.log("[INFO] It seems that one or more kudu API parameters were not specified.");
    }

    jsonfile.writeFileSync("./config.json", config, {flag: 'w'});
});

function onErr(err) {
    console.log(err);
    return 1;
}