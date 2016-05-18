// modules =================================================
var express        = require('express'),
    app            = express(),
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
   
    _ = require('underscore'),
     http = require('http'),
    io = require('socket.io');


// configuration ===========================================

var db = require('./config/db')();
mongoose.connect(db.url,db.options, function(err) {
        console.log(err ? err : 'Connected to Database');
});


// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

var initFile = require('./app/controllers/init');

initFile.config(mongoose,function(err){
    if(!err){

        var models = ['User','Config','Message'];
        //Inject Models
        _.each(models,function(model){
            require('./app/models/'+model)(mongoose);
        })
        //Inject Routes
        _.each(models,function(model){
            try{
                require('./app/routes/'+model+'Route')(app);
            }
            catch(e){
                console.log(model+'Route.js : ',e);
            }
        })
        require('./app/routes/UtilsRoute.js')(app);
        require('./app/routes/routes.js')(app);
            initFile.seed();
        

        var router = express.Router();

        router.use(function(req, res, next) {
            next();
        });
        // start app ===============================================
        var port = 3000;
         server = http.createServer(app,function(req, res){
        });
        server.listen(port);

        // socket.io 
        var socket = io.listen(server);

        socket.on('connection', function(client){
          client.on('message', function(msg){
              socket.send(msg);
          })
        }); 
        exports = module.exports = app;

    } else {
        console.log(err);
    }
});