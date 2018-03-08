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
app.controller('UserBranchesController', ['$scope', '$http', '$filter', '$state', '$rootScope', '$timeout', function ($scope, $http, $filter, $state, $rootScope, $timeout) {

        $scope.initData = function () {
            //Get my organization details
            $http({
                url: $rootScope.IRISOrgServiceUrl + '/organization/getorg',
                method: "GET"
            }).then(
                    function (response) {
                        if (response.data.success === true) {
                            $scope.organization = response.data.return;
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

            //Get Organization Branches
            $http({
                url: $rootScope.IRISOrgServiceUrl + '/organization/getorgbranches',
                method: "GET"
            }).then(
                    function (response) {
                        $scope.branches = {};
                        $scope.branches = response.data.branches;
                    }
            );
    
            $scope.reset();
        }

        $scope.selectedBranches = [];
        $scope.default_branch = '';
        $scope.toggleSelection = function (branch) {
            var index = $scope.selectedBranches.indexOfObjectWithProperty('tenant_id', branch.tenant_id);
            if (index > -1) {
                // Is currently selected, so remove it
                $scope.selectedBranches.splice(index, 1);
            }
            else {
                // Is currently unselected, so add it
                $scope.selectedBranches.push(branch);
            }
        };

        $scope.getSavedBranches = function () {
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            if ($scope.data.user_id === null) {
                $scope.reset();
            } else {
                $http({
                    url: $rootScope.IRISOrgServiceUrl + '/user/getmybranches?id=' + $scope.data.user_id,
                    method: "GET",
                }).then(
                        function (response) {
                            $scope.selectedBranches = [];
                            $scope.default_branch = '';
                            if (response.data.branches.length > 0) {
                                angular.forEach(response.data.branches, function (branch) {
                                    items = {
                                        'tenant_id': branch.branch_id,
                                    };
                                    $scope.selectedBranches.push(items);
                                })
                            }

                            if (response.data.default_branch) {
                                $scope.default_branch = response.data.default_branch;
                                items = {
                                    'tenant_id': response.data.default_branch,
                                };
                                $scope.selectedBranches.push(items);
                            }
                        }
                );
            }
        }

        //Save Data
        $scope.saveForm = function () {
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            $scope.branchList = [];

            angular.forEach($scope.selectedBranches, function (branch) {
                $scope.branchList.push(branch.tenant_id);
            });

            if (typeof this.data != "undefined") {
                this.data.branch_ids = [];
                this.data.branch_ids = $scope.branchList;
            }

            var _that = this;
            $scope.loadbar('show');
            $http({
                method: "POST",
                url: $rootScope.IRISOrgServiceUrl + '/user/assignbranches',
                data: _that.data,
            }).then(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.data.success === true) {
                            $scope.msg.successMessage = "Assigned successfully";
                        }
                        else {
                            $scope.errorData = response.data.message;
                        }
                    }
            )
        };

        $scope.reset = function () {
            $scope.default_branch = '';
            $scope.errorData = "";
            $scope.selectedBranches = [];
            $scope.data = {};
        }
    }]);
