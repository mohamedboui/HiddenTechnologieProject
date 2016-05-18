angular
    .module('MainApp')
    .controller('NavCtrl', function($scope, $rootScope, $state, MessageSvc, $window, UtilsSvc, $stateParams, $modal, Auth, SessionStorageService) {
        $rootScope.socket;
        Auth.isAlive().success(function(user) {
            $scope.user = user;
        })
        var mainMenus = [{
            icon: 'fa fa-dashboard',
            title: 'Accueil administration',
            state: 'befyne.admin.home',
            data: {
                access: ['SUPER_ADMIN', 'ADMIN']
            }
        }, {
            icon: 'fa fa-leaf',
            title: 'Visiter la boutique',
            state: 'befyne.front.home',
            data: {
                access: ['SUPER_ADMIN', 'ADMIN']
            }
        }];

        getUserInfos(buildMenus);

        function buildMenus() {
            if (SessionStorageService.get('token')) {
                if ($scope.user.isAdmin) {
                    $scope.mainMenus = mainMenus;
                } else {
                    $scope.mainMenus = _.filter(mainMenus, function(menu) {
                        return menu.data.access.indexOf($scope.user.role) !== -1;
                    });
                }
            } else {
                $scope.mainMenus = [];
            }


        };

        function getUserInfos(cb) {
            if (SessionStorageService.get('token')) {
                Auth.isAlive().success(function(user) {
                    $scope.user = user;
                    cb();
                });
            } else {
                $scope.user = {};
                cb();
            }
        }

        $rootScope.$on("loginlogout", function() {
            getUserInfos(buildMenus);
        });

        function loadnotifications() {
            console.log($scope.user);
            MessageSvc.find($scope.user.email).success(function(messages) {
                $rootScope.messages = messages;
                $scope.$broadcast('myCustomEvent', {
                    someProp: messages
                });
            })
        }

        $scope.iniNotifcation = function() {

            $rootScope.socket = new io(null, {
                port: 3000
            });
            $rootScope.socket.connect();
            $rootScope.socket.on('message', function(msg) {
                console.log('zbel');

                loadnotifications();
                //fffrefreshNotification();
            });
        }
        $scope.iniNotifcation();

        $scope.logout = function() {
            if (SessionStorageService.get('token')) {
                Auth.logout(function() {
                    SessionStorageService.delete('token');
                    $rootScope.$broadcast("loginlogout", {});
                    $state.go('befyne.public.login');
                }, function() {});
            }
        };




    });