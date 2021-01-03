const CassandraService = require("./CassandraService");
const cassandra = require('cassandra-driver');
const Uuid = cassandra.types.Uuid;
const util = require('util');

var getProfiles = function(result) {
    var promise = new Promise(function(resolve, reject){

        try {
            result.init_mapper();
            let query_result = result.get_profile_by_task_dao().get_all_profiles_by_task('c0a28687-e97b-4827-8c12-4a322ad43f4b')
            resolve([result, query_result]);
        }
        catch (err) {
            reject(console.log(err));
        }
    });
    return promise;
};

var close = function(connection) {
    return new Promise(function(resolve, reject) {
        let isClientConnected = connection._session_manager._session.client.connected;

        if (isClientConnected === true) {
            resolve(connection.close());
        }
        else {
            reject(console.log("client is not connected"));
        }
    });
};

async function getData() {
    try {
        let service = await connectToDatabase()
        getProfiles(service)
        .then((res) => console.log(res));
        return service;
    } catch(err) {
        console.log('Ohh no:', err.message);
    }
};

async function test() {
    let connection = new CassandraService();
    await connection.connect();
    connection.reload_tables();
    console.log("Tables have been reloaded");
}

test()