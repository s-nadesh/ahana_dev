'use strict';
/* Controllers */
app.controller('RolesResourceController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$anchorScroll', function ($rootScope, $scope, $timeout, $http, $state, $anchorScroll) {

//sanitize all the variables
        $scope.sanitizeVariable = function (data) {
            var result = {};
            angular.forEach(data, function (value, key) {
                if (typeof value == "undefined") {
                    result[key] = '';
                } else {
                    result[key] = value;
                }
            }, result);
            return result;
        }

        $http({
            url: $rootScope.IRISAdminServiceUrl + "/organizations/getorganization?id=" + $state.params.id,
            method: "GET"
        }).success(
                function (response) {
                    $scope.organization = response.org;
                    $http.defaults.headers.common['x-domain-path'] = response.org.org_domain;
                    //Get Organization active roles
                    $http({
                        url: $rootScope.IRISAdminServiceUrl + "/organizations/getsuperrole?id=" + $state.params.id,
                        method: "GET"
                    }).then(
                            function (response) {
                                if (response.data.success === true) {
                                    $scope.roles = response.data.roles;
                                } else {
                                    $scope.errorData = response.data.message;
                                }
                            }
                    );
                }
        ).error(function (data, status) {
            $scope.loadbar('hide');
            if (status == 422)
                $scope.errorData = $scope.errorSummary(data);
            else
                $scope.errorData = data.message;
        });

        //Get Rolewise rights
        $scope.getSavedRights = function () {
            $scope.errorData = "";
            $scope.loadbar('show');
            angular.extend(this.data, {
                tenant_id: $scope.roles[0].tenant_id,
            });

            $http({
                method: "POST",
                url: $rootScope.IRISAdminServiceUrl + '/organizations/getorgmodulesbyrole',
                data: this.data,
            }).then(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.data.success === true) {
                            $scope.modules = response.data.modules;
                            $timeout(function () {
                                $(".ivh-treeview-checkbox").each(function () {
                                    if ($(this).is(":checkbox:checked")) {
                                        $(this).prop("disabled", true);
                                    }
                                });
                            }, 1000);
                        } else {
                            $scope.errorData = response.data.message;
                        }
                    }
            )
        }

        // Assign Role rights 
        $scope.saveRoleRights = function () {
            $scope.errorData = "";
            //$scope.msg.successMessage = "";
            $scope.moduleList = [];
            angular.forEach($scope.modules, function (parent) {
                if (parent.selected == true || parent.__ivhTreeviewIndeterminate == true) {
                    $scope.moduleList.push(parent.value);
                    angular.forEach(parent.children, function (child) {
                        if (child.selected == true || child.__ivhTreeviewIndeterminate == true)
                            $scope.moduleList.push(child.value);
                        angular.forEach(child.children, function (child2) {
                            if (child2.selected == true || child2.__ivhTreeviewIndeterminate == true)
                                $scope.moduleList.push(child2.value);
                            angular.forEach(child2.children, function (child3) {
                                if (child3.selected == true || child3.__ivhTreeviewIndeterminate == true)
                                    $scope.moduleList.push(child3.value);
                            });
                        });
                    });
                }
            });
            if (typeof this.data != "undefined") {
                this.data.Module = [];
                this.data.Module = {'resource_ids': $scope.moduleList};
            }

            this.data.Module['role_id'] = this.data.role_id;
            this.data.Module['tenant_id'] = $scope.roles[0].tenant_id;
//            this.data.Module['tenant_id'] = this.data.tenant_id;

            var post_data = {Module: $scope.sanitizeVariable(this.data.Module)};
            $scope.loadbar('show');
            $http({
                method: "POST",
                url: $rootScope.IRISAdminServiceUrl + '/organization/updaterolerights',
                data: post_data,
            }).then(
                    function (response) {
                        $scope.loadbar('hide');
                        $anchorScroll();
                        if (response.data.success === true) {
                            $scope.successMessage = "Role rights saved successfully";
                            $scope.data = {};
//                            $scope.modules = {};
                            $timeout(function () {
                                $state.go('app.org_list');
                            }, 1000)
                        } else {
                            $scope.errorData = response.data.message;
                        }
                    }
            )
        };
    }]);
