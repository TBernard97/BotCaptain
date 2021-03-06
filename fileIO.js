var fs = require('fs');
var crypto = require('crypto')
const { bunlogger } = require('./bunlogger')
var jsonfile = require('jsonfile')
const config = jsonfile.readFileSync('./config.json')

class fileIO{

    //Method for creating directories
    static makeDirectory(path){
        if(fs.existsSync(path) === false){
            fs.mkdirSync(`${path}`, function(err){
                if(err){
                    //Log error if occurs
                    bunlogger.error("Error generating directory")
                    throw err;
                }
            });
        }
    }

    //Method for writing to files
    static writeFile(path, text){
        //
         //Append user log on Non-Blocking stream
        var stream = fs.createWriteStream(path,{'flags':'a+'})
        stream.once('open', (fd) =>{
            stream.write(`${text}\n`)
            //Always close stream when done
            stream.end();
        });
    }
   
 
    //Method for encryption
    static encryptText(text){
        
        //Cast algo and pass
       const algorithm = config.encryption.algorithm;
       const password = config.encryption.password;
       const iv_length = 16;

        //Generate encryption object
        let iv = crypto.randomBytes(iv_length);
        var cipher = crypto.createCipheriv(algorithm,password,iv);
  
        //Encrypt text
        let crypted =  cipher.update(text,'utf8','hex');
        var result = [];
        result += crypted;
        
        //Return encrypted text
        return result;
        
    }

    //Method for decryption
    static decryptText(text){
         //Cast algo and pass
        const algorithm = config.encryption.algorithm;
        const password = config.encryption.password;
        const iv_length = 16;

       //Generate decryption Object
        let iv = crypto.randomBytes(iv_length);
        var cipher = crypto.createDecipheriv(algorithm,password,iv);

        //Decrypt text
        let decrypted = cipher.update(text, 'hex', 'utf8');
        var result = [];
        result += decrypted

        //Return decrypted text
        return result;

    }

    //Method for building embedded database
    static buildDB(classNumber){
        const tableObject = {};
        const messageObject = {"messages":[]}
        let profilePath = `./Resources/Classes/${classNumber}/profiles.json`;
        let messagePath = `./Resources/Classes/${classNumber}/messages.json`;


        fileIO.makeDirectory(`./Resources/Classes/${classNumber}`);
        fileIO.makeDirectory(`./Resources/Classes/${classNumber}/Teams/`)

        if(fs.existsSync(profilePath) === false){
            jsonfile.writeFileSync(profilePath, tableObject, {flag: 'w'});
        }
        
        if(fs.existsSync(messagePath) === false){
            jsonfile.writeFileSync(messagePath, messageObject, {flag: 'w'})
        }

    }


    static insertProfile(profile){
        let profilePath = `./Resources/Classes/${profile.class}/profiles.json`;
        var contents = jsonfile.readFileSync(profilePath);
        contents[profile.name] = profile;
        jsonfile.writeFileSync(profilePath, contents, {flags:'w'});
    }


    //Method for logging context data
    static logContext(turnContext,user){

        let channelID = turnContext.activity.channelId;
        let clientID = turnContext.activity.channelData.clientActivityId;
        let time = turnContext.activity.timestamp;
        let text = turnContext.activity.text;
        let name = turnContext.activity.from.name;
        let userID = turnContext.activity.from.id;
        let messagePath = `./Resources/Classes/${user.class}/messages.json`;
        var contents = jsonfile.readFileSync(messagePath);
        
        //Rebuild Data 
        var data = { "time": time, "channelID": channelID, "clientID": clientID, "text": text, "user": name, "userID": userID, "team": user.team, "nick": user.nick };
        
        contents.messages.push(data);
        
        jsonfile.writeFileSync(messagePath, contents, {flags:'w'});

    }

}



module.exports.fileIO = fileIO;