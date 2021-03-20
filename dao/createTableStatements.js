'use strict';

function create_tables(client) {

    const drop_table_statements = [
        'USE users',
        `DROP TABLE users.message_by_bad_word`,
        `DROP TABLE users.message_by_user`,
        `DROP TABLE users.profile_by_email`,
        `DROP TABLE users.profile_by_task`,
        `DROP TABLE users.task_by_team`
    ];

    const create_table_statements = [
        'USE users',

        `CREATE TABLE IF NOT EXISTS users.message_by_bad_word (
        user_id uuid,
        email text,
        bad_word_count int,
        bad_words set<text>,
        message text,
        channel text,
        date timeuuid,
        PRIMARY KEY ((user_id), bad_word_count))
        WITH CLUSTERING ORDER BY (bad_word_count DESC);`,
        
        `CREATE TABLE IF NOT EXISTS users.message_by_user (
        user_id text,
        email text,
        date timestamp,
        message text,
        channel text,
        PRIMARY KEY ((user_id), date))
        WITH CLUSTERING ORDER BY (date DESC);`,
        
        `CREATE TABLE IF NOT EXISTS users.profile_by_email (
        user_id blob,
        email text,
        class text,
        team text,
        nick text,
        channel text,
        PRIMARY KEY ((channel), user_id))
        WITH CLUSTERING ORDER BY (user_id DESC);`,
        
        `CREATE TABLE IF NOT EXISTS users.profile_by_task (
        user_id uuid,
        task_id uuid,
        email text,
        task_name text,
        due_date timestamp,
        task_description text,
        PRIMARY KEY ((task_id), user_id))
        WITH CLUSTERING ORDER BY (user_id DESC);`,
        
        `CREATE TABLE IF NOT EXISTS users.task_by_team (
        user_id uuid,
        task_id uuid,
        team_id uuid,
        task_name text,
        due_date timestamp,
        task_description text,
        task_team text,
        PRIMARY KEY ((team_id), user_id, task_id))
        WITH CLUSTERING ORDER BY (user_id DESC, task_id DESC);`
    ];

    const queries = drop_table_statements.concat(create_table_statements);
    let p = Promise.resolve();
    // Create the schema executing the queries serially
    queries.forEach(query => p = p.then(() => client.execute(query)));
    return p;
}

module.exports = create_tables;