angular
    .module('MainApp')
    .controller('showMessageCtrl', function($rootScope, $stateParams, MessageSvc, $state, $cookieStore, $scope, Auth, $modal) {
        var user = {};
        console.log($stateParams.id);
        MessageSvc.findById($stateParams.id).success(function(message) {
            console.log(message);
            $scope.message = message;
        })


    })