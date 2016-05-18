var bcrypt = require('bcrypt-nodejs'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    fs = require('fs'),
    path =require('path'),
    AuthCtrl = require('../controllers/authCtrl'),
    Response = require('../helpers/response'),
    User = mongoose.model('User');

var makePassword = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxy0123456789";
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

var routesApiUser = [
    {
        path: '/api/users/:page/:limit',
        httpMethod: 'POST',
        access: ['ADMIN', 'SUPER_ADMIN'],
        middleware: [function (req, res) {
            console.log("POST - /api/users/:page/:limit", req.params.page, req.params.limit, req.body);
            var query = {};
            var sort = {};
            if (req.body.pattern) {
                _.each(req.body.pattern, function (value, key) {
                    console.log('value',req.body.pattern);
                    if ( User.schema.paths[key].instance == "String" && value ){
                        console.log("shema", User.schema.paths[key])
                      query[key] = new RegExp(value, 'ig');
                  }
                    else if (User.schema.paths[key].instance == "Boolean" && value )
                        query[key] = value;
                    /*else
                     query[key] = value;*/
                })

            }
            if (req.body.sortBy) {
                sort[req.body.sortBy] = req.body.orderAsc ? 1 : -1;
            }
            return User.paginate(query, {
                page: req.params.page,
                sortBy: sort,
                limit: parseInt(req.params.limit),
                deepPopulate : ['parrainage._user']
            }, function (err, users, totalPages, totalItems) {
                if (!err) {
                    return Response.build(res, 200, {data: users, count: totalItems});
                } else {
                    return Response.build(res, 500, err);
                }
            });


        }]
    },

    {
        path: '/api/users',
        httpMethod: 'GET',
        access: ['ADMIN', 'SUPER_ADMIN'],
        middleware: [function (req, res) {
            console.log("GET - /api/users");
            return User.find()
                .exec(function (err, users) {
                    if (!err) {
                        return Response.build(res, 200, users);
                    } else {
                        return Response.build(res, 500, err.errors);
                    }
                })
        }]
    },
    {
        path: '/api/users',
        httpMethod: 'POST',
        access: ['ADMIN', 'SUPER_ADMIN'],
        middleware: [function(req, res) {
            console.log('POST - /api/users',req.body);
            var user = new User(req.body);
            user.password = user.generateHash(req.body.password);
            user.save(function (err,user) {
                if (err) {
                    console.log("error",err);
                    return Response.build(res,500,err);
                } else {
                    if(user.active) {
                       return Response.build(res,201,user);

                    } else {
                        return Response.build(res,201,user);
                    }
                }
            });
        }]
    },
     {
        path: '/api/users/register',
        httpMethod: 'POST',
        access: ['ADMIN', 'SUPER_ADMIN','USER'],
        middleware: [function(req, res) {
            console.log('POST - /api/users',req.body);
            var user = new User(req.body);
            user.password = user.generateHash(req.body.password);
            user.save(function (err,user) {
                if (err) {
                    console.log("error",err);
                    return Response.build(res,500,err);
                } else {                
                        return Response.build(res,201,user);                    
                }
            });
        }]
    },{
     
        path: '/api/users/edit/password/:id',
        httpMethod: 'POST',
        middleware: [function(req, res) {
            console.log('POST - /api/users',req.body);
            var user = new User(req.body);
            password = user.generateHash(req.body.password);
              User.findById(req.params.id)
                .exec(function(err, user) {
                    if (err) {
                        return Response.build(res, 500, err.errors);
                    } else if (!user) {
                        return Response.build(res, 404, 'user not found');
                    } else {
                        if(user.validPassword(req.body.old)){
                        user.password=user.generateHash(req.body.confirm);;
                        User.findByIdAndUpdate(req.params.id, user, {new: true}, function (err, user) {
                            if (err) {
                        return Response.build(res, 500, err.errors);
                    } else {
                         return Response.build(res, 200, user);

                        }

                    });
                    }
                    else{
                return Response.build(res, 500, "veuillez vérifiez votre mot de passe");                    }
                }
            });
        }]
    }
    
    , {
        path: '/api/users/:id',
       httpMethod: 'PUT',
        access: ['ADMIN', 'SUPER_ADMIN', 'USER'],
        middleware: [function (req, res) {
            console.log('PUT - /api/users',req.body);
            var password = "";
       
            if (!req.body.password) {
                delete req.body.password;
            } else {
                password = req.body.password;
                req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
                fs.readFile(path.resolve('./config/templates/send-password-tpl.html'), 'utf8', function (err, data) {
                    if (err) {
                        return console.log(err);
                    } else {
                        data = data.replace("befyne.password", password);
                        nodeMailer.send(
                            global.CONFIG.mail.options[global.CONFIG.mail.selectedOption].from,
                            req.body.email,
                            'Bienvenue à “Befyne”',
                            data
                        );
                    }
                });
            }
            return User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, user) {
                if (err) {
                    return Response.build(res, 500, err);
                } else if (!user) {
                    return Response.build(res, 404, 'user Not found');
                }
                else {
                    console.log('updated user',user);
                    return Response.build(res, 200,user);
                }
            })
        }]
    },
    // Addresses ROUTES STARTS
    {
        path: '/api/users/address/:id',
        httpMethod: 'PUT',
        access: ['ADMIN', 'SUPER_ADMIN', 'USER'],
        middleware: [function (req, res) {
            ///api/user/address/:idUser/:id
            console.log('PUT - /api/users/address', req.body);
            console.log('user id', req.params.id);
            User.findById(req.params.id)
                .exec(function(err, user) {
                if(err)
                    return Response.build(res, 500, err);
                if (!user)
                    return Response.build(res, 404, 'user not found');
                user.addresses.push(req.body);
                user.save(function (err,user) {
                    if(err)
                        return Response.build(res, 500, err);
                    return Response.build(res, 200, user);
                });
            });
        }]
    },
    // Addresses ROUTES ENDS
    {
    path: '/api/users/edit/:id',
    httpMethod: 'PUT',
    middleware: [function (req, res) {
    console.log('PUT - /api/users', req.body);
    var password = "";
            if (!req.body.password) {
                delete req.body.password
            } else {
                password = req.body.password;
                req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
                fs.readFile(path.resolve('./config/templates/send-password-tpl.html'), 'utf8', function (err, data) {
                    if (err) {
                        return console.log(err);
                    } else {
                        data = data.replace("befyne.password", password);
                        nodeMailer.send(
                            global.CONFIG.mail.options[global.CONFIG.mail.selectedOption].from,
                            req.body.email,
                            'Bienvenue à “Befyne”',
                            data
                        );
                    }
                });
            }
    return User.findByIdAndUpdate(req.params.id, req.body, {new: false}, function (err, user) {
        if (err) {
            return Response.build(res, 500, err);
        } else if (!user) {
            return Response.build(res, 404, 'user Not found');
        }
        else {
            return Response.build(res, 200,user);
        }
    })
}]
},
 {
        path: '/api/user/:id/:page/:limit',
        httpMethod: 'POST',
        access: ['ADMIN', 'SUPER_ADMIN'],
        middleware: [function (req, res) {
            console.log("POST - /api/users/:page/:limit", req.params.page, req.params.limit, req.body)
            var query = {};
            var sort = {};
            if (req.body.pattern) {
              _.each(req.body.pattern,function(value,key){
                    if(Order.schema.paths[key])
                    {
                        if(Order.schema.paths[key].instance=="String" && value)
                            query[key] = new RegExp(value, 'ig');
                        if(Order.schema.paths[key].instance=="Boolean" && value!="")
                            query[key] = value;
                        /*else
                         query[key] = value;*/
                    }
                })
                 if(req.body.pattern['client'])
                {
                    var value = req.body.pattern['client'];
                    query["$and"] = [];
                    query["$and"].push({
                        $or :  [
                            {"_user.firstName" :  new RegExp(value, 'ig')},
                            {'_user.lastName'  :  new RegExp(value, 'ig')}
                        ]
                    })
                }
                if(req.body.pattern['fromDate'] || req.body.pattern['toDate'])
                {
                    query["$and"] = query["$and"] ? query["$and"] : [];
                    if(req.body.pattern['fromDate'])
                    {
                        query["$and"].push({date : {$gte : req.body.pattern.fromDate}})
                    }
                    if(req.body.pattern['toDate'])
                    {
                        query["$and"].push({date : {$lte : req.body.pattern.toDate}})
                    }
                }
            }
            if (req.body.sortBy) {
                sort[req.body.sortBy] = req.body.orderAsc ? 1 : -1;
            }            
            query._id=req.params.id;
            console.log(query);
            return Order.paginate(query, {
                page: req.params.page,
                sortBy: sort,
                limit: parseInt(req.params.limit),             
            }, function (err, orders, totalPages, totalItems) {
                if (!err) {
                    return Response.build(res, 200, {data:orders, count: totalItems});
                } else {
                    return Response.build(res, 500, err);
                }
            });


        }]
    },

    {
        path: '/api/users/:id',
        httpMethod: 'GET',
        access: ['ADMIN', 'SUPER_ADMIN', 'USER'],
        middleware: [function (req, res) {
            console.log("GET - /api/users/:id"+req.params.id);
            return User.findById(req.params.id)
                    .deepPopulate('parrainage._user')
                .exec(function (err, user) {
                    if (err) {
                        return Response.build(res, 500, err.errors);
                    } else if (!user) {
                        return Response.build(res, 404, 'user not found');
                    } else {
                        return Response.build(res, 200, user);
                    }
                });
        }]
    },

    {
        path: '/api/findParrainage/:id',
        httpMethod: 'GET',
        access: ['ADMIN', 'USER','SUPER_ADMIN'],
        middleware: [function (req, res) {
            console.log(req.params.email);
            return User.findOne({'parrainage._id':req.params.id})
                    .deepPopulate('parrainage._user')
                .exec(function (err, user) {
                    if (err) {
                        return Response.build(res, 500, err.errors);
                    } else if (!user) {
                        return Response.build(res, 404, 'user not found');
                    } else {
                        console.log(user);
                        return Response.build(res, 200, user);
                    }
                });
        }]
    },
      
    {
        path: '/api/users/:id',
        httpMethod: 'DELETE',
        access: ['ADMIN', 'SUPER_ADMIN'],
        middleware: [function (req, res) {
            console.log("DELETE - /api/users/:id");
            return User.findByIdAndRemove(req.params.id, function (err, user) {
                if (err) {
                    return Response.build(res, 500, err.errors);
                } else if (!user) {
                    return Response.build(res, 404, 'user Not found');
                } else {
                    return Response.build(res, 200);
                }
            });
        }]
    },
    {
        path: '/api/users/import',
        httpMethod: 'POST',
        access: ['ADMIN', 'SUPER_ADMIN'],
        middleware: [function (req, res) {
            console.log('POST- /api/users/import');
            async.map(req.body, function (user, cb) {
                User.find({email: user.email}).exec(function(err, users){
                    if(!err){
                        if(users.length == 0){
                            var password = makePassword(5);
                            var userTosave = new User(user);
                            userTosave.password = userTosave.generateHash(password);
                            userTosave.role = "USER";
                            userTosave.save(function (err) {
                                fs.readFile(path.resolve('./config/templates/new-user-created-tpl.html'), 'utf8', function (err, data) {
                                    if (err) {
                                        return console.log(err);
                                    } else {
                                        data = data.replace("#PASSWORD#", password);
                                        nodeMailer.send(
                                            global.CONFIG.mail.options[global.CONFIG.mail.selectedOption].from,
                                            userTosave.email,
                                            'Bienvenue à Befyne.org',
                                            data
                                        );
                                        console.log('sent to :: ', userTosave.email, password);
                                        cb(err);
                                    }
                                });
                            });
                        }else{
                            cb(err);
                        }
                    }
                });
            }, function (err) {
                if (err) {
                    return Response.build(res, 500, err);
                }
                else {
                    return Response.build(res, 200);
                }
            });
        }]
    },
    {
        path: '/api/users/password/reset',
        httpMethod: 'PUT',
        middleware: [function(req, res) {
            console.log('PUT - /api/users/password/reset',req.body);
            return User.findOne({email : req.body.email}, function (err, user) {
                console.log('user!!',user);
                if (err) {
                    return Response.build(res,500,err);
                } else if (!user) {
                    return Response.build(res,404,'User Not found');
                } else {
                    fs.readFile(path.resolve('./config/templates/reset-password-tpl.html'), 'utf8', function (err, data) {
                        if (err) {
                            return console.log(err);
                        } else {
                            var password = Math.random().toString(36).slice(-8);
                            data = data.replace("befyne.password", password);
                            user.password = user.generateHash(password);
                            user.save(function(err){
                                if(!err){
                                    nodeMailer.send(
                                        global.CONFIG.mail.options[global.CONFIG.mail.selectedOption].from,
                                        user.email,
                                        'Récupérer votre mot de passe “BeFYNE”',
                                        data
                                    );
                                    return Response.build(res,200);
                                } else {
                                    return Response.build(res,500,err);
                                }
                            });
                        }
                    });
                }
            })
        }]
    }
   ]

module.exports = function (app) {
    _.each(routesApiUser, function (route) {
        if( route.path != '/api/users/password/reset' )
        route.middleware.unshift(function (req, res, next) {
            AuthCtrl.ensureAuthorizedApi(req, res, next, routesApiUser)
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

