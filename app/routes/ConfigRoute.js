var mongoose = require('mongoose'),
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    _ =           require('underscore'),
    shell = require('shelljs/global'),
    fsExtra = require('fs.extra'),
    replace = require("replace"),
    prependFile = require('prepend-file'),
    AuthCtrl =  require('../controllers/authCtrl'),
    Response =  require('../helpers/response'),
    Config = mongoose.model('Config'),
    isWindows = /^win/.test(process.platform);

var routesApiConfig = [
    {
        path: '/config',
        httpMethod: 'GET',
        access: ['SUPER_ADMIN'],
        middleware: [function(req, res) {
            console.log("GET - /config");
            return Config.findOne(function(err,config){
                if(!err) {
                    return Response.build(res,200,config);
                } else {
                    return Response.build(res,500,err);
                }
            })
        }]
    },
    {
        path: '/config',
        httpMethod: 'PUT',
        access: ['SUPER_ADMIN'],
        middleware: [function(req, res) {
            console.log('PUT - /config',req.body);
            return Config.findOneAndUpdate({},{config : req.body},function(err,config){
                if(!err) {
                    global.CONFIG = config.config;
                    console.log("changed",global.CONFIG)
                    return Response.build(res,201,config);
                } else {
                    return Response.build(res,500,err);
                }
            })
        }]
    },
    {
        path: '/config/shell/:operation',
        httpMethod: 'GET',
        access: ['SUPER_ADMIN'],
        middleware: [function(req, res) {
            console.log('GET - /config/shell/operation',req.params.operation);
            switch(req.params.operation){
                case 'update' :
                    exec('svn update', function(err, output) {
                        console.log('Running svn update : ', output);
                        if(err){
                            return Response.build(res,500,{data : output});
                        }
                        return Response.build(res,200,{data : output});
                    });
                    break;
                case 'resolve' :
                    exec('svn resolve -R --accept theirs-full', function(err, output) {
                        console.log('Running svn resolve : ', output);
                        if(err){
                            return Response.build(res,500,{data : output});
                        }
                        return Response.build(res,200,{data : output});
                    });
                    break;
                case 'install' :
                    exec((isWindows ? '' : 'sudo ') + 'npm install', function(err, output) {
                        console.log('Running npm install : ', output);
                        if(err){
                            return Response.build(res,500,{data : output});
                        }
                        return Response.build(res,200,{data : output});
                    });
                    break;
                case 'restart' :
                    fsExtra.copy(global.CONFIG.server.node.oldFile, global.CONFIG.server.node.newFile, { replace: false }, function (err) {
                        console.log('Restarting server...');
                        if(err){
                            return Response.build(res,500,{data : err});
                        }
                        setTimeout(function(){
                            process.exit();
                        },1000);
                        return Response.build(res,200,{data : 'Server is going to restart.'});
                    });
                    break;
            }
        }]
    },
    {
        path: '/config/app/monitor/:operation',
        httpMethod: 'POST',
        access: ['SUPER_ADMIN'],
        middleware: [function(req, res) {
            console.log('POST - /config/app/monitor',req.body);

            switch(req.params.operation){
                case 'start' :
                    fsExtra.copy(path.resolve('./node_modules/newrelic/newrelic.js'), 'newrelic.js', { replace: false }, function (err) {
                        replace({
                            regex: "My Application",
                            replacement: req.body.name,
                            paths: ['newrelic.js']
                        });
                        replace({
                            regex: "license key here",
                            replacement: req.body.licence,
                            paths: ['newrelic.js']
                        });

                        replace({
                            regex: "require\\('newrelic'\\);",
                            replacement: '',
                            paths: ['befyne.js']
                        });

                        prependFile('befyne.js',"require('newrelic');", function(err) {
                            if (err) {
                                return Response.build(res,500,{data : err});
                            } else {
                                Response.build(res,200,{data : 'success'});
                                return exec('node befyne.js',function(){})
                            }
                        });

                    });
                    break;

                case 'stop' :
                    replace({
                        regex: "require\\('newrelic'\\);",
                        replacement: '',
                        paths: ['befyne.js']
                    });

                    async.each(['newrelic.js','newrelic_agent.log'],function(file,cb){
                        fsExtra.remove(file, function (err) {
                            cb(err);
                        })
                    },function(err){
                        if(err){
                            return Response.build(res,500,err);
                        }
                        return Response.build(res,200);
                    })

            }

        }]
    },
    {
        path: '/config/app/monitor/active',
        httpMethod: 'GET',
        access: ['SUPER_ADMIN'],
        middleware: [function(req, res) {
            console.log('GET - /config/app/monitor/active');
            return Response.build(res,200,{state : false});
            // var searching = require('searching')
            // fs.readFile("befyne.js", "utf-8", function(err, data) {
            //     if(data.indexOf("require('newrelic')") >= 0 ){
            //         return Response.build(res,200,{state : true});
            //     }
            //     return Response.build(res,200,{state : false});
            // });

        }]
    }
]

module.exports = function(app) {

    _.each(routesApiConfig, function(route) {
        route.middleware.unshift(function(req,res,next){AuthCtrl.ensureAuthorizedApi(req,res,next,routesApiConfig)});
        var args = _.flatten([route.path, route.middleware]);

        switch(route.httpMethod.toUpperCase()) {
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



