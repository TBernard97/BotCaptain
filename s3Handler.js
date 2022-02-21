const AWS = require('aws-sdk')
const config = require('./config.json')
const { log } = require('./logger')
let BUCKET = 'xapi-test-new'
var fs = require('fs');

const s3Config = {
    apiVersion: '2006-03-01',
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
    region: config.s3.region,
}
//
const s3 = new AWS.S3(s3Config)

class s3Handler {
    
    static uploadFile(file, contentType, serverPath, filename)  {

        
        if (!filename) {
         filename = serverPath.split('/').pop()
        }
        fs.readFile(file, 'utf8', function(err, data){
    
            log.info(`[INFO] ${file} written to the "${BUCKET}" S3 Bucket` )
            return s3.upload({
                Bucket: BUCKET,
                ACL: 'private',
                Key: serverPath,
                Body: data,
                ContentType: contentType,
                ContentDisposition: `attachment; filename=${filename}`,
            }).promise()
        });

    }

}

exports.s3Handler = s3Handler;