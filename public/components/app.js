angular
    .module('MainApp',
        [
            'ui.router', 'ngResource', 'ngCookies','ui.bootstrap','ngSanitize',
            'ui.select','ui.bootstrap.alert',
            'autocomplete' 
           
        ]
    )
    .config(function($stateProvider, $urlRouterProvider  , $locationProvider, $httpProvider){
       $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('TokenInterceptor');
        $urlRouterProvider.otherwise('/login');
        $stateProvider

            // ------------------------------------------------------------------------
            // MAIN APP
            // ------------------------------------------------------------------------
            .state('befyne', {
                abstract: true,
                template: '<ui-view/>'
            })

            // ------------------------------------------------------------------------
            // PUBLIC ROUTES
            // ------------------------------------------------------------------------
            .state('befyne.public', {
                abstract: true,
                template: '<ui-view/>'
            })
            .state('befyne.public.login', {
                url: '/login',
                templateUrl: 'components/partials/login/login.html',
                controller: 'LoginCtrl'
            })
          
        
            // ------------------------------------------------------------------------
            // CUSTOMER ( FRONTEND ) ROUTES
            // ------------------------------------------------------------------------
            

            // ------------------------------------------------------------------------
            // ADMIN ( BACKEND ) ROUTES
            // ------------------------------------------------------------------------
            .state('befyne.admin', {
                abstract: true,
                url: '/admin',
                templateUrl: 'components/backoffice/admin/views/admin-tpl.html',
                controller: 'AdminCtrl'
            })
         
            .state('befyne.admin.config', {
                url: '/config',
                templateUrl: 'components/backoffice/config/views/config.html',
                controller: 'ConfigCtrl',
                data: {
                    access: ['SUPER_ADMIN']
                }
            })
            .state('befyne.admin.users', {
                url: '',
                templateUrl: 'components/backoffice/user/views/users.html',
                controller: 'UserCtrl',
             data: {
                    access: ['SUPER_ADMIN','ADMIN']
                }
            })
             .state('befyne.admin.home', {
                url: '/home',
                templateUrl: 'components/backoffice/user/views/home.html',
                controller: 'HomeCtrl',
                data: {
                    access: ['USER']
                }
              
            })
               .state('befyne.admin.showMessage', {
                url: '/showMessage',
                templateUrl: 'components/backoffice/message/views/show-message.html',
                controller: 'MessageCtrl',
                data: {
                    access: ['SUPER_ADMIN','USER','ADMIN']
                }
            })
               .state('befyne.admin.viewMsg', {
                url: '/messageView/:id',
                templateUrl: 'components/backoffice/message/views/message-view.html',
                controller: 'showMessageCtrl',
                data: {
                    access: ['SUPER_ADMIN','USER','ADMIN']
                }
            })
         
    })
    .run(function($rootScope, $location, $state, $stateParams, SessionStorageService, Auth) {

      
        $rootScope._              = _;
        $rootScope.globalConfig   = CONSTANTS;
        $rootScope.$state         = $state;

        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

            if(!SessionStorageService.get('token') && !toState.name.match(/^befyne\.public\./)){ // toState.name !=="befyne.public.login"
                event.preventDefault();
                return $state.go('befyne.public.login');
            }

            if(toState.name === "befyne.admin.home"){
                if(!SessionStorageService.get('token')){
                    event.preventDefault();
                    return $state.go('befyne.public.login');
                }
            }

            if(toState.name === "befyne.public.login"){
                if(SessionStorageService.get('token')){
                    Auth.isAlive().success(function(user){
                        if(user.role === "ADMIN" || user.role === "SUPER_ADMIN"){
                            event.preventDefault();
                            return $state.go('befyne.admin.users');
                        }else{
                            event.preventDefault();
                            return $state.go('befyne.admin.home');
                        }
                    })
                }
            }

            if(toState.name && toState.name.match(/^befyne\.admin\./) ){
                if(SessionStorageService.get('token')){
                    Auth.isAlive().success(function(user){
                        if(toState.data.access.indexOf(user.role) === -1 && (user.role !== "ADMIN" || user.role !== "SUPER_ADMIN") ){
                            event.preventDefault();
                            return $state.go('befyne.admin.home');
                        }
                    })
                }
            }

            // set selected menu
           

          
            

        });
    });

