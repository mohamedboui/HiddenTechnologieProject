(function(exports){

    var config = {
        roles :[
            {code :"SUPER_ADMIN",name : "Super Administrateur"},
            {code :"ADMIN" ,  name: "Administrateur"},
            {code :"USER" ,  name: "Utilisateur"}
        ],

        
        icons: {
            'PENDING': "fa fa-refresh",
            'CANCELED': "fa fa-times",
            'COMPLETED' : "fa fa-check-square"
        }

        


    }

    exports.roles = config.roles;
  
    exports.icons = config.icons;
 

})(typeof exports === 'undefined' ? this['CONSTANTS'] = {} : exports);
