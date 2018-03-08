app.controller('RolesController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'hotkeys', function ($rootScope, $scope, $timeout, $http, $state, hotkeys) {

        // when you bind it to the controller's scope, it will automatically unbind
        // the hotkey when the scope is destroyed (due to ng-if or something that changes the DOM)
        hotkeys.bindTo($scope)
                .add({
                    combo: 's',
                    description: 'Search',
                    callback: function (e) {
                        $('#filter').focus();
                        e.preventDefault();
                    }
                })
                .add({
                    combo: 'f5',
                    description: 'Create',
                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
                    callback: function () {
                        $state.go('configuration.role_create');
                    }
                })
                .add({
                    combo: 'f6',
                    description: 'Save',
                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
                    callback: function (e) {
                        submitted = true;
                        $scope.saveForm($scope.data.formrole);
                        e.preventDefault();
                    }
                })
                .add({
                    combo: 'f9',
                    description: 'List',
                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
                    callback: function (event) {
                        $state.go('configuration.roles')
                        event.preventDefault();
                    }
                });

        //For Form
        $scope.initForm = function () {
            $scope.data = {};
            $scope.data.status = '1';
            $scope.data.formrole = 'add';
        }

        //Index Page
        $scope.loadRolesList = function () {
            $scope.isLoading = true;
            $scope.rowCollection = [];

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/role')
                    .success(function (roles) {
                        $scope.isLoading = false;
                        $scope.rowCollection = roles;

                        //Avoid pagination problem, when come from other pages.
                        $scope.footable_redraw();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading roles!";
                    });
        };

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/roles/createrole';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/roles/updaterole';
            }

            $scope.loadbar('show');
            $http({
                method: "POST",
                url: post_url,
                data: _that.data,
            }).then(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.data.success === true) {

                            if (mode !== 'add') {
                                $scope.msg.successMessage = " Role updated successfully";
                                $timeout(function () {
                                    $state.go('configuration.roles');
                                }, 1000)
                            } else {
                                $scope.msg.successMessage = "Role saved successfully";
                                $timeout(function () {
                                    $scope.data = {};
                                    $state.go('configuration.roles');
                                }, 1000)
                            }
                        } else {
                            $scope.errorData = response.data.message;
                        }
                    }
            )
        };

        //Get Data for update Form
        $scope.loadForm = function () {
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/role/getrole?id=" + $state.params.id,
                method: "GET"
            }).then(
                    function (response) {
                        if (response.data.success === true) {
                            $scope.data = response.data.return;
                        } else {
                            $scope.errorData = response.data.message;
                        }
                    }
            )
        };

        //Delete
        $scope.removeRow = function (row) {
            var conf = confirm('Are you sure to delete ?');
            if (conf) {
                $scope.loadbar('show');
                var index = $scope.rowCollection.indexOf(row);
                if (index !== -1) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/role/remove",
                        method: "POST",
                        data: {id: row.role_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.msg.successMessage = row.description + " deleted successfully";
                                    $scope.rowCollection.splice(index, 1);
                                    $scope.loadRolesList();
                                } else {
                                    $scope.errorData = response.data.message;
                                }
                            }
                    )
                }
            }
        }
        ;
    }]);