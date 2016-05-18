var bcrypt = require('bcrypt-nodejs'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    AuthCtrl = require('../controllers/authCtrl'),
    Response = require('../helpers/response'),
    Message = mongoose.model('Message');

var routesApiMessage = [{
    path: '/api/messages',
    httpMethod: 'POST',
    access: ['ADMIN', 'USER'],
    middleware: [function(req, res) {
        var message = new Message(req.body);

        message.save(function(err, response) {
            if (err) {
                return Response.build(res, 500, err);
            } else {

                return Response.build(res, 201, response);
            }
        });
    }]
}, {
    path: '/api/messages/:page/:limit',
    httpMethod: 'POST',
    access: ['ADMIN', 'SUPER_ADMIN', 'USER'],

    middleware: [function(req, res) {
        console.log('hs', req.body)
        return Message.paginate({
            'toemail': req.body.id
        }, {
            page: req.params.page,
            limit: parseInt(req.params.limit),
            populate: ['writer']
        }, function(err, messages, totalPages, totalItems) {
            if (!err) {
                return Response.build(res, 200, {
                    data: messages,
                    count: totalItems
                });
            } else {
                return Response.build(res, 500, err);
            }
        });
    }]
}, {
    path: '/api/messages/:id',
    httpMethod: 'PUT',
    access: ['ADMIN', 'USER'],

    middleware: [function(req, res) {
        return Message.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        }, function(err, message) {
            if (err) {
                return Response.build(res, 500, err);
            } else if (!message) {
                return Response.build(res, 404, 'message Not found');
            } else {
                return Response.build(res, 200, message);
            }
        })
    }]
}, {
    path: '/api/messages/user/:id',
    httpMethod: 'GET',
    access: ['ADMIN', 'USER'],

    middleware: [function(req, res) {

        Message.find({
                'toemail': req.params.id,
                'isReaded': false
            })
            .populate('writer')
            .exec(function(err, message) {
                if (err) {
                    return Response.build(res, 500, err);
                } else if (!message) {
                    return Response.build(res, 404, 'message not found');
                } else {
                    return Response.build(res, 200, message);
                }
            });
    }]
}, {
    path: '/api/messagesByid/:id',
    httpMethod: 'GET',
    access: ['ADMIN', 'USER'],

    middleware: [function(req, res) {

        Message.findById(req.params.id)
            .populate('writer')
            .exec(function(err, message) {
                if (err) {
                    return Response.build(res, 500, err);
                } else if (!message) {
                    return Response.build(res, 404, 'message not found');
                } else {
                    return Response.build(res, 200, message);
                }
            });
    }]
}, {
    path: '/api/messages/:id',
    httpMethod: 'DELETE',
    access: ['ADMIN', 'USER'],
    middleware: [function(req, res) {
        return Message.findByIdAndRemove(req.params.id, function(err, message) {
            if (err) {
                return Response.build(res, 500, err);
            } else if (!message) {
                return Response.build(res, 404, 'message Not found');
            } else {
                return Response.build(res, 200);
            }
        });
    }]
}]

module.exports = function(app) {
    _.each(routesApiMessage, function(route) {

        route.middleware.unshift(function(req, res, next) {
            AuthCtrl.ensureAuthorizedApi(req, res, next, routesApiMessage)
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
                throw new Error('Invalid HTTP method specified for route ' + route.path);
                break;
        }
    });

}