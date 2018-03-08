(function () {
    'use strict';

    angular
            .module('app')
            .factory('AuthenticationService', AuthenticationService);

    AuthenticationService.$inject = ['$http', '$cookieStore', '$rootScope', '$window', '$localStorage'];
    function AuthenticationService($http, $cookieStore, $rootScope, $window, $localStorage) {
        var service = {};
        var currentUser = null;
        var current = null;

        service.Login = Login;
//        service.SetCredentials = SetCredentials;
        service.ClearCredentials = ClearCredentials;
        service.setCurrentUser = setCurrentUser;
        service.getCurrentUser = getCurrentUser;
        service.getCurrent = getCurrent;

        return service;

        function Login(username, password, tenant_id, callback) {
            var response;
            $http.post($rootScope.IRISOrgServiceUrl + '/user/login', {username: username, password: password, tenant_id: tenant_id})
                    .success(function (response) {
                        callback(response);
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                        callback(response);
                    });
        }

//        function SetCredentials(secToken, resources, credentials) {
//            $rootScope.globals = {
//                currentUser: {
//                    authdata: secToken
//                }
//            };
//
//            $localStorage.$default({user_resources: resources, user_credentials: credentials});
//
//            $cookieStore.put('globals', $rootScope.globals);
//            $http.defaults.headers.common['Authorization'] = 'Bearer ' + secToken; // jshint ignore:line
//        }

        function ClearCredentials(state_name, state_params) {
            $localStorage.$reset({
                system_tenant: $localStorage.system_tenant,
                system_username: $localStorage.system_username,
                system_stay_logged_in: $localStorage.system_stay_logged_in,
                system_state_name: state_name,
                system_state_params: state_params
            });
            return true;

//            $rootScope.globals = {};
//            $cookieStore.remove('globals');
//            $http.defaults.headers.common.Authorization = 'Basic';
        }

        function setCurrentUser(user, stay_logged_in) {
            currentUser = user;
            if (stay_logged_in) {
                var stay_date = moment().add('days', 365);
            } else {
                if (currentUser.credentials.user_timeout) {
                    var stay_date = moment().add(currentUser.credentials.user_timeout, 'minutes');
                } else {
                    var stay_date = moment().add('days', 1);
                }
            }
            $localStorage.$default({'user': user, 'stay': stay_date.format("YYYY-MM-DD hh:mm:ss")});
            return currentUser;
        }
        ;

        function getCurrentUser() {
            if (!currentUser) {
                currentUser = $localStorage.user;
            }
            //Thangaraj - switch branch for multiple tab open in broswer.
            if (currentUser) {
                currentUser = $localStorage.user;
            }
            return currentUser;
        }
        ;

        function getCurrent() {
            if (!current) {
                current = $localStorage.stay;
            }
            return current;
        }
        ;
    }

})();