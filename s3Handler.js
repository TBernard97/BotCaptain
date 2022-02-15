const AWS = require('aws-sdk')
const config = require('./config.json')
let BUCKET = 'xapi-test-new'

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
        return s3.upload({
            Bucket: BUCKET,
            ACL: 'private',
            Key: serverPath,
            Body: file,
            ContentType: contentType,
            ContentDisposition: `attachment; filename=${filename}`,
        }).promise()
    }

}

exports.s3Handler = s3Handler;