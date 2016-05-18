angular
    .module('MainApp')
    .filter('enddate', function($filter) {

        var filterDate = $filter('date');

        function datesEqual(end) {
            var endDate = new Date(end);
            console.log('newDate', endDate.getDate(), new Date().getDate())
            var startDate = new Date();
            return endDate.getDate() == new Date().getDate() &&
                endDate.getMonth() == startDate.getMonth() &&
                endDate.getYear() == startDate.getYear();
        }

        return function(endDate, startDate) {
            return datesEqual(endDate, startDate) ? filterDate(endDate, 'HH:mm') : filterDate(endDate, 'dd.MM.yyyy HH:mm');
        };
    })
    .controller('MessageCtrl', function($rootScope, $stateParams, MessageSvc, $state, $cookieStore, $scope, Auth, $modal) {
        var user = {};
        Auth.isAlive().success(function(data) {
            $scope.user = data;
        })
        $scope.pagination = {
            itemsPerPage: 5,
            currentPage: 1,
            maxSize: 7
        };
        $scope.search = {};
        $scope.message = {};
        $scope.$watch('pagination.currentPage', function(page) {
            populateMsgs(page);
        });

        $scope.$watch('pagination.itemsPerPage', function(num) {
            populateMsgs($scope.pagination.currentPage);
        });

        function populateMsgs(page) {
            console.log('dsd', $scope.user.email)
            MessageSvc.findAll(page, $scope.pagination.itemsPerPage, {
                id: $scope.user.email
            }).success(function(response) {
                $scope.allMessages = response.data;
                $scope.pagination.totalItems = response.count;
            })
        }

        $scope.display = function(message) {
            console.log('edit')
            if(!message.isReaded){
                  message.isReaded = true;
                  MessageSvc.edit(message).success(function(data) {
                $scope.$emit("event",{});
                $state.go('befyne.admin.viewMsg', {
                    id: message._id
                });
            });
            }
            else{
                $state.go('befyne.admin.viewMsg', {
                    id: message._id
                }); 
            }
          
        }
        $scope.delete = function(id) {
            var modalInstance = $modal.open({
                templateUrl: 'components/backoffice/message/views/message-delete.html',
                controller: function($scope, $modalInstance) {

                    $scope.save = function() {
                        MessageSvc.delete(id).success(function(data) {
                            populateMsgs(getParentScope().pagination.currentPage);
                            $scope.cancel();

                        });
                    };
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });

        }

        function getParentScope() {
            return $scope;
        }

    })