'use strict';

const getRoute = require('./get');

exports.register = (server, options, next) => {
    server.route([
        getRoute()
    ]);

    next();
};

exports.register.attributes = {
    name: 'builds-sqlize-jsonapi'
};
