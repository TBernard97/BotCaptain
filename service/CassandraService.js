const SessionManager = require('../dao/sessionManager');
const ProfileByTaskDAO = require('../dao/profileByTaskDao');
const ProfileByEmailDAO = require('../dao/profileByEmailDao');
const TaskByTeamDAO = require('../dao/taskByTeamDao');
const MessageByBadWordDAO = require('../dao/messageByBadWordDao');
const MessageByUserDAO = require('../dao/messageByUserDao');
const config = require('../config.json');


class CassandraService {

    _session_manager = null;
    mapper = null;
    profile_by_task_dao = null;
    profile_by_email_dao = null;
    task_by_team_dao = null;
    message_by_bad_word_dao = null;
    message_by_user_dao = null;

    constructor() {
        this._session_manager = new SessionManager();
    }

    save_credentials() {
        this._session_manager.save_credentials();
    }

    async init_mapper() {
        await this._session_manager.init_mapper();
        return 1;
    }

    async connect() {
        if (config.cassandra.enabled === true) {
            this.save_credentials();
            await this._session_manager.connect();
            await this.init_mapper();
            return 1;
        }
        else {
            return null;
        }
    }

    test_connection() {
       return this._session_manager.test_connection();
    }

    get_profile_by_task_dao() {
        if (this.profile_by_task_dao === null) {
            this.profile_by_task_dao = new ProfileByTaskDAO(this._session_manager._session.client, this._session_manager.mapper);
        }
        return this.profile_by_task_dao;
    }

    get_profile_by_email_dao() {
        if (this.profile_by_email_dao === null) {
            this.profile_by_email_dao = new ProfileByEmailDAO(this._session_manager._session.client, this._session_manager.mapper);
        }
        return this.profile_by_email_dao;
    }

    get_task_by_team_dao() {
        if (this.task_by_team_dao === null) {
            this.task_by_team_dao = new TaskByTeamDAO(this._session_manager._session.client, this._session_manager.mapper);
        }
        return this.task_by_team_dao;
    }

    get_message_by_bad_word_dao() {
        if (this.message_by_bad_word_dao === null) {
            this.message_by_bad_word_dao = new MessageByBadWordDAO(this._session_manager._session.client, this._session_manager.mapper);
        }
        return this.message_by_bad_word_dao;
    }

    get_message_by_user_dao() {
        if (this.message_by_user_dao === null) {
            this.message_by_user_dao = new MessageByUserDAO(this._session_manager._session.client, this._session_manager.mapper);
        }
        return this.message_by_user_dao;
    }

    batch_insert_messages(message_array) {
        const insert_query = `INSERT INTO users.message_by_user (user_id, email, date, message, channel)
                                VALUES (?, ?, ?, ?, ?)`;
        
        let prepared_statements = [];

        message_array.forEach(message => {
            prepared_statements.push( {query: insert_query, 
                params: [message.userId, message.email, message.date, message.message, message.channel]});
        });

        this._session_manager.batch_insert_messages(prepared_statements);
    }

    reload_tables() {
        this._session_manager.reload_tables();
    }

    async close() {
        await this._session_manager.close();
        return 1;
    }

}

module.exports = CassandraService;