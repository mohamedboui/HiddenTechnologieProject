angular
    .module('MainApp')
    .controller('UserCtrl', function($scope, MessageSvc, UserSvc, UtilsSvc, $modal, $rootScope, Auth, SessionStorageService) {
        $scope.pagination = {
            itemsPerPage: 5,
            currentPage: 1,
            maxSize: 7
        };
        $scope.search = {};
        $scope.message = {};

        $scope.waitmsg = "importer les contacts";
        $scope.paginationValues = [5, 10, 15, 20, 25, 50];
        $scope.$watch('search', function(search) {
            populateUsers($scope.pagination.currentPage, search);
        }, true);
        $scope.$watch('pagination.currentPage', function(page) {
            populateUsers(page, $scope.search);
        });

        $scope.$watch('pagination.itemsPerPage', function(num) {
            populateUsers($scope.pagination.currentPage, $scope.search);
        });
        Auth.isAlive().success(function(user) {
            $scope.user = user;
        });

        function populateUsers(page, search) {

            UserSvc.paginate(page, $scope.pagination.itemsPerPage, search).success(function(response) {
                $scope.users = response.data;
                $scope.pagination.totalItems = response.count;
            })
        }
        $scope.addUser = function() {
            var modalInstance = $modal.open({
                templateUrl: 'components/backoffice/user/views/user-add.html',
                size: 'lg',
                controller: function($scope, $modalInstance) {
                    $scope.required = {};
                    $scope.user = {};
                    $scope.duplicate = {};
                    $scope.user = {};
                    $scope.roles = _.rest(CONSTANTS.roles);

                    $scope.save = function() {
                        $scope.required.firstName = !$scope.user.firstName || !$scope.user.firstName.trim();
                        $scope.required.lastName = !$scope.user.lastName || !$scope.user.lastName.trim();
                        $scope.required.password = !$scope.user.password || !$scope.user.password.trim();
                        $scope.required.phone = !$scope.user.phone || !$scope.user.phone.trim();
                        $scope.required.role = !$scope.user.role;
                        $scope.required.email = !$scope.user.email || !$scope.user.email.trim() || !isValidEmail($scope.user.email);
                        if (_.find($scope.required, function(v) {
                                return v;
                            })) {
                            return;
                        }

                        $scope.user.role = $scope.user.role.code;
                        UserSvc.create($scope.user).success(function() {
                            populateUsers(getParentScope().pagination.currentPage, {
                                pattern: getParentScope().search
                            });
                            $modalInstance.dismiss('cancel');
                        }).error(function(response) {
                            $scope.duplicate.email = response.error.errmsg.indexOf('email') !== -1;
                        })
                    };
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };

        function sendNotification() {


            $rootScope.socket.send({
                "send": "notification"
            });
        }
        $scope.contacter = function() {
            var modalInstance = $modal.open({
                templateUrl: 'components/backoffice/user/views/user-contact.html',
                size: 'lg',
                controller: function($scope, $modalInstance) {

                    $scope.required = {};
                    $scope.contacts = getParentScope().user.contacts;
                    $scope.save = function(message) {
                        $scope.required.text = !$scope.message.text || !$scope.message.text.trim();
                        $scope.required.subject = !$scope.message.subject || !$scope.message.subject.trim();
                        if (_.find($scope.required, function(v) {
                                return v;
                            })) {
                            return;
                        }
                        $scope.message.subject = message.subject;
                        $scope.message.toemail = message.toemail;
                        $scope.message.writer = getParentScope().user._id;
                        $scope.message.text = message.text;

                        MessageSvc.create(message).success(function() {
                            $modalInstance.dismiss('cancel');
                            sendNotification();
                        })

                    };
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };

        $scope.editUser = function(id) {
            var modalInstance = $modal.open({
                templateUrl: 'components/backoffice/user/views/user-edit.html',
                size: 'lg',
                controller: function($scope, $modalInstance, $timeout) {
                    $scope.roles = _.rest(CONSTANTS.roles);
                    UserSvc.findOne(id).success(function(user) {
                        delete user.password;
                        $scope.user = user;
                        var role = _.find($scope.roles, function(role) {
                            return role.code == $scope.user.role;
                        })
                        $scope.user.role = role;
                    })
                    $scope.required = {};
                    $scope.duplicate = {};
                    $scope.save = function() {

                        $scope.required.firstName = !$scope.user.firstName || !$scope.user.firstName.trim();
                        $scope.required.lastName = !$scope.user.lastName || !$scope.user.lastName.trim();
                        $scope.required.phone = !$scope.user.phone || !$scope.user.phone.trim();
                        $scope.required.role = !$scope.user.role;
                        $scope.required.email = !$scope.user.email || !$scope.user.email.trim() || !isValidEmail($scope.user.email);
                        if (_.find($scope.required, function(v) {
                                return v;
                            })) {
                            return;
                        }
                        $scope.user.role = $scope.user.role.code;
                        UserSvc.edit($scope.user).success(function() {
                            populateUsers(getParentScope().pagination.currentPage, {
                                pattern: getParentScope().search
                            });
                            $modalInstance.dismiss('cancel');
                        }).error(function(response) {
                            $scope.duplicate.email = response.error.errmsg.indexOf('email') !== -1;
                        })
                    };

                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };
        $scope.deleteUser = function(id) {
            var modalInstance = $modal.open({
                templateUrl: 'components/backoffice/user/views/user-delete.html',
                controller: function($scope, $modalInstance) {
                    UserSvc.findOne(id).success(function(user) {
                        $scope.user = user;
                    })
                    $scope.save = function() {
                        UserSvc.delete(id).success(function() {
                            populateUsers(getParentScope().pagination.currentPage, {
                                pattern: getParentScope().search
                            });
                            $modalInstance.dismiss('cancel');
                        })
                    };
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };
        $scope.showUser = function(id) {
            var modalInstance = $modal.open({
                templateUrl: 'components/backoffice/user/views/user-show.html',
                controller: function($scope, $modalInstance) {


                    UserSvc.findOne(id).success(function(user) {
                        $scope.user = user;
                    });

                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };
        $scope.import = function() {
            var emails = $scope.user.contacts;

            $scope.waitmsg = "import en cours ...";




            $.ajax({
                url: "https://www.google.com/m8/feeds/contacts/default/full?access_token=" + SessionStorageService.get("token") + "&alt=json",
                dataType: "jsonp",
                success: function(data) {
                    // display all your data in console
                    var tabs = _.pluck(data.feed.entry, 'gd$email');
                    _.each(tabs, function(email) {
                        if (!_.contains($scope.user.contacts, email[0].address))
                            emails.push(email[0].address);
                    })


                    console.log('longuer', $scope.user.contacts.length);
                    UserSvc.edit($scope.user).success(function(user) {
                        $scope.waitmsg = "importer les contacts";
                        var modalInstance = $modal.open({
                            templateUrl: 'components/backoffice/user/views/success-import.html',
                            controller: function($scope, $modalInstance) {

                                $scope.cancel = function() {
                                    $modalInstance.dismiss('cancel');
                                };
                            }
                        });
                    })
                }
            });

        }

        function getParentScope() {
            return $scope;
        }


    })