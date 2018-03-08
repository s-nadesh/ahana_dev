Array.prototype.indexOfObjectWithProperty = function (propertyName, propertyValue) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i][propertyName] === propertyValue)
            return i;
    }
    return -1;
};
Array.prototype.containsObjectWithProperty = function (propertyName, propertyValue) {
    return this.indexOfObjectWithProperty(propertyName, propertyValue) != -1;
};
'use strict';
/* Controllers */
app.controller('UserRolesController', ['$scope', '$http', '$filter', '$state', '$rootScope', '$timeout', function ($scope, $http, $filter, $state, $rootScope, $timeout) {

        //Get my organization details
        $http({
            url: $rootScope.IRISOrgServiceUrl + '/organization/getorg',
            method: "GET"
        }).then(
                function (response) {
                    if (response.data.success === true) {
                        $scope.organization = response.data.return;
//                        $scope.data = {tenant_id: $scope.organization.tenant_id};
                    }
                    else {
                        $scope.errorData = response.data.message;
                    }
                }
        );

        //Get Organization Users
        $http({
            url: $rootScope.IRISOrgServiceUrl + '/user/getuserslistbyuser',
            method: "GET"
        }).then(
                function (response) {
                    $scope.users = {};
                    $scope.users = response.data.userList;
                }
        );

        //Get Organization Roles
        $http({
            url: $rootScope.IRISOrgServiceUrl + '/role/getactiverolesbyuser',
            method: "GET"
        }).then(
                function (response) {
                    $scope.roles = {};
                    $scope.roles = response.data.roles;
                }
        );

        //Save Data
        $scope.saveForm = function () {

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            $scope.roleList = [];

            angular.forEach($scope.selectedRoles, function (parent) {
                $scope.roleList.push(parent.role_id);
            });
            if (typeof this.data != "undefined") {
                this.data.role_ids = [];
                this.data.role_ids = $scope.roleList;
            }

            var _that = this;
            $scope.loadbar('show');
            $http({
                method: "POST",
                url: $rootScope.IRISOrgServiceUrl + '/user/assignroles',
                data: _that.data,
            }).then(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.data.success === true) {
                            $scope.msg.successMessage = "Roles assigned successfully";
                        }
                        else {
                            $scope.errorData = response.data.message;
                        }
                    }
            )
        };

        $scope.selectedRoles = [];

        $scope.toggleSelection = function toggleSelection(role) {
            var index = $scope.selectedRoles.indexOfObjectWithProperty('role_id', role.role_id);
            if (index > -1) {
                // Is currently selected, so remove it
                $scope.selectedRoles.splice(index, 1);
            }
            else {
                // Is currently unselected, so add it
                $scope.selectedRoles.push(role);
            }
        };

        $scope.getSavedRoles = function () {
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + '/role/getmyroles?id=' + $scope.data.user_id,
                method: "GET",
                data: {id: $scope.data.user_id}
            }).then(
                    function (response) {
                        $scope.selectedRoles = response.data.roles;
                    }
            );
        }

        $scope.reset = function () {
            $scope.errorData = "";
            $scope.selectedRoles = [];
            $scope.data = {};
        }
        
        $scope.reset();
    }]);
