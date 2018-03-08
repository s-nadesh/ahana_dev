app.controller('stockReportController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$anchorScroll', '$filter', '$timeout', function ($rootScope, $scope, $timeout, $http, $state, $anchorScroll, $filter, $timeout) {

        //For Datepicker
        $scope.open = function ($event, mode) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened1 = $scope.opened2 = false;
            switch (mode) {
                case 'opened1':
                    $scope.opened1 = true;
                    break;
                case 'opened2':
                    $scope.opened2 = true;
                    break;
            }
        };

        $scope.clearReport = function () {
            $scope.showTable = false;
            $scope.data = {};
            $scope.data.tenant_id = '';
            $scope.data.tenant_name = '';
            $scope.data.from = moment().format('YYYY-MM-DD');
        }

        $scope.initReport = function () {
            $scope.tenants = [];
            $rootScope.commonService.GetTenantList(function (response) {
                if (response.success == true) {
                    $scope.tenants = response.tenantList;
                }
            });
            $scope.clearReport();
        }

        $scope.selectTenantname = function () {
            $scope.data.tenant_name = $scope.tenants[$scope.data.tenant_id];
        }

        //Index Page
        $scope.loadReport = function () {
            $scope.showTable = false;
            $scope.records = [];
            $scope.loadbar('show');
            $scope.loading = true;
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            var data = {};
            if (typeof $scope.data.from !== 'undefined' && $scope.data.from != '') {
                $scope.data.from = moment($scope.data.from).format('YYYY-MM-DD');
                angular.extend(data, {from: moment($scope.data.from).format('YYYY-MM-DD')});
            }
            ;

            if (typeof $scope.data.tenant_id !== 'undefined' && $scope.data.tenant_id != '')
                angular.extend(data, {tenant_id: $scope.data.tenant_id});

            // Get data's from service
            $http.post($rootScope.IRISOrgServiceUrl + '/pharmacyreport/stockreport', data)
                    .success(function (response) {
                        $scope.loadbar('hide');
                        $scope.loading = false;
                        $scope.showTable = true;
                        $scope.records = response.stock_report;
                        $scope.generated_on = moment().format('YYYY-MM-DD hh:mm A');
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured";
                    });
        };

        $scope.exportData = function () {
            var blob = new Blob([document.getElementById('table').innerHTML], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
            });
            saveAs(blob, "stockReport.xls");
        };
        $scope.parseFloat = function (row) {
            if (row)
                return parseFloat(row);
            else
                return parseFloat(0);
        }

    }]);