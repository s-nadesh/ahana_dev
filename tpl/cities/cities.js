app.controller('CitiesController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$localStorage', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', function ($rootScope, $scope, $timeout, $http, $state, $localStorage, DTOptionsBuilder, DTColumnBuilder, $compile) {

        //Index Page
        $scope.loadCitiesList = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.rowCollection = [].concat($scope.rowCollection);  // displayed collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/city')
                    .success(function (cities) {
                        $scope.isLoading = false;
                        $scope.rowCollection = cities;
                        $scope.rowCollection = [].concat($scope.rowCollection);
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading cities!";
                    });
        };

        var vm = this;
        var token = $localStorage.user.access_token;
        vm.dtOptions = DTOptionsBuilder.newOptions()
                .withOption('ajax', {
                    // Either you specify the AjaxDataProp here
                    // dataSrc: 'data',
                    url: $rootScope.IRISOrgServiceUrl + '/city/getcities?access-token=' + token,
                    type: 'POST',
                    beforeSend: function (request) {
                        request.setRequestHeader("x-domain-path", $rootScope.clientUrl);
                    }
                })
                // or here
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('serverSide', true)
                .withOption('stateSave', true)
                .withOption('bLengthChange', true)
                .withOption('order', [0, 'asc'])
                .withPaginationType('full_numbers')
                .withOption('createdRow', createdRow);
        vm.dtColumns = [
            DTColumnBuilder.newColumn('city_name').withTitle('City Name'),
            DTColumnBuilder.newColumn('status').withTitle('Status').notSortable().renderWith(statusHtml),
            DTColumnBuilder.newColumn('tenant_id').withTitle('Tenant ID').notVisible(),
            DTColumnBuilder.newColumn('city_id').withTitle('City ID').notVisible(),
            DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionsHtml)
        ];

        function createdRow(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }

        vm.selected = {};
        function statusHtml(data, type, full, meta) {
            if (full.status === '1') {
                vm.selected[full.city_id] = true;
            } else {
                vm.selected[full.city_id] = false;
            }
            var model_name = "'" + "CoMasterCity" + "'";
            if (full.tenant_id) {
                return  '<label class="i-checks ">' +
                        '<input type="checkbox" ng-model="city.selected[' + full.city_id + ']" ng-change="updateStatus(' + model_name + ', ' + full.city_id + ')">' +
                        '<i></i>' +
                        '</label>';
            } else {
                return '';
            }
        }


        function actionsHtml(data, type, full, meta) {
            if (data.tenant_id) {
                return '<a class="label bg-dark" title="Edit" check-access  ui-sref="configuration.cityUpdate({id: ' + data.city_id + '})">' +
                        '   <i class="fa fa-pencil"></i>' +
                        '</a>&nbsp;&nbsp;&nbsp;' +
                        '<a class="hide" title="Delete" ng-click="removeRow(row)">' +
                        '   <i class="fa fa-trash"></i>' +
                        '</a>';
            } else {
                return '';
            }
        }

        //For Form
        $scope.initForm = function () {
            $scope.loadbar('show');
            $rootScope.commonService.GetCountryList(function (response) {
                $scope.countries = response.countryList;

                $rootScope.commonService.GetStateList(function (response) {
                    $scope.states = response.stateList;
                    $scope.loadbar('hide');

                    if ($scope.data.formtype == 'update') {
                        $scope.loadForm();
                    }
                });
            });

        }
        $scope.updateState = function () {
            $scope.availableStates = [];
            $scope.availableCities = [];

            _that = this;
            angular.forEach($scope.states, function (value) {
                if (value.countryId == _that.data.country_id) {
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
                if (value.stateId == _that.data.state_id) {
                    var obj = {
                        value: value.value,
                        label: value.label
                    };
                    $scope.availableCities.push(obj);
                }
            });
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/cities';
                method = 'POST';
                succ_msg = 'City saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/cities/' + _that.data.city_id;
                method = 'PUT';
                succ_msg = 'City updated successfully';
            }

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = succ_msg;
                        $scope.data = {};
                        $timeout(function () {
                            $state.go('configuration.cities');
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

        //Get Data for update Form
        $scope.loadForm = function () {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/cities/" + $state.params.id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;
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
        };

        //Delete
        $scope.removeRow = function (row) {
            var conf = confirm('Are you sure to delete ?');
            if (conf) {
                $scope.loadbar('show');
                var index = $scope.rowCollection.indexOf(row);
                if (index !== -1) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/city/remove",
                        method: "POST",
                        data: {id: row.city_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.rowCollection.splice(index, 1);
                                    $scope.loadCitiesList();
                                } else {
                                    $scope.errorData = response.data.message;
                                }
                            }
                    )
                }
            }
        };
    }]);