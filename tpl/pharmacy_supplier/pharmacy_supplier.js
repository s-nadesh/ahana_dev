app.controller('SuppliersController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$localStorage', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', function ($rootScope, $scope, $timeout, $http, $state, $localStorage, DTOptionsBuilder, DTColumnBuilder, $compile) {

        //Index Page
        $scope.loadSuppliersList = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacysupplier')
                    .success(function (alerts) {
                        $scope.isLoading = false;
                        $scope.rowCollection = alerts;
                        $scope.displayedCollection = [].concat($scope.rowCollection);

                        //Avoid pagination problem, when come from other pages.
                        $scope.footable_redraw();
                    })
                    .error(function () {
                        $scope.error = "An Error has occured while loading supplier!";
                    });
        };


        var pb = this;
        var token = $localStorage.user.access_token;
        pb.dtOptions = DTOptionsBuilder.newOptions()
                .withOption('ajax', {
                    url: $rootScope.IRISOrgServiceUrl + '/pharmacysupplier/getsupplierdetails?access-token=' + token,
                    type: 'POST',
                    beforeSend: function (request) {
                        request.setRequestHeader("x-domain-path", $rootScope.clientUrl);
                    }
                })
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('serverSide', true)
                .withOption('stateSave', true)
                .withOption('bLengthChange', true)
                .withPaginationType('full_numbers')
                .withOption('createdRow', createdRow);
        pb.dtColumns = [
            DTColumnBuilder.newColumn('supplier_name').withTitle('Supplier name'),
            DTColumnBuilder.newColumn('supplier_mobile').withTitle('Mobile'),
            DTColumnBuilder.newColumn('cst_no').withTitle('CST No'),
            DTColumnBuilder.newColumn('tin_no').withTitle('TIN No'),
            DTColumnBuilder.newColumn('status').withTitle('Status').notSortable().renderWith(statusHtml),
            DTColumnBuilder.newColumn('supplier_id').withTitle('supplier_id').notVisible(),
            DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionsHtml)
        ];

        function createdRow(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }

        pb.selected = {};
        function statusHtml(data, type, full, meta) {
            if (full.status === '1') {
                pb.selected[full.supplier_id] = true;
            } else {
                pb.selected[full.supplier_id] = false;
            }
            var model_name = "'" + "PhaSupplier" + "'";
            return '<label class="i-checks ">' +
                    '<input type="checkbox" ng-model="supplier.selected[' + full.supplier_id + ']" ng-change="updateStatus(' + model_name + ', ' + full.supplier_id + ')">' +
                    '<i></i>' +
                    '</label>';
        }

        pb.brands = {};
        function actionsHtml(data, type, full, meta) {
            pb.brands[data.supplier_id] = data;
            return '<a class="label bg-dark" title="Edit" check-access  ui-sref="configuration.supplierUpdate({id: ' + data.supplier_id + '})">' +
                    '   <i class="fa fa-pencil"></i>' +
                    '</a>&nbsp;&nbsp;&nbsp;' +
                    '<a class="hide" title="Delete" ng-click="removeRow(row)">' +
                    '   <i class="fa fa-trash"></i>' +
                    '</a>';
        }

        //For Form
        $scope.initForm = function () {
            $rootScope.commonService.GetCountryList(function (response) {
                $scope.countries = response.countryList;
                $scope.loadbar('hide');
                if ($scope.data.formtype == 'update') {
                    $scope.loadForm();
                }
            });
        }

        $scope.updateState2 = function () {
            $scope.availableStates2 = [];
            $scope.availableCities2 = [];
            
            _that = this;
            if(_that.data.country_id!='' && _that.data.country_id!=null)
            {
                $rootScope.commonService.GetStateList(function (response) {
                    angular.forEach(response.stateList, function (value) {
                    var obj = {
                        value: value.value,
                        label: value.label
                    };
                    $scope.availableStates2.push(obj);
                    
                    });
                },_that.data.country_id);

            }
        }

        $scope.updateCity2 = function () {
            $scope.availableCities2 = [];

            _that = this;
            if(_that.data.state_id!='' && _that.data.state_id!=null)
            {
                $rootScope.commonService.GetCityList(function (response) {
                    angular.forEach(response.cityList, function (value) {
                    var obj = {
                        value: value.value,
                        label: value.label
                    };
                    $scope.availableCities2.push(obj);
                    });
                },$scope.data.state_id);
            }
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/pharmacysuppliers';
                method = 'POST';
                succ_msg = 'Supplier saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/pharmacysuppliers/' + _that.data.supplier_id;
                method = 'PUT';
                succ_msg = 'Supplier updated successfully';
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
                            $state.go('configuration.supplier');
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
                url: $rootScope.IRISOrgServiceUrl + "/pharmacysuppliers/" + $state.params.id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;
                        $scope.updateState2();
                        $scope.updateCity2();
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
                var index = $scope.displayedCollection.indexOf(row);
                if (index !== -1) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/pharmacysupplier/remove",
                        method: "POST",
                        data: {id: row.supplier_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.displayedCollection.splice(index, 1);
                                    $scope.loadSuppliersList();
                                    $scope.msg.successMessage = 'Supplier Deleted Successfully';
                                } else {
                                    $scope.errorData = response.data.message;
                                }
                            }
                    )
                }
            }
        };
    }]);