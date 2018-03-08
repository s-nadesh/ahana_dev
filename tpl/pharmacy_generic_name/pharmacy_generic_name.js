app.controller('GenericNameController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$localStorage', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', function ($rootScope, $scope, $timeout, $http, $state, $localStorage, DTOptionsBuilder, DTColumnBuilder, $compile) {

        //Index Page
        $scope.loadGenericNamesList = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/genericname')
                    .success(function (genericnames) {
                        $scope.isLoading = false;
                        $scope.rowCollection = genericnames;
                        $scope.displayedCollection = [].concat($scope.rowCollection);

                        //Avoid pagination problem, when come from other pages.
                        $scope.footable_redraw();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading genericname!";
                    });
        };

        var vm = this;
        var token = $localStorage.user.access_token;
        vm.dtOptions = DTOptionsBuilder.newOptions()
                .withOption('ajax', {
                    // Either you specify the AjaxDataProp here
                    // dataSrc: 'data',
                    url: $rootScope.IRISOrgServiceUrl + '/genericname/getgenericname?access-token=' + token,
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
            DTColumnBuilder.newColumn('generic_name').withTitle('Generic Name'),
            DTColumnBuilder.newColumn('status').withTitle('Status').notSortable().renderWith(statusHtml),
            DTColumnBuilder.newColumn('generic_id').withTitle('Generic ID').notVisible(),
            DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionsHtml)
        ];

        function createdRow(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }

        vm.selected = {};
        function statusHtml(data, type, full, meta) {
            if (full.status === '1') {
                vm.selected[full.generic_id] = true;
            } else {
                vm.selected[full.generic_id] = false;
            }
            var model_name = "'" + "PhaGeneric" + "'";
            return  '<label class="i-checks ">' +
                    '<input type="checkbox" ng-model="generic.selected[' + full.generic_id + ']" ng-change="updateStatus(' + model_name + ', ' + full.generic_id + ')">' +
                    '<i></i>' +
                    '</label>';

        }


        function actionsHtml(data, type, full, meta) {
            return '<a class="label bg-dark" title="Edit" check-access  ui-sref="configuration.genericNameUpdate({id: ' + data.generic_id + '})">' +
                    '   <i class="fa fa-pencil"></i>' +
                    '</a>&nbsp;&nbsp;&nbsp;' +
                    '<a class="hide" title="Delete" ng-click="removeRow(row)">' +
                    '   <i class="fa fa-trash"></i>' +
                    '</a>';

        }
        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/genericnames';
                method = 'POST';
                succ_msg = 'GenericName saved successfully';

                angular.extend(_that.data, {patient_id: $scope.patientObj.patient_id});
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/genericnames/' + _that.data.generic_id;
                method = 'PUT';
                succ_msg = 'GenericName updated successfully';
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
                            $state.go('configuration.genericName');
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
                url: $rootScope.IRISOrgServiceUrl + "/genericnames/" + $state.params.id,
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
                        url: $rootScope.IRISOrgServiceUrl + "/genericname/remove",
                        method: "POST",
                        data: {id: row.alert_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.displayedCollection.splice(index, 1);
                                    $scope.loadGenericNamesList();
                                    $scope.msg.successMessage = 'GenericName Deleted Successfully';
                                } else {
                                    $scope.errorData = response.data.message;
                                }
                            }
                    )
                }
            }
        };
    }]);