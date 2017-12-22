'use strict';

const JSONAPIConverter = require('waterline-jsonapi');

exports.register = (server, options, next) => {
    server.dogwater({
        identity: 'builds',
        // tableName: 'builds',
        autoPK: false,
        migrate: 'safe',
        autoCreatedAt: false,
        autoUpdatedAt: false,
        connection: 'screwdriver',
        attributes: {
            id: {
                type: 'integer',
                autoincrement: true,
                primaryKey: true,
                unique: true
            },
            jobId: { model: 'jobs' },
            eventId: { model: 'events' },
            parentBuildId: 'integer',
            environment: 'json',
            number: 'integer',
            container: 'text',
            sha: 'text',
            commit: 'json',
            createTime: 'text',
            startTime: 'text',
            endTime: 'text',
            parameters: 'json',
            meta: 'json',
            steps: 'json',
            status: 'text',
            statusMessage: 'text'
        }
    });

    server.route({
        method: 'get',
        path: '/builds/{id}',
        handler: (request, reply) => {
            const Builds = request.collections().builds;

            return Builds.findOne(request.params.id).populate('eventId')
                .then((b) => {
                    const c = new JSONAPIConverter(b, Builds);

                    c.api_root = '/v5';

                    reply(c.generate());
                });
        }
    });

    next();
};

exports.register.attributes = {
    name: 'builds-jsonapi'
};
