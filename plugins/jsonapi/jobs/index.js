'use strict';

const JSONAPIConverter = require('waterline-jsonapi');

exports.register = (server, options, next) => {
    server.dogwater({
        identity: 'jobs', // unique name for model/collection, also used as db tableName if not defined elsewhere
        // tableName: 'jobs', // e.g. 'beta-jobs'
        autoPK: false, // don't generate a uuid as a primary key
        migrate: 'safe', // don't auto modify the db schema to match the model definition
        autoCreatedAt: false, // don't add/expect a createdAt column
        autoUpdatedAt: false, // don't add/expect a updatedAt column
        connection: 'screwdriver', // the pgsql connection
        attributes: { // all the things, see also "Anchor" validation library
            id: {
                type: 'integer',
                autoincrement: true,
                primaryKey: true,
                unique: true
            },
            name: 'string',
            permutations: 'json',
            description: 'string',
            pipelineId: { model: 'pipelines' },
            state: 'text',
            archived: 'boolean',
            builds: {
                collection: 'builds',
                via: 'jobId'
            }
        }
    });

    server.route({
        method: 'get',
        path: '/jobs/{id}',
        handler: (request, reply) => {
            const Jobs = request.collections().jobs;

            return Jobs.findOne(request.params.id).populate('builds') // automatically add event data
                .then((j) => {
                    const c = new JSONAPIConverter(j, Jobs);

                    c.api_root = '/v5';

                    reply(c.generate());
                });
        }
    });

    next();
};

exports.register.attributes = {
    name: 'jobs-jsonapi'
};
