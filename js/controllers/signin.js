'use strict';

/* Controllers */
// signin controller
app.controller('SigninFormController', SignInForm);

SignInForm.$inject = ['$scope', '$state', 'AuthenticationService'];
function SignInForm($scope, $state, AuthenticationService) {
    $scope.user = {};
    $scope.authError = null;
    $scope.loginButtonText = 'Log in';
    
    $scope.login = function () {
        $scope.authError = null;
        $scope.loginButtonText = 'Logging in...Please Wait ....';
        $('#login_btn').attr('disabled', true);
        // Try to login
        AuthenticationService.Login($scope.user.username, $scope.user.password, function (response) {
            if (response.success) {
                AuthenticationService.SetCredentials(response.access_token);
                $state.go('app.org_list');
            } else {
                $scope.loginButtonText = 'Log in';
                $('#login_btn').attr('disabled', false);
                $scope.authError = response.message;
            }
        });
    };

}