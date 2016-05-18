angular.module('MainApp')
    .factory('SettingService', function(SessionStorageService, $http){
        return  {
            translator : {
                setLang : function()
                {
                    var currentLang = SessionStorageService.get('lang');
                }
            },
            findAll : function(){
                return $http.get('/config');
            },
            set : function(config){
                return $http.put('/config',config)
            },
            shell : function(operation){
                return $http.get('/config/shell/'+operation)
            },
            monitor : {
                start : function(data){
                    return $http.post('/config/app/monitor/start',data)
                },
                stop : function(){
                    return $http.post('/config/app/monitor/stop')
                },
                state : function(){
                    return $http.get('/config/app/monitor/active')
                }
            }

        }
    });