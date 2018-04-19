app.controller('OrganizationController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$modal', '$log', function ($rootScope, $scope, $timeout, $http, $state, $modal, $log) {

        //Index Page
        //  pagination
        $scope.loadOrganizationsList = function () {
            $scope.isLoading = true;
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10;
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection
            // Display Data
            $http.get($rootScope.IRISAdminServiceUrl + '/organization/getorglist')
                    .success(function (usr) {
                        $scope.isLoading = false;
                        $scope.rowCollection = usr;
                        $scope.displayedCollection = [].concat($scope.rowCollection);
                    })
                    .error(function () {
                        $scope.error = "An Error has occured while loading posts!";

                    });
        }


        // Form Page
        $scope.initForm = function () {
            $scope.loadbar('show');
            $rootScope.commonService.GetCountryList(function (response) {
                $scope.countries = response.countryList;

                $rootScope.commonService.GetStateList(function (response) {
                    $scope.states = response.stateList;

                    $rootScope.commonService.GetCityList(function (response) {
                        $scope.cities = response.cityList;

                        $rootScope.commonService.GetTitleCodes(function (response) {
                            $scope.title_codes = response;

                            $scope.loadbar('hide');
                            if ($state.current.name == 'app.org_edit') {
                                $scope.loadForm();
                            }
                            if ($state.current.name == 'app.branch_add' || $state.current.name == 'app.branch_edit') {
                                $scope.loadOrg();
                            }
                        });
                    });
                });
            });
        }

        if ($state.current.name == 'app.org_new') {
            $http.get($rootScope.IRISAdminServiceUrl + "/default/get-module-tree").then(
                    function (response) {
                        $scope.modules = response.data.moduleList;
                    }
            );
        }


        $scope.updateState = function () {
            $scope.availableStates = [];
            $scope.availableCities = [];

            _that = this;
            angular.forEach($scope.states, function (value) {
                if (value.countryId == _that.data.Tenant.tenant_country_id) {
                    var obj = {
                        value: value.value,
                        label: value.label
                    };
                    $scope.availableStates.push(obj);
                }
            });
        }

        $scope.updateCity = function () {
            $scope.availableCities = [];

            _that = this;
            angular.forEach($scope.cities, function (value) {
                if (value.stateId == _that.data.Tenant.tenant_state_id) {
                    var obj = {
                        value: value.value,
                        label: value.label
                    };
                    $scope.availableCities.push(obj);
                }
            });
        }

        $scope.updateState2 = function () {
            $scope.availableStates2 = [];
            $scope.availableCities2 = [];

            _that = this;
            angular.forEach($scope.states, function (value) {
                if (value.countryId == _that.data.User.country_id) {
                    var obj = {
                        value: value.value,
                        label: value.label
                    };
                    $scope.availableStates2.push(obj);
                }
            });
        }

        $scope.updateCity2 = function () {
            $scope.availableCities2 = [];

            _that = this;
            angular.forEach($scope.cities, function (value) {
                if (value.stateId == _that.data.User.state_id) {
                    var obj = {
                        value: value.value,
                        label: value.label
                    };
                    $scope.availableCities2.push(obj);
                }
            });
        }

        sanitizeVariable = function (data) {
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

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.successMessage = "";
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

            if (mode == 'add') {
                post_url = $rootScope.IRISAdminServiceUrl + '/organization/createorg';
                post_data = _that.data;
            } else {
                post_url = $rootScope.IRISAdminServiceUrl + '/organization/updateorg';
                post_data = this.data;
            }

            if (mode == 'add') {
                $scope.loadbar('show');
                $scope.form_status = 'Please Wait... DB Structure initializing...';
                $http({
                    method: "POST",
                    url: $rootScope.IRISAdminServiceUrl + '/organization/createdb',
                    data: post_data,
                }).then(
                        function (response) {
                            $scope.form_status = 'Please Wait... Organization Creating...';
                            $scope.loadbar('hide');
                            $scope.postForm(post_url, post_data, mode);
                        }
                )
            } else {
                $scope.postForm(post_url, post_data, mode);
            }

        };

        $scope.postForm = function (post_url, post_data, mode) {
            $scope.loadbar('show');
            $http({
                method: "POST",
                url: post_url,
                data: post_data,
            }).then(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.form_status = '';
                        if (response.data.success === true) {

                            if (mode !== 'add') {
                                $scope.successMessage = mode + " updated successfully";
                                $timeout(function () {
                                    $state.go('app.org_list');
                                }, 1000)
                            } else {
                                $scope.steps.percent = 100;
                                $scope.successMessage = "Organization saved successfully";
                                $scope.data = {};
                                $timeout(function () {
                                    $state.go('app.org_list');
                                }, 1000)
                            }
                        } else {
                            $scope.errorData = response.data.message;
                        }
                    }
            )
        }

        $scope.updateValidateForm = function (mode, next_step) {
            _that = this;
            post_data = [];

            $scope.errorData = "";
            $scope.successMessage = "";

            if (typeof this.data != "undefined") {
                if (mode == 'Organization') {
                    post_data = {Organization: sanitizeVariable(this.data.Organization)};
                } else if (mode == 'Role') {
                    post_data = {Role: sanitizeVariable(this.data.Role)};
                } else if (mode == 'Login') {
                    post_data = {Login: sanitizeVariable(this.data.Login)};
                } else if (mode == 'User') {
                    post_data = {User: sanitizeVariable(this.data.User)};
                } else if (mode == 'RoleLogin') {
                    post_data = {Role: sanitizeVariable(this.data.Role), Login: sanitizeVariable(this.data.Login), RoleLogin: true};
                }
            }
            $http({
                method: "POST",
                url: $rootScope.IRISAdminServiceUrl + '/organization/updatevalidate',
                data: post_data,
            }).then(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.data.success === false) {
                            $scope.errorData = response.data.message;
                        } else {
                            switch (next_step) {
                                case 2:
                                    $scope.steps.step2 = true;
                                    element = $('#role_desc');
                                    break;
                                case 3:
                                    $scope.steps.step3 = true;
                                    break;
                                case 4:
                                    $scope.steps.step4 = true;
                                    break;
                            }
                            $timeout(function () {
                                if (typeof element != 'undefined') {
                                    element.focus();
                                    element.select();
                                }
                            }, 1000);
                        }
                    }
            )
        }

        $scope.validateForm = function (mode, next_step) {
            _that = this;
            post_data = [];

            $scope.errorData = "";
            $scope.successMessage = "";

            if (typeof this.data != "undefined") {
                if (mode == 'Organization') {
                    post_data = {Organization: sanitizeVariable(this.data.Organization)};
                } else if (mode == 'Role') {
                    post_data = {Role: sanitizeVariable(this.data.Role)};
                } else if (mode == 'Login') {
                    post_data = {Login: sanitizeVariable(this.data.Login)};
                } else if (mode == 'User') {
                    post_data = {User: sanitizeVariable(this.data.User)};
                } else if (mode == 'RoleLogin') {
                    post_data = {Role: sanitizeVariable(this.data.Role), Login: sanitizeVariable(this.data.Login), RoleLogin: true};
                }
            }

            if (typeof (_that.data) != "undefined") {
                if (_that.data.hasOwnProperty('Organization')) {
                    var clientUrl = this.data.Organization.org_domain;
                    $http.defaults.headers.common['x-domain-path'] = clientUrl;
                }
            }

            $scope.loadbar('show');
            $http({
                method: "POST",
                url: $rootScope.IRISAdminServiceUrl + '/organizations/validateorg',
                data: post_data,
            }).then(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.data.success === false) {
                            $scope.errorData = response.data.message;
                        } else {
                            switch (next_step) {
                                case 2:
                                    $scope.steps.step2 = true;
                                    element = $('#role_desc');
                                    break;
                                case 3:
                                    $scope.steps.step3 = true;
                                    break;
                                case 4:
                                    $scope.steps.step4 = true;
                                    break;
                            }
                            $timeout(function () {
                                if (typeof element != 'undefined') {
                                    element.focus();
                                    element.select();
                                }
                            }, 1000);
                        }
                    }
            )
        };

        //Get Data for update Form
        $scope.loadForm = function () {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISAdminServiceUrl + "/organization/getorg?id=" + $state.params.id,
                method: "GET"
            }).then(
                    function (response) {
                        if (response.data.success === true) {
                            _that.data = response.data.return;
                            $scope.updateState2();
                            $scope.updateCity2();
                            $scope.data.User.country_id = parseInt(_that.data.User.country_id);
                            $scope.data.User.state_id = parseInt(_that.data.User.state_id);
                            $scope.data.User.city_id = parseInt(_that.data.User.city_id);
                            $scope.data.User.user_id = parseInt(_that.data.User.user_id);
//                            $http.get($rootScope.IRISAdminServiceUrl + "/default/get-module-tree").then(
//                                    function (response) {
//                                        $scope.modules = response.data.moduleList;
//                                    }
//                            );
                            $scope.loadbar('hide');
                        } else {
                            $scope.errorData = response.data;
                        }
                    }
            )
        };

        $scope.removeRow = function (row) {
            var index = $scope.rowCollectionBasic.indexOf(row);
            if (index !== -1) {
                $scope.rowCollectionBasic.splice(index, 1);
            }
        };

        $scope.setFocus = function (step) {
            switch (step) {
                case 1:
                    element = $('#tenant_name');
                    break;
                case 2:
                    element = $('#role_desc');
                    break;
                case 5:
                    element = $('#user_name');
                    break;
            }
            $timeout(function () {
                if (typeof element != 'undefined') {
                    element.focus();
//                    element.select();
                }
            }, 1000);
        }

        $scope.ctrl = {};
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };

        //Save Both Add & Update Data
        $scope.saveBranch = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISAdminServiceUrl + '/organizations';
                method = 'POST';
                succ_msg = 'Branch saved successfully';

                if (typeof _that.data.Tenant != 'undefined')
                    angular.extend(_that.data.Tenant, {org_id: parseInt($state.params.org_id)});
            } else {
                post_url = $rootScope.IRISAdminServiceUrl + '/organizations/' + _that.data.Tenant.tenant_id;
                method = 'PUT';
                succ_msg = 'Branch updated successfully';
            }

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data.Tenant,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.successMessage = succ_msg;
                        $scope.data = {};
                        $timeout(function () {
                            $state.go('app.org_list');
                        }, 1000)

                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        $scope.loadOrg = function () {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISAdminServiceUrl + "/organizations/getorganization?id=" + $state.params.org_id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.organization = response;
                        $scope.loadbar('hide');

                        $http.defaults.headers.common['x-domain-path'] = response.org.org_domain;

                        if ($scope.data.form_type == 'update') {
                            $scope.loadbar('show');
                            $http({
                                url: $rootScope.IRISAdminServiceUrl + "/organizations/" + $state.params.id,
                                method: "GET"
                            }).success(
                                    function (response) {
                                        $scope.loadbar('hide');
                                        _that.data.Tenant = response;
                                        $scope.updateState();
                                        $scope.updateCity();
                                    }
                            ).error(function (data, status) {
                                $scope.loadbar('hide');
                                if (status == 422)
                                    $scope.errorData = $scope.errorSummary(data);
                                else
                                    $scope.errorData = data.message;
                            });
                        }
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.modalDetails = {};

        $scope.open = function (size, ctrlr, tmpl, mode) {
            $scope.modalDetails.mode = mode;

            if ($scope.modalDetails.mode == 'branch') {
                if (typeof $scope.data.Tenant == 'undefined') {
                    $scope.data.Tenant = {};
                }
                $scope.modalDetails.country_id = $scope.data.Tenant.tenant_country_id;
                $scope.modalDetails.state_id = $scope.data.Tenant.tenant_state_id;
            } else if ($scope.modalDetails.mode == 'tenant') {
                if (typeof $scope.data.User == 'undefined') {
                    $scope.data.User = {};
                }
                $scope.modalDetails.country_id = $scope.data.User.country_id;
                $scope.modalDetails.state_id = $scope.data.User.state_id;
            }
            var modalInstance = $modal.open({
                templateUrl: tmpl,
                controller: ctrlr,
                size: size,
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                    country_id: function () {
                        return $scope.modalDetails.country_id;
                    },
                    state_id: function () {
                        return $scope.modalDetails.state_id;
                    },
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.afterCountryAdded = function (country_id) {
            if ($scope.modalDetails.mode == 'branch') {
                if (typeof $scope.data.Tenant == 'undefined') {
                    $scope.data.Tenant = {};
                }
                $scope.data.Tenant.tenant_country_id = country_id;
                $scope.updateState();
            } else if ($scope.modalDetails.mode == 'tenant') {
                if (typeof $scope.data.User == 'undefined') {
                    $scope.data.User = {};
                }
                $scope.data.User.country_id = country_id;
                $scope.updateState2();
            }
        }

        $scope.afterStateAdded = function (state_id) {
            if ($scope.modalDetails.mode == 'branch') {
                if (typeof $scope.data.Tenant == 'undefined') {
                    $scope.data.Tenant = {};
                }
                $scope.data.Tenant.tenant_state_id = state_id;
                $scope.updateState();
            } else if ($scope.modalDetails.mode == 'tenant') {
                if (typeof $scope.data.User == 'undefined') {
                    $scope.data.User = {};
                }
                $scope.data.User.state_id = state_id;
                $scope.updateState2();
            }
        }

        $scope.afterCityAdded = function (city_id) {
            if ($scope.modalDetails.mode == 'branch') {
                if (typeof $scope.data.Tenant == 'undefined') {
                    $scope.data.Tenant = {};
                }
                $scope.data.Tenant.tenant_city_id = city_id;
                $scope.updateCity();
            } else if ($scope.modalDetails.mode == 'tenant') {
                if (typeof $scope.data.User == 'undefined') {
                    $scope.data.User = {};
                }
                $scope.data.User.city_id = city_id;
                $scope.updateCity2();
            }
        }
    }]);