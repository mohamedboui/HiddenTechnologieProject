angular
    .module('MainApp')
    .factory('UserModel', function(){
        return {
            bootstrap : function(user){
                user.hasRight = function(right){
                    return user.role && user.role.rights.indexOf(right) !== -1;
                }

                user.belongsTo = function(entities, includeSuperAdmin){
                    return (includeSuperAdmin && (user.isSuperAdmin || user.superAdmin)) || (user.entity && entities.indexOf(user.entity.type) !== -1)
                }
                return user;
            }
        }
    });