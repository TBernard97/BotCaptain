const prompt = require('prompt');
const jsonfile = require('jsonfile');
const { log } = require('../src/logger');

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
    function isBlank(str) {
        return (!str || /^\s*$/.test(str));
    }
    
    config.email = {
        address: "",
        password: ""
    }

    config.cassandra = {
        username: "",
        password: "",
        keyspace: "",
        secureConnectBundle: "",
        contactPoint: "",
        enabled: false
    }

    config.encryption = {
        algorithm: "",
        password: ""
    }

    config.xAPI = {
        endpoint: "",
        username: "",
        password: "",
        objectID: "",
        enabled: false
    }

    config.kudu = {
        kuduAPI: "",
        userName: "",
        password: "",
        enabled: false
    }


    config.email.address = result.botEmail;
    config.email.password = result.botEmailPassword;
    // console.log(isBlank(result.cassandraUsername));
    if(isBlank(result.cassandraUsername) == false  && isBlank(result.cassandraPassword) == false){
        config.cassandra.username = result.cassandraUsername;
        config.cassandra.password = result.cassandraPassword;
        config.cassandra.enabled = true;
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

    } else {
        console.log("[INFO] It appears no Cassandra Credentials were specified.")
    }

    if(isBlank(result.encryptionAlgorithm) == false  && isBlank(result.encryptionPassword) == false){
        try {
            config.encryption.algorithm = result.encryptionAlgorithm;
            config.encryption.password = result.encryptionPassword;
        }
    
        catch {
            console.log("[INFO] It seems that one or more encryption parameters were not specified.");
        }

    } else {
        console.log("[INFO] It appears no encryption parameters were specifed.");
    }
   
    if(isBlank(result.xAPIEndpoint) == false && isBlank(result.xAPIUsername) == false && isBlank(result.xAPIPassword) == false && isBlank(result.xAPIObjectID) == false){
        try {
            config.xAPI.endpoint = result.xAPIEndpoint;
            config.xAPI.username = result.xAPIUsername;
            config.xAPI.password = result.xAPIPassword;
            config.xAPI.objectID = result.xAPIObjectID;
            config.xAPI.enabled = true;
        }
        catch {
            console.log("[INFO] It seems that one or more xAPI parameters were not specified.");
        }
    } else {
        console.log("[INFO] It seems that no xAPI parameters were specified.");
    } 

    if(isBlank(result.kuduAPI) == false && isBlank(result.kuduUsername) == false && isBlank(result.kuduPassword) == false){
        try {
            config.kudu.kuduAPI = result.kuduAPI;
            config.kudu.userName = result.kuduUsername;
            config.kudu.password = result.kuduPassword;
            config.kudu.enabled = true;
        }
        
        catch {
            console.log("[INFO] It seems that one or more kudu API parameters were not specified.");
        }
    } else {
        console.log("[INFO] It seems that no kudu API parameters were specified.");
    }

    jsonfile.writeFileSync("./config.json", config, {flag: 'w'});
});

function onErr(err) {
    log.error(`[ERROR] ${err}`);
    console.log(`[ERROR] ${err}`);
    return 1;
}