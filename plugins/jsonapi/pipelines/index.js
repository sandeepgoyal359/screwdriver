'use strict';

const JSONAPIConverter = require('waterline-jsonapi');

exports.register = (server, options, next) => {
    server.dogwater({
        identity: 'pipelines', // unique name for model/collection, also used as db tableName if not defined elsewhere
        // tableName: 'pipelines', // e.g. 'beta-pipelines'
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
            scmUri: 'string',
            scmRepo: 'json',
            createTime: 'text',
            admins: 'json',
            annotations: 'json',
            scmContext: 'string',
            lastEventId: { model: 'events' },
            workflowGraph: 'json',
            jobs: {
                collection: 'jobs',
                via: 'pipelineId'
            }
        }
    });

    server.route({
        method: 'get',
        path: '/pipelines/{id}',
        handler: (request, reply) => {
            const Pipelines = request.collections().pipelines;

            return Pipelines.findOne(request.params.id)
                .populate('lastEventId') // automatically add last event data
                .populate('jobs') // automatically add job data
                .then((p) => {
                    const c = new JSONAPIConverter(p, Pipelines);

                    c.api_root = '/v5';

                    reply(c.generate());
                });
        }
    });

    next();
};

exports.register.attributes = {
    name: 'pipelines-jsonapi'
};
