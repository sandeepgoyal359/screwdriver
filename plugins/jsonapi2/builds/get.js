'use strict';

const { Serializer } = require('jsonapi-serializer');
const boom = require('boom');

/**
 * [BuildSerializer description]
 * @method      BuildSerializer
 * @param       {[type]}        model [description]
 * @constructor
 */
class BuildSerializer {
    static serialize(model) {
        return new Serializer('builds', model, {
            topLevelLinks: { self: '/v6/builds' },
            dataLinks: {
                self() {
                    return `/v6/builds/${model.id}`;
                }
            },
            attributes: Object.keys(model.toJson())
        });
    }
}

module.exports = () => ({
    method: 'GET',
    path: '/builds/{id}',
    config: {
        description: 'Get a single build',
        notes: 'Returns a build record',
        tags: ['api', 'builds'],
        handler: (request, reply) => {
            const factory = request.server.app.buildFactory;

            return factory.get(request.params.id)
                .then((model) => {
                    if (!model) {
                        throw boom.notFound('Build does not exist');
                    }

                    return reply(BuildSerializer.serialize(model));
                })
                .catch(err => reply(boom.wrap(err)));
        }
    }
});
