'use strict';

const JSONAPIConverter = require('waterline-jsonapi');

exports.register = (server, options, next) => {
    server.dogwater({
        identity: 'events', // unique name for model/collection, also used as db tableName if not defined elsewhere
        // tableName: 'events', // e.g. 'beta-events'
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
            causeMessage: 'string',
            commit: 'json',
            createTime: 'text',
            creator: 'json',
            pipelineId: 'integer',
            sha: 'string',
            type: 'text',
            startFrom: 'text',
            workflowGraph: 'json',
            builds: {
                collection: 'builds',
                via: 'eventId'
            }
        }
    });

    server.route({
        method: 'get',
        path: '/events/{id}',
        handler: (request, reply) => {
            const Events = request.collections().events;

            return Events.findOne(request.params.id).populate('builds') // automatically add all builds to event
                .then((e) => {
                    const c = new JSONAPIConverter(e, Events);

                    c.api_root = '/v5';

                    reply(c.generate());
                });
        }
    });

    next();
};

exports.register.attributes = {
    name: 'events-jsonapi'
};
