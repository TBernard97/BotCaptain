const cassandra = require('cassandra-driver');
const Mapper = cassandra.mapping.Mapper;
var fs = require('fs');

// load in config file
const config = require('../../config.json')

// mapping options object
const mappingOptions = require('./mappingOptions');

// create tables function with table definitions
const create_tables = require('./createTableStatements');

class SessionManager {
    _session = null;
    _mapper = null;
    username = null;
    password = null;
    keyspace = null;
    secureConnectBundle = null;
    initialized = false;

    constructor() {
        
    }

    save_credentials() {
        this.username = config.cassandra.username;
        this.password = config.cassandra.password;
        this.keyspace = config.cassandra.keyspace;
        this.secureConnectBundle = config.cassandra.secureConnectBundle;
        this.initialized = true;
    }

    async connect() {

        if (this.initialized == false) {
            throw new Error('Please initialize the connection parameters first with SessionManager.save_credentials');
        }

        if (this._session == null) {

            // May implement later for security
            // var ssl_option = {
            //     cert : fs.readFileSync("server.crt"),
            //     secureProtocol: 'TLSv1_2_method'
            // };
            // sslOptions: ssl_option 
            
            const client = new cassandra.Client({
                cloud: { secureConnectBundle: `${this.secureConnectBundle}` },
                authProvider: new cassandra.auth.PlainTextAuthProvider(this.username, this.password),
                keyspace: config.keyspace
            });

            try {
                await client.connect();
                console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
            }
            catch (err) {
                console.log(err);
                throw err;
            }

            this._session = {};
            this._session.client = client;

        }
        
        return 1;
    }

    test_connection() {
        if (this.initialized == false) {
            throw new Error('Please initialize the connection parameters first with SessionManager.save_credentials');
        }

        else {
            this._session.client.execute('SELECT * FROM system.local').then(function(result) {
                result.rows.forEach(row => {
                    console.log("Connected to cluster '%s'", row.cluster_name);
                });
                console.log('SUCCESS');
            }).catch(function(error) {
                console.log(error.message);
            });
        }
        
    }

    init_mapper() {
        const mapper = new Mapper(this._session.client, mappingOptions);
        this.mapper = mapper;
    }

    async reload_tables() {
        await create_tables(this._session.client);
    }

    batch_insert_messages(prepared_statements) {
        this._session.client.batch(prepared_statements, { prepare: true})
        .then(function() {
            console.log("Messages have been stored");
        })
        .catch(function(err) {
            console.log("[WARNING] - Messages have not been logged!");
        });
    }

    async close() {
        try {
            await this._session.client.shutdown();
            console.log('Connection closed.')
        }
        catch(err) {
            console.log(err);
        }
        
    }

}

module.exports = SessionManager;