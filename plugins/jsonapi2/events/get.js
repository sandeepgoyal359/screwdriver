'use strict';

const { Serializer } = require('jsonapi-serializer');
const boom = require('boom');
const joi = require('joi');
const schema = require('screwdriver-data-schema');
const idSchema = joi.reach(schema.models.event.base, 'id');

class EventSerializer {
    static serialize(model, builds) {
        const modelData = model.toJson();
        const attributes = Object.keys(modelData);
        const data = {
            topLevelLinks: { self: `/v6/events/${model.id}` },
            dataLinks: {
                self() {
                    return `/v6/events/${model.id}`;
                }
            },
            keyForAttribute: 'camelCase',
            attributes
        };

        if (Array.isArray(builds)) {
            attributes.push('builds');
            modelData.builds = builds.map(b => b.toJson());

            data.builds = {
                ref: 'id',
                included: true,
                attributes: Object.keys(modelData.builds[0]),
                relationshipLinks: {
                    self(record) {
                        return `/v6/events/${record.id}/builds`;
                    }
                },
                includedLinks: {
                    self(record, current) {
                        return `/v6/builds/${current.id}`;
                    }
                }
            };
        }

        return new Serializer('events', data).serialize(modelData);
    }
}

module.exports = () => ({
    method: 'GET',
    path: '/events/{id}',
    config: {
        description: 'Get a single event',
        notes: 'Returns a event record',
        tags: ['api', 'events'],
        handler: (request, reply) => {
            const factory = request.server.app.eventFactory;

            return factory.get(request.params.id)
                .then((model) => {
                    if (!model) {
                        throw boom.notFound('Event does not exist');
                    }

                    return model.getBuilds().then(builds =>
                        reply(EventSerializer.serialize(model, builds)));
                })
                .catch(err => reply(boom.wrap(err)));
        },
        validate: {
            params: {
                id: idSchema
            }
        }
    }
});
