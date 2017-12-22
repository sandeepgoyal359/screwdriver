'use strict';

const Dogwater = require('dogwater');
const Store = require('sails-postgresql');

exports.register = (server, options, next) => {
    server.register({
        register: Dogwater,
        options: {
            adapters: {
                postgres: Store
            },
            connections: {
                screwdriver: {
                    adapter: 'postgres',
                    database: 'screwdriver',
                    host: 'localhost',
                    user: 'postgres',
                    password: 'ITSASECRET',
                    port: 5432
                    // schema: true, // default true, not sure what this does
                    // ssl: false    // default false,  leaving false for local testing
                }
            }
        }
    }, next);
};

exports.register.attributes = {
    name: 'dogwater'
};
