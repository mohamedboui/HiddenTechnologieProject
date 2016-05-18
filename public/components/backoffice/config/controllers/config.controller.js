angular
    .module('MainApp')
    .controller('ConfigCtrl', function($scope, SettingService, $modal) {
        SettingService.findAll().success(function(config){
            $scope.parameters = config.config;
        })

        $scope.addParameter = function() {
            var modalInstance = $modal.open({
                templateUrl: 'components/backoffice/config/views/config-add.html',
                controller: function ($scope, $modalInstance) {
                    $scope.config = {isString : true};
                    $scope.errors = {duplicate : false};

                    $scope.save = function () {
                        if(getParentScope().parameters.hasOwnProperty($scope.config.key)){
                            $scope.errors.duplicate = true;
                            return;
                        }
                        var config = {};
                        config[$scope.config.key] = $scope.config.isString ? $scope.config.value : JSON.parse($scope.config.value);
                        config[$scope.config.key] = ['true','false'].indexOf(config[$scope.config.key]) !== -1 ? (config[$scope.config.key] === 'true') : config[$scope.config.key];
                        SettingService.set(_.extend(getParentScope().parameters,config)).success(function(){
                            $modalInstance.dismiss('cancel');
                        })
                    };

                    $scope.disable = function(config){
                        return !config || !config.key || !config.value || !config.value.trim()
                            || (!config.isString && !isValidJson(config.value));
                    }

                    $scope.beautify = function(json){
                        $scope.config.value = angular.toJson(JSON.parse(json),true);
                    }

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };

        $scope.editParameter = function(config) {
            var modalInstance = $modal.open({
                templateUrl: 'components/backoffice/config/views/config-edit.html',
                controller: function ($scope, $modalInstance) {
                    $scope.config = _.extend({
                        key : config.key,
                        value : _.isObject(config.value) ? angular.toJson(config.value,true) : config.value
                    },{
                        isString : _.isString(config.value) || _.isBoolean(config.value)
                    });

                    $scope.save = function () {
                        var config = {};
                        config[$scope.config.key] = $scope.config.isString ? $scope.config.value : JSON.parse($scope.config.value);
                        config[$scope.config.key] = ['true','false'].indexOf(config[$scope.config.key]) !== -1 ? (config[$scope.config.key] === 'true') : config[$scope.config.key];

                        SettingService.set(_.extend(getParentScope().parameters,config)).success(function(){
                            $modalInstance.dismiss('cancel');
                        })
                    };

                    $scope.disable = function(config){
                        return !config || !config.key || (_.isString(config.value) && (!config.value || !config.value.trim()))
                            || (!config.isString && !isValidJson(config.value));
                    }

                    $scope.beautify = function(json){
                        $scope.config.value = angular.toJson(JSON.parse(json),true);
                    }

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };

        $scope.removeParameter = function(key) {
            var modalInstance = $modal.open({
                templateUrl: 'components/backoffice/config/views/config-delete.html',
                controller: function ($scope, $modalInstance) {
                    $scope.save = function () {
                        delete getParentScope().parameters[key];
                        SettingService.set(getParentScope().parameters).success(function(){
                            $modalInstance.dismiss('cancel');
                        })
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };

        $scope.app = {isMonitored : false};

        $scope.monitor = {
            set : function(){
                SettingService.monitor.start($scope.app).success(function(data){
                    $scope.app.isMonitored = true;
                })
            },
            stop : function(){
                SettingService.monitor.stop().success(function(data){
                    $scope.app.isMonitored = false;
                })
            }
        }

        SettingService.monitor.state().success(function(data){
            $scope.app.isMonitored = data.state;
        })

        $scope.serverResponse = {processing : false};
        $scope.shell  = function(operation){
            $scope.serverResponse.processing = true;
            SettingService.shell(operation).success(function(response, code){
                $scope.serverResponse = {code : code, data : response.data, processing:false};
            }).error(function(response, code){
                $scope.serverResponse = {code : code, data : response.error.data, processing:false};
            })
        }


        function getParentScope(){
            return $scope;
        }
    })