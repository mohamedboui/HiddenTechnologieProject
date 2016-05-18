angular
    .module('MainApp')
    .controller('AdminCtrl', function($rootScope, MessageSvc, $state, $cookieStore, $scope, Auth) {
        var user = {};
        $scope.$on('myCustomEvent', function(event, data) {
            console.log('wseeel', data.someProp)
            $scope.messages = data.someProp; // 'Data to send'
        });
        $scope.displayAll = function() {

            $state.go('befyne.admin.showMessage');
        }
      $scope.display = function(message) {
            console.log('edit')
            if(!message.isReaded){
                  message.isReaded = true;
                  MessageSvc.edit(message).success(function(data) {
                $state.go('befyne.admin.viewMsg', {
                    id: message._id
                });
                $scope.$broadcast("event",{});

            });
            }
            else{
                $state.go('befyne.admin.viewMsg', {
                    id: message._id
                }); 
            }
          
        }
        $scope.$on('event',function(event,data){
        $scope.messages={};
         MessageSvc.find(user.email).success(function(messages) {
            console.log('messages',messages);
                   $scope.messages = messages;

            })   
        })
        function buildMenus() {
            var menus = [{
                    icon: 'fa fa-user fa-fw',
                    title: 'Utilisateurs',
                    state: 'befyne.admin.users',
                    access: ['SUPER_ADMIN', 'ADMIN']
                }, {
                    icon: 'fa fa-wrench fa-fw',
                    title: 'Configuration',
                    state: 'befyne.admin.config',
                    access: ['SUPER_ADMIN']
                }

            ];

            $scope.menus = _.filter(menus, function(menu) {
                return menu.access.indexOf(user.role) !== -1;
            })
        };

        Auth.isAlive().success(function(u) {
            user = u;
            buildMenus();
            MessageSvc.find(user.email).success(function(messages) {
                $scope.messages = messages;
            })
        });


    });