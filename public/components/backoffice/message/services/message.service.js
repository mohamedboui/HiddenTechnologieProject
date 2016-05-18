angular.module('MainApp')
    .factory('MessageSvc', function($http){
        return  {
            find : function(id){
                return $http.get('/api/messages/user/'+id);
            },
             findById : function(id){
                return $http.get('/api/messagesByid/'+id);
            },
            create : function(message){
                return $http.post('/api/messages',message);
            },
            edit : function(message){
                return $http.put('/api/messages/'+message._id,message);
            },
            delete : function(id){
                return $http.delete('/api/messages/'+id);
            },
            findAll:function(page,limit,id){
                console.log('id',id)
                return $http.post('/api/messages/'+page+'/'+limit,id);
            },
           
            
           
            
        }
    });