app.controller('DrugClassController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$localStorage', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', function ($rootScope, $scope, $timeout, $http, $state, $localStorage, DTOptionsBuilder, DTColumnBuilder, $compile) {

        //Index Page
        $scope.loadDrugClassList = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacydrugclass')
                    .success(function (alerts) {
                        $scope.isLoading = false;
                        $scope.rowCollection = alerts;
                        $scope.displayedCollection = [].concat($scope.rowCollection);
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading drugclass!";
                    });
        };

        var vm = this;
        var token = $localStorage.user.access_token;
        vm.dtOptions = DTOptionsBuilder.newOptions()
                .withOption('ajax', {
                    // Either you specify the AjaxDataProp here
                    // dataSrc: 'data',
                    url: $rootScope.IRISOrgServiceUrl + '/pharmacydrugclass/getdrugclass?access-token=' + token,
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
                .withOption('order', [0, 'desc'])
                .withPaginationType('full_numbers')
                .withOption('createdRow', createdRow);
        vm.dtColumns = [
            DTColumnBuilder.newColumn('drug_name').withTitle('Drug Name'),
            DTColumnBuilder.newColumn('status').withTitle('Status').notSortable().renderWith(statusHtml),
            DTColumnBuilder.newColumn('drug_class_id').withTitle('Drug Class ID').notVisible(),
            DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionsHtml)
        ];

        function createdRow(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }

        vm.selected = {};
        function statusHtml(data, type, full, meta) {
            if (full.status === '1') {
                vm.selected[full.drug_class_id] = true;
            } else {
                vm.selected[full.drug_class_id] = false;
            }
            var model_name = "'" + "PhaDrugClass" + "'";
            return  '<label class="i-checks ">' +
                    '<input type="checkbox" ng-model="drugclass.selected[' + full.drug_class_id + ']" ng-change="updateStatus(' + model_name + ', ' + full.drug_class_id + ')">' +
                    '<i></i>' +
                    '</label>';

        }


        function actionsHtml(data, type, full, meta) {
            return '<a class="label bg-dark" title="Edit" check-access  ui-sref="configuration.drugclassUpdate({id: ' + data.drug_class_id + '})">' +
                    '   <i class="fa fa-pencil"></i>' +
                    '</a>&nbsp;&nbsp;&nbsp;' +
                    '<a class="hide" title="Delete" ng-click="removeRow(row)">' +
                    '   <i class="fa fa-trash"></i>' +
                    '</a>';

        }
        
        //For Form
        $scope.initForm = function () {
//            $rootScope.commonService.GetBrandList('', '1', false, function (response) {
//                $scope.alerts = response.alertList;
//            });
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/pharmacydrugclasses';
                method = 'POST';
                succ_msg = 'Brand saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/pharmacydrugclasses/' + _that.data.drug_class_id;
                method = 'PUT';
                succ_msg = 'Brand updated successfully';
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
                            $state.go('configuration.drugclass');
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
                url: $rootScope.IRISOrgServiceUrl + "/pharmacydrugclasses/" + $state.params.id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;
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
                        url: $rootScope.IRISOrgServiceUrl + "/pharmacydrugclass/remove",
                        method: "POST",
                        data: {id: row.drug_class_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.displayedCollection.splice(index, 1);
                                    $scope.loadDrugClassList();
                                    $scope.msg.successMessage = 'Brand Deleted Successfully';
                                }
                                else {
                                    $scope.errorData = response.data.message;
                                }
                            }
                    )
                }
            }
        };
    }]);