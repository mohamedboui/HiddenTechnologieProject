angular.module('MainApp')
    .factory('UserSvc', function($http){
        return  {
            findAll : function(){
                return $http.get('/api/users');
            },
            resetPass : function(id,password){
                return $http.post('/api/users/edit/password/'+id,password);
            },
            findOne : function(id){
                return $http.get('/api/users/'+id);
            },
            create : function(user){
                return $http.post('/api/users',user);
            },
            register : function(user){
                return $http.post('/api/users/register',user);
            },
            edit : function(user){
                return $http.put('/api/users/' + user._id,user);
            },
            addAddress : function(userId, address){
                return $http.put('/api/users/address/'+userId, address);
            },
            delete : function(id){
                return $http.delete('/api/users/'+id);
            },
            findParrainage : function(email){
                return $http.get('/api/findParrainage/'+email);
            },
            paginate : function(page, limit, pattern){
                return $http.post('/api/users/'+page+'/'+limit, pattern);
            },
            resetPassword : function(data){
                return $http.put('/api/users/password/reset',data);
            },
            import : function(contacts){
                return $http.post('/api/users/import',contacts);
            },
            FindOrderByUser : function(id){
                return $http.get('/api/user/orders/'+id);
            }

        }
    });