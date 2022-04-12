const cassandra = require('cassandra-driver');
const UnderscoreCqlToCamelCaseMappings = cassandra.mapping.UnderscoreCqlToCamelCaseMappings;

const mappingOptions = {
    // just map the partition key columns for each table
    models: {
        'Profile': {
            tables: ['profile_by_task', 'profile_by_email'],
            keyspace: 'users',
            mappings: new UnderscoreCqlToCamelCaseMappings(),
            columns: {
                'user_id': 'userId',
                'task_id': 'taskId'
            }
        },
        'Task': {
            tables: ['task_by_team'],
            keyspace: 'users',
            mappings: new UnderscoreCqlToCamelCaseMappings(),
            columns: {
                'team_id': 'teamId'
            }
        },
        'Message': {
            tables: ['message_by_user', 'message_by_bad_word'],
            keyspace: 'users',
            mappings: new UnderscoreCqlToCamelCaseMappings(),
            columns: {
                'user_id': 'userId'
            }
        }
    }
};

module.exports = mappingOptions;