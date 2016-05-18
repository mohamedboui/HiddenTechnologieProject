var _ = require('underscore');
var async = require('async');

module.exports = {

    config: function(mongoose, next) {
        require('../models/Config')(mongoose);
        var Config = mongoose.model('Config');
        var data = require('../../config/settings');
        Config.findOne(function(err, config) {
            if (!err) {
                if (!config) {
                    new Config({
                        config: data
                    }).save(function(err) {
                        if (!err) {
                            global.CONFIG = data;
                        }
                        next(err);
                    });
                } else {
                    var conf = config.toObject().config;
                    _.each(data, function(value, key) {
                        if (!conf.hasOwnProperty(key)) {
                            conf[key] = value;
                        }
                    })
                    config.config = conf;
                    global.CONFIG = config.config;

                    config.save(function(err) {
                        if (!err) {
                            global.CONFIG = config.config;
                        }
                        next(err);
                    });
                }
            } else {
                next(err);
            }
        })
    },

    seed: function() {
        /*console.log('run seed');
        var globalConfig     = require('../../public/js/globalConfig');
        console.log('globalConfig.orderStatus.COMPLETED', globalConfig.orderStatus.COMPLETED);
        console.log('globalConfig.orderStatus', globalConfig.orderStatus);
        console.log('_.keys(globalConfig.orderStatus)', _.keys(globalConfig.orderStatus));
        var Order = require('../models/Order.js');
        globalConfig     = require('../../public/js/globalConfig');
        var orderOussama = new Order({
            code             : "CMD001",
            status           : 'COMPLETED',
            _products        : [],
            user            : "567bdded067ae5cb0e04df84",
            isNewCustomer    : true,
            _addresses       : {
                billing      : {
                    name     : "Oussama ETTIZOUI",
                    address  : "49 rue jabal tazka Agdal",
                    zipCode  : "10000",
                    city     : "Rabat",
                    country  : "Maroc"
                },
                shipping     : {
                    name     : "Oussama ETTIZOUI",
                    address  : "49 rue jabal tazka Agdal",
                    zipCode  : "10000",
                    city     : "Rabat",
                    country  : "Maroc",
                    notes    : "Donner le packet à Asmae KHAIH si je suis absent."
                }
            },
            _payment         : {}
        });
        orderOussama.save(function (err) {
            if (err) {
                console.log('erreur inserting order ', err);
            } else {
                console.log('Order inserted');
            }
        });
        var orderMounir = new Order({
            code             : "CMD002",
            status           : 'PENDING',
            _products        : [],

            user            : "567bdded067ae5cb0e04df84",
            isNewCustomer    : true,
            _addresses       : {
                billing      : {
                    name     : "Mounir IGORMAN",
                    address  : "49 rue jabal tazka Agdal",
                    zipCode  : "10000",
                    city     : "Rabat",
                    country  : "Maroc"
                },
                shipping     : {
                    name     : "Mounir IGORMAN",
                    address  : "50 rue France Agdal",
                    zipCode  : "10000",
                    city     : "Marrakech",
                    country  : "Maroc",
                    notes    : "Ne donner le packet à personne  si je suis absent."
                }
            },
            _payment         : {}
        });
        orderMounir.save(function (err) {
            if (err) {
                console.log('erreur inserting order ', err);
            } else {
                console.log('Order inserted');
            }
        });*/
    }
};