var _ =           require('underscore'),
    path =      require('path'),
     mongoose=require('mongoose'),
    AuthCtrl =  require('../controllers/authCtrl'),
        User = mongoose.model('User');
       // console.log(fb.clientID);
  

var routes = [
    {
        path: '/components/*',
        httpMethod: 'GET',
        middleware: [function (req, res) {
            var requestedView = path.join('./', req.url);
            console.log(requestedView)
            res.sendFile(requestedView);
        }]
    },
    {
        path: '/login',
        httpMethod: 'POST',
        middleware: [AuthCtrl.login]
    },
    {
        path: '/logout',
        httpMethod: 'POST',
        middleware: [AuthCtrl.logout]
    },
    {
        path: '/auth/google',
        httpMethod: 'POST',
        middleware: [AuthCtrl.authG]
    },
    {
        path: '/isAlive',
        httpMethod: 'GET',
        middleware: [function(req, res) {
            console.log(req._user);
            if(req._user){
                 //console.log("GET - /isAlive"+res.json(req._user));
               return res.json(req._user);
            } else{
                return res.sendStatus(401);
            }

        }]
    }, 
     {
        path: '/*',
        httpMethod: 'GET',
        middleware: [function(req, res) {
            res.sendFile(path.resolve('./public/index.html'));
        }]

    }
];


module.exports = function(app) {
     _.each(routes, function(route) {
        if(route.path != '/login' && route.path != '/auth/google'   && route.path != '/*')
            route.middleware.unshift(function(req,res,next){AuthCtrl.ensureAuthorizedApi(req,res,next,routes)});
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