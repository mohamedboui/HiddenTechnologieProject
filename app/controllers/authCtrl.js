var mongoose = require('mongoose'),
    _ = require('underscore'),
    User = mongoose.model('User'),
    auth = require('../helpers/auth'),
    redisHelper = require('../helpers/redisHelper'),
    tokenHelper = require('../helpers/tokenHelper');

module.exports = {
    login: function(req, res, next) {
        if (req.body.username === global.CONFIG.superAdmin.username && req.body.password === global.CONFIG.superAdmin.password) {
            var user = {
                "firstName": global.CONFIG.superAdmin.firstName,
                "lastName": global.CONFIG.superAdmin.lastName,
                "username": global.CONFIG.superAdmin.username,
                "role": global.CONFIG.superAdmin.role,
                "isAdmin": true
            }
            auth.createAndStoreToken(user, 60 * 60, function(err, token) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(400);
                }
                return res.json({
                    token: token
                });
            });

        } else {
            return User.findOne({
                email: req.body.username
            }).exec(function(err, user) {
                if (!err) {
                    console.log("Error", user);
                    if (!user) {
                        return res.status(404).end('Username not found');
                    } else if (!req.body.password) {
                        return res.status(402).end('Password Empty');
                    } else if (!user.validPassword(req.body.password)) {
                        return res.status(405).end('Wrong username or password');
                    } else if (!user.active) {
                        return res.status(403).end('User is inactive');
                    } else {
                        auth.createAndStoreToken(user, 60 * 60, function(err, token) {
                            if (err) {
                                console.log(err);
                                return res.send(400);
                            }
                            return res.json({
                                token: token
                            });
                        });
                    }
                } else {
                    console.log('ERROR', err);
                    return res.sendStatus(500);
                }
            });
        }
    },
    authG: function(req, res, next) {
        console.log(req.body)
        User.findOne({
            "email": req.body.email
        }, function(err, user) {
            if (!err) {
                if (!user) {
                    var newuser = new User(req.body);
                    delete newuser.access_token;
                    newuser.save(function(err, user) {
                        redisHelper.setTokenWithData(req.body.access_token, newuser, 60 * 60, function(err, success) {
                            if (err) return res.send(400);


                            if (success) {
                                return res.json({
                                    token: req.body.access_token
                                });
                            }

                        });
                    });
                } else {
                    redisHelper.setTokenWithData(req.body.access_token, user, 60 * 60, function(err, success) {
                        if (err) return res.send(400);


                        if (success) {
                            return res.json({
                                token: req.body.access_token
                            });
                        }

                    });
                }

            } else {
                next(err);
            }

        })
    },
    logout: function(req, res) {
        auth.expireToken(req.headers, function(err, success) {
            if (err) {
                console.log(err);
                return res.sendStatus(401);
            }

            if (success) res.sendStatus(200);
            else res.sendStatus(401);
        });
    },

    ensureAuthorizedApi: function(req, res, next, routes) {
        var route = _.findWhere(routes, {
            path: req.route.path,
            httpMethod: req.route.stack[0].method.toUpperCase()
        });
        var headers = req.headers;
        if (headers == null) return res.sendStatus(401);

        // Get token
        try {
            var token = tokenHelper.extractTokenFromHeader(headers);
        } catch (err) {
            console.log(err);
            return res.sendStatus(401);
        }
        //Verify it in redis, set data in req._user
        redisHelper.getDataByToken(token, function(err, data) {
            if (err) return res.sendStatus(401);
            if (data.role !== 'SUPER_ADMIN') {
                User.findById(data._id).exec(function(err, user) {
                    if (!err) {
                        req._user = user.toObject();
                        // if route.access is undefined so the route is public
                        if (route.access && route.access.indexOf(data.role) === -1) {
                            return res.sendStatus(403);
                        }
                        next();
                    }
                });
            } else {
                req._user = data;
                next();
            }

        });
    }

};