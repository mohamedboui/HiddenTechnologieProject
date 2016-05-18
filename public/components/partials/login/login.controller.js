angular
    .module('MainApp')
    .controller('LoginCtrl', function ($scope, $rootScope, $state, Auth, SessionStorageService, UserSvc) {
        $scope.user = {isAuthenticated: SessionStorageService.get('token')};
          var config = {
        'client_id': '620109546447-k4ss20maen0a57fhifamjrl0peukvio0.apps.googleusercontent.com',
         'scope': ['https://www.googleapis.com/auth/plus.me','email','profile']
                }; 
                $scope.gAuth={ contacts :[]};
  
  $scope.authGoogle=function () {
     gapi.auth.authorize(config, function() {
       var token=gapi.auth.getToken();
         $.ajax({
     url:  "https://www.googleapis.com/plus/v1/people/me?access_token="+token.access_token + "&alt=json",
     dataType: "jsonp",
     success:function(data) {
        console.log(' authentification data',data);
        $scope.gAuth.lastName=data.name.familyName;
        $scope.gAuth.firstName=data.name.givenName;
        $scope.gAuth.role="USER";
        $scope.gAuth.email=data.emails[0].value;
        $scope.gAuth.access_token=token.access_token;    // Send login to server or save into cookie
        $scope.signin($scope.gAuth);
                              // display all your data in console
     }
 });
       
      
     });
    // Auth failure or signout detected
  };
        $scope.login = function () {
            if(!$scope.user.username && !$scope.user.password) {
                $scope.show = true;
                $scope.alert = {type: 'error', msg: 'Veuillez renseigner votre email et votre mot de passe.'};
            }else if(!$scope.user.username){
                $scope.show = true;
                $scope.alert = {type: 'error', msg: 'Veuillez renseigner votre email.'};
            }else if(!$scope.user.password){
                $scope.show = true;
                $scope.alert = {type: 'error', msg: 'Veuillez renseigner votre mot de passe.'};
            }
            else{
                Auth.login($scope.user,
                    function (data) {
                        $rootScope.error = "";
                        SessionStorageService.put('token', data.token);
                        $rootScope.$broadcast("loginlogout", data.user);
                        $scope.show = false;
                        $scope.alert = {};
                        getUserInfos(function () {
                            if ($scope.user.role == "USER")
                                $state.go('befyne.admin.home');
                            if ($scope.user.role == "SUPER_ADMIN" || $scope.user.role == "ADMIN")
                                $state.go('befyne.admin.users');
                        });
                    },
                    function (err) {
                        $scope.show = true;
                        if (err === 'Username not found') {
                            $scope.alert = {type: 'error', msg: 'Ce compte est inexistant.'};
                        }
                        else if (err === 'Password Empty') {
                            $scope.alert = {type: 'error', msg: 'Veuillez renseigner votre email et votre mot de passe.'};
                        }
                        else if (err === 'User is inactive') {
                            $scope.alert = {type: 'error', msg: 'Cet utilisateur est inactive'};
                        }
                        else if (err === 'Wrong username or password') {
                            $scope.alert = {type: 'error', msg: 'Le mot de passe saisi est incorrecte'};
                        }
                        $rootScope.error = gettextCatalog.getString('Invalid credentials');
                    });
            }

        };
        $scope.show = false;
        $scope.signin = function (user) {
            console.log('is',user)
       Auth.googlePlus(user, function (data) {
                        $rootScope.error = "";
                        SessionStorageService.put('token', data.token);
                        $rootScope.$broadcast("loginlogout", data.user);
                        $scope.show = false;
                        $scope.alert = {};
                        getUserInfos(function () {
                            if ($scope.user.role == "USER")
                                $state.go('befyne.admin.home');
                            if ($scope.user.role == "SUPER_ADMIN" || $scope.user.role == "ADMIN")
                                $state.go('befyne.admin.users');
                        });
                    })
        };
        $scope.closealert = function (index) {
            $scope.show = false;
            $scope.alert = {};
        };
        $scope.required = {username: false};
        $scope.reset = {};
        $scope.resetPassword = function () {
            if (!$scope.user.username || !$scope.user.username.trim()) {
                $scope.show = true;
                $scope.alert = {type: 'error', msg: 'Veuillez tapez votre email'};
            }
            else {
                UserSvc.resetPassword({email: $scope.user.username}).success(function () {
                    $scope.show = true;
                    $scope.alert = {type: 'success', msg: 'Votre nouveau mot de passe est envoyé par email'};
                }).error(function () {
                    $scope.show = true;
                    $scope.alert = {type: 'error', msg: 'Veuillez saisir votre email'};
                })

            }
        }
        $rootScope.$on("loginlogout", function () {
            $scope.user = {};
          
        });
        function getUserInfos(cb) {
            console.log("ici")
            if (SessionStorageService.get('token')) {
                Auth.isAlive().success(function (user) {
                    $scope.user = user;
                    console.log("user",user);
                    cb();
                });
            }
            else {
                $scope.user = {};
                cb();
                $state.go('befyne.public.login');
            }
        }
    }
);