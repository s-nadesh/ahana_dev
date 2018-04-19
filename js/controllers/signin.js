'use strict';

/* Controllers */
// signin controller
app.controller('SigninFormController', SignInForm);

SignInForm.$inject = ['$scope', '$state', 'AuthenticationService', '$http', '$rootScope', '$location', '$timeout', '$localStorage','Idle'];
function SignInForm($scope, $state, AuthenticationService, $http, $rootScope, $location, $timeout, $localStorage, Idle) {
     Idle.unwatch();
    $scope.user = {};
    $scope.authError = null;
    $scope.forgotpasswordButtonClass = 'primary';

    $scope.showForm = false;
    $scope.showFormError = false;
    $scope.FormErrorMessage = '';

    $rootScope.commonService.GetTenantList(function (response) {
        if (response.success == true) {
            $scope.tenants = response.tenantList;

            if (response.org_sts == '1' && Object.keys($scope.tenants).length > 0) {
                $scope.showForm = true;

                if (!$localStorage.system_tenant)
                    $localStorage.system_tenant = $scope.tenants[Object.keys($scope.tenants)[0]];
                
                if (!$localStorage.system_tenant_id)
                    $localStorage.system_tenant_id = Object.keys($scope.tenants)[0];

                if ($localStorage.system_username)
                    $scope.user.username = $localStorage.system_username;

                $scope.user.tenant_id = $localStorage.system_tenant_id;

                if ($localStorage.system_stay_logged_in) {
                    $scope.user.stay_logged_in = $localStorage.system_stay_logged_in;
                }
            } else {
                $scope.showFormError = true;

                if (response.org_sts == '0') {
                    $scope.FormErrorMessage = 'This Organization is in-active. Contact Administrator.';
                } else if (Object.keys($scope.tenants).length == '0') {
                    $scope.FormErrorMessage = 'This Organization has no Branch. Contact Administrator.';
                }
            }
        } else {
            $scope.showFormError = true;
            $scope.FormErrorMessage = response.message;
        }
    });
    $scope.login = function () {
        $scope.authError = null;
        $('#login_btn').button('loading');
        // Try to login
        AuthenticationService.Login($scope.user.username, $scope.user.password, $scope.user.tenant_id, function (response) {
            if (response.success) {
                Idle.watch();
                AuthenticationService.setCurrentUser(response, $scope.user.stay_logged_in);
//                $localStorage.system_tenant = $scope.user.tenant_id; //Hide by Nad. Bc-187 Cache Login
                $localStorage.system_tenant = $scope.tenants[$scope.user.tenant_id];
                $localStorage.system_tenant_id = $scope.user.tenant_id;
                $localStorage.system_stay_logged_in = $scope.user.stay_logged_in;
                
                var previous_login_username = $localStorage.system_username;
                var current_login_username = $scope.user.username;
                
                if (previous_login_username == current_login_username) {
                    $localStorage.system_username = $scope.user.username;
                    if (typeof $localStorage.system_state_params != 'undefined' && Object.keys($localStorage.system_state_params).length > 0) {
                        $state.go($localStorage.system_state_name, $localStorage.system_state_params);
                    } else if (typeof $localStorage.system_state_name != 'undefined') {
                        $state.go($localStorage.system_state_name);
                    }
                } else {
                    $localStorage.system_username = $scope.user.username;
                    $state.go('myworks.dashboard');
                }
            } else {
                $('#login_btn').button('reset');
                $scope.authError = response.message;
            }
        });
    };


    $scope.passwordrequest = function () {
        $scope.errorData = $scope.successMessage = '';
        $('#forgot_btn').button('loading');

        $http({
            method: "POST",
            url: $rootScope.IRISOrgServiceUrl + '/user/request-password-reset',
            data: {email: $scope.email, tenant_id: $scope.tenant_id},
        }).then(
                function (response) {
                    if (response.data.success === true) {
                        $scope.successMessage = response.data.message;
                        $scope.errorData = '';
                        $scope.email = '';
//                        $('#forgot_btn').button('reset');
                        $('#forgot_btn').attr('disabled', true).text('Request Sent');
                        $scope.forgotpasswordButtonClass = 'success';
                    } else {
                        $scope.forgotpasswordButtonText = 'Send';
                        $('#forgot_btn').button('reset');
                        $scope.errorData = response.data.message;
                    }
                }
        )
    };

    $scope.resetpassword = function () {
        $http({
            method: "POST",
            url: $rootScope.IRISOrgServiceUrl + '/user/reset-password',
            data: {password: $scope.password, password_reset_token: $location.search().token, repeat_password: $scope.repeat_password},
        }).then(
                function (response) {
                    if (response.data.success === true) {
                        $scope.password = $scope.repeat_password = '';
                        $scope.successMessage = response.data.message;
                        $scope.errorData = '';
                        $timeout(function () {
                            $state.go('access.signin');
                        }, 10000)
                    } else {
                        $scope.errorData = response.data.message;
                    }
                }
        )
    };

}