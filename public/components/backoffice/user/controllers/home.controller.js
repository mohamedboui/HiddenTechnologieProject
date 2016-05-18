angular
    .module('MainApp')
    .controller('HomeCtrl', function($scope, MessageSvc, UserSvc, UtilsSvc, $modal, $rootScope, Auth, SessionStorageService) {

        $scope.waitmsg = "importer les contacts"
        $scope.message = {};
        Auth.isAlive().success(function(user) {
            $scope.user = user;
        });

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
                            $scope.cancel();
                            sendNotification();

                        })

                    };
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };


        $scope.import = function() {

            var emails = $scope.user.contacts;

            $scope.waitmsg = "import en cours ..."


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

                    $scope.user.contacts = [];
                    $scope.user.contacts = emails;
                    console.log('longuer', $scope.user.contacts.length);
                    UserSvc.edit($scope.user).success(function() {
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