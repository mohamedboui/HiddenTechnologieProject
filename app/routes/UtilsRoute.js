var _ = require('underscore'),
    mongoose = require('mongoose'),
    AuthCtrl = require('../controllers/authCtrl'),
    Response = require('../helpers/response'), 
    fs = require('fs'),
    path = require('path');
var routesApi = [


]


module.exports = function(app) {
    _.each(routesApi, function(route) {
        if (route.path != '/api/file/download/:name' && route.path != '/api/contact')
            route.middleware.unshift(function(req, res, next) {
                AuthCtrl.ensureAuthorizedApi(req, res, next, routesApi)
            });
        var args = _.flatten([route.path, route.middleware]);
        switch (route.httpMethod.toUpperCase()) {
            case 'GET':
                app.get.apply(app, args);
                break;
            case 'POST':
                app.post.apply(app, args);
                break;
            case 'PUT':
                app.put.apply(app, args);
                break;
            case 'DELETE':
                app.delete.apply(app, args);
                break;
            default:
                throw new Error('Invalid HTTP method spec ified for route ' + route.path);
                break;
        }
    });

}