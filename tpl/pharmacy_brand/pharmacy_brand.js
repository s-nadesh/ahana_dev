app.controller('BrandsController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$localStorage', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', function ($rootScope, $scope, $timeout, $http, $state, $localStorage, DTOptionsBuilder, DTColumnBuilder, $compile) {

        //Index Page
        var pb = this;
        var token = $localStorage.user.access_token;
        pb.dtOptions = DTOptionsBuilder.newOptions()
                .withOption('ajax', {
                    url: $rootScope.IRISOrgServiceUrl + '/pharmacybrand/getbrands?access-token=' + token,
                    type: 'POST',
                    beforeSend: function (request) {
                        request.setRequestHeader("x-domain-path", $rootScope.clientUrl);
                    }
                })
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('serverSide', true)
                .withOption('bLengthChange', true)
                .withOption('order', [3, 'desc'])
                .withPaginationType('full_numbers')
                .withOption('createdRow', createdRow);
        pb.dtColumns = [
            DTColumnBuilder.newColumn('brand_name').withTitle('Brand Name'),
            DTColumnBuilder.newColumn('brand_code').withTitle('Brand Code'),
            DTColumnBuilder.newColumn('status').withTitle('Status').notSortable().renderWith(statusHtml),
            DTColumnBuilder.newColumn('brand_id').withTitle('Brand ID').notVisible(),
            DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionsHtml)
        ];

        function createdRow(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }

        pb.selected = {};
        function statusHtml(data, type, full, meta) {
            if (full.status === '1') {
                pb.selected[full.brand_id] = true;
            } else {
                pb.selected[full.brand_id] = false;
            }
            var model_name = "'" + "PhaBrand" + "'";
            return '<label class="i-checks ">' +
                    '<input type="checkbox" ng-model="phaBrands.selected[' + full.brand_id + ']" ng-change="updateStatus(' + model_name + ', ' + full.brand_id + ')">' +
                    '<i></i>' +
                    '</label>';
        }

        pb.brands = {};
        function actionsHtml(data, type, full, meta) {
            pb.brands[data.brand_id] = data;
            return '<a class="label bg-dark" title="Edit" check-access  ui-sref="configuration.brandUpdate({id: ' + data.brand_id + '})">' +
                    '   <i class="fa fa-pencil"></i>' +
                    '</a>&nbsp;&nbsp;&nbsp;' +
                    '<a class="hide" title="Delete" ng-click="removeRow(row)">' +
                    '   <i class="fa fa-trash"></i>' +
                    '</a>';
        }

        //For Form
        $scope.initForm = function () {
            $scope.data = {};
            $scope.data.formtype = 'add';
            $scope.data.status = '1';
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/pharmacybrands';
                method = 'POST';
                succ_msg = 'Brand saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/pharmacybrands/' + _that.data.brand_id;
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
                            $state.go('configuration.brand');
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
            $scope.data = {};
            $scope.loadbar('show');
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/pharmacybrands/" + $state.params.id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;
                        $scope.data.formtype = 'update';
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
                        url: $rootScope.IRISOrgServiceUrl + "/pharmacybrand/remove",
                        method: "POST",
                        data: {id: row.brand_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.displayedCollection.splice(index, 1);
                                    $scope.loadBrandsList();
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